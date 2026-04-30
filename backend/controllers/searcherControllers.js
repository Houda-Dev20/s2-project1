
﻿const db=require('../config/db');
const bcrypt = require('bcrypt');

const sendVerificationEmail = require("../utils/sendEmail");
const { ALGERIA_WILAYAS } = require('../utils/constants');
const jwt = require("jsonwebtoken");
const pendingRegistrations = new Map();

const pendingEmailChanges = new Map();

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
        console.log(`ًں§¹ Cleaned ${cleanedCount} expired pending registrations`);
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
                message: "Invalid location. Please select a valid wilaya number between 1 and 58."
            });
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

        const hashedPassword = await bcrypt.hash(password, 10);
        const verification_code = Math.floor(100000 + Math.random() * 900000).toString();

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
        const updates = req.body;
        console.log("UPDATES RECEIVED:", updates);

        console.log("blood_type_research:", updates.blood_type_research);
        console.log("is_urgent:", updates.is_urgent);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No data provided" });
        }

        if (updates.full_name && !/^[A-Za-z\s]+$/.test(updates.full_name)) {
            return res.status(400).json({ message: "Invalid full name format" });
        }

if ("email" in updates) {
    return res.status(400).json({
        message: "Use /request-email-change to update email"
    });
}

        if (updates.telephon && !/^\d{10}$/.test(updates.telephon)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        if (updates.location) {
            const wilayaNumber = parseInt(updates.location);
            if (!ALGERIA_WILAYAS.includes(wilayaNumber)) {
                return res.status(400).json({
                    message: "Invalid location"
                });
            }
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

const allowedFields = [
    "full_name",
    "telephon",
    "location",
    "date_of_birth",
    "Hospital_name",
    "blood_type_research",
    "is_urgent"
];

const filteredUpdates = {};

for (let key of allowedFields) {
    if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
    }
}

const fields = Object.keys(filteredUpdates)
    .map(key => `${key}=?`)
    .join(", ");

const values = Object.values(filteredUpdates);

        console.log("UPDATES:", updates);

        const query = `UPDATE searchers SET ${fields} WHERE id=?`;

        db.query(query, [...values, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating searcher" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "searcher not found" });
            }

            return res.json({ message: "Updated successfully" });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

function deactivateSearcher(req, res) {
    const searcherId = req.params.id;

    const sql = "UPDATE searchers SET is_active = 0 WHERE id = ?";

    db.query(sql, [searcherId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Searcher not found" });
        }

        return res.json({ message: "Account deactivated successfully" });
    });
}

const verifyAndSave = (req, res) => {

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

    if (pending.verification_code !== verification_code) {
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
        (err, result) => {
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
                message: "âœ“ Registration completed successfully!",
                searcherId: result.insertId,
                searcher: {
                    id: result.insertId,
                    full_name: pending.full_name,
                    blood_type_research: pending.blood_type_research,
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

    const pending = pendingDonors.get(email);

    if (!pending) {
        return res.status(404).json({
            message: "No pending registration found. Please register again."
        });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.verification_code = newCode;
    pending.expiresAt = Date.now() + (60 * 1000);  
    pendingDonors.set(email, pending);

    pendingRegistrations.set(email, pending);
fec63f1219b24b90e943cda1ba90e2614902c1d0

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
    const { blood_type, location, is_urgent } = req.body;

    let sql = `
        SELECT id, full_name, telephon, blood_type_research, location, is_urgent, date_of_birth, email
        FROM searchers
        WHERE blood_type_research = ? AND location = ?
    `;
    const params = [blood_type, location];

    if (is_urgent !== undefined && (is_urgent === 0 || is_urgent === 1)) {
        sql += " AND is_urgent = ?";
        params.push(is_urgent);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
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

        const token = jwt.sign(
            { id: searcher.id, email: searcher.email },
            "SECRET_KEY",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,   
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

const activateSearcher = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE searchers 
        SET available = 1
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) return res.status(500).json({ message: "error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Searcher not found" });
        }

        res.json({ message: "Searcher activated successfully" });
    });
};

const disactivateSearcher = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE searchers 
        SET available = 0
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) return res.status(500).json({ message: "error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Searcher not found" });
        }

        res.json({ message: "Searcher deactivated successfully" });
    });
};

const getSearcherProfile = (req, res) => {

    db.query("SELECT * FROM searchers WHERE id = ?", [req.params.id], (err, result) => {

        if (err) return res.status(500).json({ message: "error" });

        res.json(result[0]);
    });
};
const requestEmailChange = async (req, res) => {
    const { id } = req.params;  
    const { new_email } = req.body;

    if (!new_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }


    const emailCheck = await new Promise((resolve) => {
        db.query("SELECT id FROM searchers WHERE email = ?", [new_email], (err, result) => {
            resolve(result && result.length > 0);
        });
    });
    if (emailCheck) {
        return res.status(400).json({ message: "Email already in use" });
    }

    const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60 * 1000;


    pendingEmailChanges.set(id, {
        new_email,
        verification_code,
        expiresAt
    });

    const emailSent = await sendVerificationEmail(new_email, verification_code, 'searcher');
    if (!emailSent) {
        pendingEmailChanges.delete(id);
        return res.status(500).json({ message: "Failed to send verification email" });
    }

    res.json({ message: "Verification code sent to new email", email: new_email });
};


const confirmEmailChange = (req, res) => {
    const { id } = req.params;  
    const { verification_code } = req.body;

    const pending = pendingEmailChanges.get(id);
    if (!pending) {
        return res.status(404).json({ message: "No pending email change request" });
    }
    if (pending.expiresAt < Date.now()) {
        pendingEmailChanges.delete(id);
        return res.status(400).json({ message: "Verification code expired" });
    }
    if (pending.verification_code !== verification_code) {
        return res.status(400).json({ message: "Invalid verification code" });
    }

    db.query("UPDATE searchers SET email = ? WHERE id = ?", [pending.new_email, parseInt(id)], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        pendingEmailChanges.delete(id);
        res.json({ message: "Email updated successfully", email: pending.new_email });
    });
};

module.exports = {
    requestEmailChange,
    confirmEmailChange,
    addSearcher,
    updateSearcher,
    deactivateSearcher,
    verifyAndSave,
    searchSearchers,
    getAllSearchers,
    loginSearcher,
    logoutSearcher,
    resendCode,
    activateSearcher,
    disactivateSearcher,
    getSearcherProfile
};