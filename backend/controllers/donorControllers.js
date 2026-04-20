const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");
const { ALGERIA_WILAYAS } = require('../utils/constants');
const { createEligibilityNotification } = require("./notificationController");

const pendingDonors = new Map();

setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [email, data] of pendingDonors.entries()) {
        if (data.expiresAt < now) {
            pendingDonors.delete(email);
            cleanedCount++;
        }
    }
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired pending registrations`);
    }
}, 60 * 1000);

const addDonor = async (req, res) => {
    try {
        const {
            full_name,
            blood_type,
            telephon,
            email,
            password,
            location,
            date_of_birth,
            available
        } = req.body;

        if (!/^[A-Za-z\s]+$/.test(full_name)) {
            return res.status(400).json({ message: "Invalid full name" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (!/^\d{10}$/.test(telephon)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

       
    const wilayaNumber = parseInt(location);

    if (!ALGERIA_WILAYAS.includes(wilayaNumber)) {
        return res.status(400).json({ 
message: "Invalid location. Please select a valid wilaya number between 1 and 58."        });
    }

    const emailCheckQuery = `SELECT email FROM donors WHERE email = ?`;
const emailExists = await new Promise((resolve) => {
    db.query(emailCheckQuery, [email], (err, result) => {
        resolve(result && result.length > 0);
    });
});

if (emailExists) {
    return res.status(400).json({
        message: "Email already registered"
    });
}

const phoneCheckQuery = `SELECT telephon FROM donors WHERE telephon = ?`;
const phoneExists = await new Promise((resolve) => {
    db.query(phoneCheckQuery, [telephon], (err, result) => {
        resolve(result && result.length > 0);
    });
});

if (phoneExists) {
    return res.status(400).json({
        message: "Phone already registered"
    });
}

     const hashedPassword = await bcrypt.hash(password, 10); 

     const verification_code = Math.floor(100000 + Math.random() * 900000).toString();

             const emailSent = await sendVerificationEmail(email, verification_code);

                     if (!emailSent) {
            return res.status(500).json({ 
                message: "Failed to send verification email. Please check your email address and try again",
                success: false
            });
        }

pendingDonors.set(email, {
    full_name,
    blood_type,
    telephon,
    email,
    hashedPassword,
    location: wilayaNumber,
    date_of_birth,
    available,
    verification_code,
    expiresAt: Date.now() + 60 * 1000
});


         res.status(200).json({ 
            message: "✓ Verification code sent to your email. Please check your inbox.",
            email: email,
            expiresIn: "1 minutes",
            nextStep: "POST /api/donors/verify with your email and code"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateDonor = async (req, res) => {
    try {
const { id } = req.params;
      const {
            full_name,
            blood_type,
            telephon,
            email,
            password,
            location,
            date_of_birth,
            available
        } = req.body;

        if (full_name && !/^[A-Za-z\s]+$/.test(full_name)) {
            return res.status(400).json({ message: "Invalid full name format" });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        if (telephon && !/^\d{10}$/.test(telephon)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        if (location) {
            const wilayaNumber = parseInt(location);
            if (!ALGERIA_WILAYAS.includes(wilayaNumber)) {
                return res.status(400).json({ 
                    message: "Invalid location. Please select a valid wilaya number between 1 and 58." 
                });
            }
        }

        let hashedPassword = password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

const query = `
    UPDATE donors 
    SET 
        full_name = COALESCE(?, full_name), 
        blood_type = COALESCE(?, blood_type), 
        telephon = COALESCE(?, telephon), 
        email = COALESCE(?, email), 
        password = COALESCE(?, password),
        location = COALESCE(?, location), 
        date_of_birth = COALESCE(?, date_of_birth),
        available = COALESCE(?, available)
    WHERE id = ?
`;

        db.query(query,
            [
                full_name || null, 
                blood_type || null, 
                telephon || null, 
                email || null, 
                hashedPassword,
                location || null, 
                date_of_birth || null, 
                available !== undefined ? available : null, 
                id
            ],
            (err, result) => {
                if (err) {
                    console.error("Database Error:", err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Email or phone already exists" });
                    }
                    return res.status(500).json({ message: "Error updating donor data" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Donor not found" });
                }

                res.json({ message: "Donor updated successfully!" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internel Server Error" });
    }
};


function deactivateDonor(req, res) {
    const donorId = req.params.id;

    const sql = "UPDATE donors SET is_active = 0 WHERE id = ?";

    db.query(sql, [donorId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        return res.json({ message: "Account deactivated successfully" });
    });
}

const verifyAndSaveDonor = (req, res) => {

    const { email, verification_code } = req.body;

    if (!email || !verification_code) {
        return res.status(400).json({
            message: "Email and code are required"
        });
    }

    const pending = pendingDonors.get(email);

    if (!pending) {
        return res.status(404).json({
            message: "No pending donor registration found. Please register again.",
            hint: "Verification code expires after 1 minute"
        });
    }

    if (pending.expiresAt < Date.now()) {
        pendingDonors.delete(email);
        return res.status(400).json({
            message: "Verification code has expired. Please register again.",
            reason: "Code is only valid for 1 minute"
        });
    }

    if (pending.verification_code !== verification_code) {
        return res.status(400).json({
            message: "Invalid verification code. Please try again.",
            attempts: "You have limited attempts"
        });
    }

    const query = `
        INSERT INTO donors
        (full_name, blood_type, telephon, email, password, location, date_of_birth, available, verification_code, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            pending.full_name,
            pending.blood_type,
            pending.telephon,
            email,
            pending.hashedPassword,
            pending.location,
            pending.date_of_birth,
            pending.available,
            pending.verification_code,
            true
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: "Email or phone already exists"
                    });
                }
                return res.status(500).json({
                    message: "Error saving donor to database"
                });
            }

            pendingDonors.delete(email);

            res.status(201).json({
                message: "✓ Donor registration completed successfully!",
                donorId: result.insertId,
                donor: {
                    id: result.insertId,
                    full_name: pending.full_name,
                    blood_type: pending.blood_type,
                    email: email
                },
                savedToDatabase: true
            });
        }
    );
};


const resendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const pending = pendingRegistrations.get(email);

    if (!pending) {
        return res.status(404).json({ 
            message: "No pending registration found. Please register again."
        });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.verification_code = newCode;
    pending.expiresAt = Date.now() + (60 * 1000);  
    pendingRegistrations.set(email, pending);

    const emailSent = await sendVerificationEmail(email, newCode);

    if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
    }

    res.json({ 
        message: "✓ New verification code sent to your email",
        expiresIn: "1 minutes"
    });
};

const searchDonors = (req, res) => {

    const { blood_type, location } = req.body;

    const sql = `
        SELECT full_name, telephon, blood_type, location
        FROM donors
        WHERE blood_type = ? AND location = ?
    `;

    db.query(sql, [blood_type, location], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur dans la recherche"
            });
        }

        res.status(200).json({
            success: true,
            donors: result
        });
    });
};

const getAllDonors = (req, res) => {

const sql = `
SELECT *
FROM donors
`;

db.query(sql, (err, result) => {

if (err) {
return res.status(500).json({
message: "Error retrieving donors"
});
}

res.status(200).json({
success: true,
donors: result
});

});

};

const loginDonor = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM donors WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }
        const donor = result[0];
        const match = await bcrypt.compare(password, donor.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }

        if (!donor.is_verified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        const token = jwt.sign(
            { id: donor.id, email: donor.email }, 
            process.env.ESI_SBA_SECRET_KEY,                
            { expiresIn: '24h' }      
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            donor: {
                id: donor.id,
                full_name: donor.full_name,
                email: donor.email,
                telephon: donor.telephon,
                blood_type: donor.blood_type,
                location: donor.location
            }
        });

    });
};

const logoutDonor = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });

};

const activateDonor = (req, res) => {
    const { id } = req.params;

    db.query(
        "UPDATE donors SET available = 1 WHERE id = ?",
        [id],
        (err, result) => {

            if (err) return res.status(500).json({ message: "error" });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Donor not found" });
            }

            res.json({ message: "Donor activated successfully" });
        }
    );
};

const disactivateDonor = (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE donors 
        SET available = 0
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        callback(err, result);
    });
};


const getDonorProfile = (req, res) => {

    const { id } = req.params;

    const sql = "SELECT * FROM donors WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) return res.status(500).json({ message: "error" });

        if (result.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        const donor = result[0];

        createEligibilityNotification(donor);

        res.json(donor);
    });
};


module.exports = { deactivateDonor,
                   addDonor,
                   updateDonor ,
                   verifyAndSaveDonor,
                   searchDonors,
                   getAllDonors,
                   loginDonor,
                   logoutDonor,
                   getDonorProfile,
                   activateDonor,
                   disactivateDonor,
                   resendCode
         }; 

         