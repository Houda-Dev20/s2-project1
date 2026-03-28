const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");

const addSearcher = async (req, res) => {
    try {
        const {
            full_name,
            blood_type,
            telephon,
            email,
            password,
            location,
            date_of_birth,
            is_urgent
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10); 

        const verification_code = Math.floor(100000 + Math.random() * 900000).toString();

        const query = `
            INSERT INTO searchers
            (full_name, blood_type, telephon, email, password, verification_code, is_verified, location, date_of_birth, is_urgent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [full_name, blood_type, telephon, email, hashedPassword, verification_code, false, location, date_of_birth, is_urgent],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error adding searcher" });
                }

                res.status(201).json({ message: 'searcher added successfully', id: result.insertId });
            }
        );
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
            blood_type,
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
            SET full_name=?, blood_type=?, telephon=?, email=?, password=?, location=?, date_of_birth=?,
            is_urgent=? 
            WHERE id=?
        `;

        db.query(query,
            [full_name, blood_type, telephon, email, hashedPassword, location, date_of_birth, is_urgent, id],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error updating searcher" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "searcher not found" });
                }

                res.json({ message: "Searcher updated successfully" });
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

const verifyEmail = (req, res) => {

const { email, verification_code } = req.body;

if (!email || !verification_code) {
  return res.status(400).json({
    message: "Email and code are required"
  });
}

const sql = `
SELECT verification_code FROM searchers WHERE email = ?
`;

db.query(sql, [email], (err, result) => {

if (err) {
return res.status(500).json({ message: "Server error" });
}

if (result.length === 0) {
return res.status(404).json({ message: "Email not found" });
}

console.log("DB code:", result[0].verification_code);
console.log("User code:", verification_code );

if (result[0].verification_code !== verification_code) {
    console.log(err);
return res.status(400).json({ message: "Invalid code" });
}

const update = `
UPDATE searchers
SET is_verified = true
WHERE email = ?
`;

db.query(update, [email]);

res.json({ message: "Email verified successfully" });

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

module.exports = { addSearcher, updateSearcher, deleteSearcher, verifyEmail, searchSearchers, getAllSearchers, loginSearcher, logoutSearcher };