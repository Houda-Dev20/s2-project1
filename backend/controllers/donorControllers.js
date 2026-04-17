const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");
const { ALGERIA_WILAYAS } = require('../utils/constants');

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

     const hashedPassword = await bcrypt.hash(password, 10); 

     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

             const emailSent = await sendVerificationEmail(email, verificationCode);

                     if (!emailSent) {
            return res.status(500).json({ 
                message: "Failed to send verification email. Please check your email address and try again",
                success: false
            });
        }

        const query = `
            INSERT INTO donors
            (full_name, blood_type, telephon, email, password, location, date_of_birth, available, verification_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [full_name, blood_type, telephon, email, hashedPassword, location, date_of_birth, available, verificationCode],
             (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Email or phone already exists" });
                    }
                    return res.status(500).json({ message: "Error adding donor" });
                }

                 res.status(201).json({ 
                    message: 'Donor registered successfully. Verification code has been sent to your email.',
                    donorId: result.insertId,
                    success: true
                });
            }
        );
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


function deactivateAccount(req, res) {
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

const verifyEmail = (req, res) => {

const { email, code } = req.body;

const sql = `
SELECT verification_code FROM donors WHERE email = ?
`;

db.query(sql, [email], (err, result) => {

if (err) {
return res.status(500).json({ message: "Server error" });
}

if (result.length === 0) {
return res.status(404).json({ message: "Email not found" });
}

if (result[0].verification_code !== code) {
return res.status(400).json({ message: "Invalid code" });
}

const update = `
UPDATE donors
SET is_verified = true
WHERE email = ?
`;

db.query(update, [email], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ message: "Error updating verification status" });

            const token = jwt.sign(
                { id: result[0].id, email: result[0].email },
                process.env.ESI_SBA_SECRET_KEY,
                { expiresIn: '24h' }
            );

res.json({
     message: "Email verified successfully" ,
     token: token,
     donor: { id: result[0].id, full_name: result[0].full_name }
    });

});

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

const getProfile = (req, res) => {
    const donorId = req.user.id; 

    const sql = "SELECT full_name, email, blood_type FROM donors WHERE id = ?";
    db.query(sql, [donorId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result[0]); 
    });
};

module.exports = { deactivateAccount, addDonor, updateDonor , verifyEmail, searchDonors, getAllDonors, loginDonor, logoutDonor, getProfile };