const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");
const { ALGERIA_WILAYAS } = require('../utils/constants');

const pendingRegistrations = new Map();

setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [email, data] of pendingRegistrations.entries()) {
        if (data.expiresAt < now) {
            pendingRegistrations.delete(email);
            cleanedCount++;
        }
    }
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired pending registrations`);
    }
}, 60 * 1000);

const addSearcher = async (req, res) => {
    try {
        const {
            full_name,
            blood_type_research,
            telephon,
            email,
            password,
            location,
            date_of_birth,
            is_urgent
        } = req.body;

       if (!/^[A-Za-z\s]+$/.test(full_name)) {
            return res.status(400).json({ message: "Invalid full name" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        if (!/^\d{10}$/.test(telephon)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

    const wilayaNumber = parseInt(location);

    if (!ALGERIA_WILAYAS.includes(wilayaNumber)) {
        return res.status(400).json({ 
message: "Invalid location. Please select a valid wilaya number between 1 and 58."});
    }

            const emailCheckQuery = `SELECT email FROM searchers WHERE email = ?`;
        const emailExists = await new Promise((resolve) => {
            db.query(emailCheckQuery, [email], (err, result) => {
                resolve(result && result.length > 0);
            });
        });

        if (emailExists) {
            return res.status(400).json({ 
                message: "Email already registered. Please login instead."
            });
        }

                const phoneCheckQuery = `SELECT telephon FROM searchers WHERE telephon = ?`;
        const phoneExists = await new Promise((resolve) => {
            db.query(phoneCheckQuery, [telephon], (err, result) => {
                resolve(result && result.length > 0);
            });
        });

        if (phoneExists) {
            return res.status(400).json({ 
                message: "Phone number already registered."
            });
        }

        const verification_code = Math.floor(100000 + Math.random() * 900000).toString();


        const hashedPassword = await bcrypt.hash(password, 10); 

                pendingRegistrations.set(email, {
            full_name,
            blood_type_research,
            telephon,
            hashedPassword,
            location: wilayaNumber,
            date_of_birth,
            is_urgent: is_urgent || false,
            verification_code,
            createdAt: new Date(),
            expiresAt: Date.now() + (60 * 1000)
        });

        const emailSent = await sendVerificationEmail(email, verification_code);

        if (!emailSent) {
            pendingRegistrations.delete(email);
            return res.status(500).json({ 
                message: "Failed to send verification email. Please try again."
            });
        }

                res.status(200).json({ 
            message: "✓ Verification code sent to your email. Please check your inbox.",
            email: email,
            expiresIn: "1 minutes",
            nextStep: "POST /api/searchers/verify with your email and code"
        });
                
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateSearcher = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            required_blood_type,
            telephon,
            email,
            password,
            location,
            date_of_birth,
            is_urgent
        } = req.body;

        let hashedPassword = password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const query = `
            UPDATE searchers 
            SET full_name=?, required_blood_type=?, telephon=?, email=?, password=?, location=?, date_of_birth=?,
            is_urgent=? 
            WHERE id=?
        `;

        db.query(query,
            [full_name, required_blood_type, telephon, email, hashedPassword, location, date_of_birth, is_urgent, id],
            (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Conflict: Email or phone exists" });
                    return res.status(500).json({ message: "Error updating searcher" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "searcher not found" });
                }
if (required_blood_types && Array.isArray(required_blood_types)) {
                    db.query(`DELETE FROM searcher_blood_requirements WHERE searcher_id = ?`, [id], (delErr) => {
                        if (delErr) return res.status(500).json({ message: "Error resetting blood types" });

                        if (required_blood_types.length > 0) {
                            const bloodValues = required_blood_types.map(type => [id, type]);
                            db.query(`INSERT INTO searcher_blood_requirements (searcher_id, blood_type) VALUES ?`, [bloodValues], (insErr) => {
                                if (insErr) return res.status(500).json({ message: "Error inserting new blood types" });
                                return res.json({ message: "Searcher and blood types updated successfully" });
                            });
                        } else {
                            return res.json({ message: "Searcher updated, all blood requirements removed" });
                        }
                    });
                } else {
                    return res.json({ message: "Searcher profile updated successfully" });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internel Server Error" });
    }
};

function deleteSearcher(req, res) {
    const donorId = req.params.id;

    const sql = "DELETE FROM searchers WHERE id = ?";

    db.query(sql, [donorId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "searcher not found" });
        }

        return res.json({ message: "Account deleted successfully" });
    });
};

const verifyAndSave  = (req, res) => {

const { email, verification_code } = req.body;

if (!email || !verification_code) {
  return res.status(400).json({
    message: "Email and code are required"
  });
}

    const pending = pendingRegistrations.get(email);

    if (!pending) {
        return res.status(404).json({ 
            message: "No pending registration found. Please register again.",
            hint: "Verification code expires after 1 minutes"
        });
    }

        if (pending.expiresAt < Date.now()) {
        pendingRegistrations.delete(email);
        return res.status(400).json({ 
            message: "Verification code has expired. Please register again.",
            reason: "Code is only valid for 1 minute"
        });
    }

        if (pending.verification_code  !== verification_code) {
        return res.status(400).json({ 
            message: "Invalid verification code. Please try again.",
            attempts: "You have limited attempts"
        });
    }

        const query = `
        INSERT INTO searchers
        (full_name, blood_type_research, telephon, email, password, verification_code, is_verified, location, date_of_birth, is_urgent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        db.query(
        query,
        [
            pending.full_name,
            pending.blood_type_research,
            pending.telephon,
            email,
            pending.hashedPassword,
            pending.verification_code,
            true,  
            pending.location,
            pending.date_of_birth,
            pending.is_urgent
        ],
        (err, result) =>{
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        message: "Email or phone already exists"
                    });
                }
                return res.status(500).json({ 
                    message: "Error saving user to database"
                });
            }

            pendingRegistrations.delete(email);

            res.status(201).json({
                message: "✓ Registration completed successfully!",
                searcherId: result.insertId,
                searcher: {
                    id: result.insertId,
                    full_name: pending.full_name,
                    blood_type_research: pending.blood_type_research,
                    email: email
                }
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


const searchSearchers = (req, res) => {

    const { blood_type, location } = req.body;

    const sql = `
        SELECT full_name, telephon, blood_type, location
        FROM searchers
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
            searchers: result
        });
    });
};

const getAllSearchers = (req, res) => {

const sql = `
SELECT *
FROM searchers
`;

db.query(sql, (err, result) => {

if (err) {
return res.status(500).json({
message: "Error retrieving searchers"
});
}

res.status(200).json({
success: true,
searchers: result
});

});

};

const loginSearcher = (req, res) => {

    const { email, password } = req.body;
    const sql = "SELECT * FROM searchers WHERE email = ?";

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
                message: "Searcher not found"
            });
        }

        const searcher = result[0];
        const match = await bcrypt.compare(password, searcher.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            searcher: {
                id: searcher.id,
                full_name: searcher.full_name,
                email: searcher.email,
                telephon: searcher.telephon,
                blood_type: searcher.blood_type,
                location: searcher.location
            }
        });

    });
};

const logoutSearcher = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });

};

module.exports = { addSearcher, updateSearcher, deleteSearcher, verifyAndSave , searchSearchers, getAllSearchers, loginSearcher, logoutSearcher, resendCode };