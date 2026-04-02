const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");

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
        const hashedPassword = await bcrypt.hash(password, 10); 

        const query = `
            INSERT INTO donors
            (full_name, blood_type, telephon, email, password, location, date_of_birth, available)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [full_name, blood_type, telephon, email, hashedPassword, location, date_of_birth, available],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error adding donor" });
                }

                res.status(201).json({ message: 'Donor added successfully', id: result.insertId });
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

        let hashedPassword = password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const query = `
            UPDATE donors 
            SET full_name=?, blood_type=?, telephon=?, email=?, password=?, location=?, date_of_birth=?,
            available=? 
            WHERE id=?
        `;

        db.query(query,
            [full_name, blood_type, telephon, email, hashedPassword, location, date_of_birth, available, id],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error updating donor" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "donor not found" });
                }

                res.json({ message: "Donor updated successfully" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internel Server Error" });
    }
};


function deleteDonor(req, res) {
    const donorId = req.params.id;

    const sql = "DELETE FROM donors WHERE id = ?";

    db.query(sql, [donorId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        return res.json({ message: "Account deleted successfully" });
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

db.query(update, [email]);

res.json({ message: "Email verified successfully" });

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
console.log(email, password);

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

module.exports = { deleteDonor, addDonor, updateDonor , verifyEmail, searchDonors, getAllDonors, loginDonor, logoutDonor };