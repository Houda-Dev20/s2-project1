const express = require("express");
const cors = require("cors");
const path = require("path");

//update
const multer = require("multer");
const fs = require("fs");



require('dotenv').config();
require("./cron/eligibilityCron");
require("./cron/nearbyPatientCron");

const app = express();  

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));


// ========== PROFILE PICTURE UPLOAD SETUP ==========
// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'profile-' + req.params.id + '-' + uniqueSuffix + extension);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== DATABASE CONNECTION ==========
const db = require("./config/db");

// ========== PROFILE PICTURE ROUTES ==========

// Upload profile picture for donor
app.post("/donors/upload-picture/:id", upload.single('profilePicture'), (req, res) => {
    try {
        const donorId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const pictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
        
        const query = 'UPDATE donors SET profile_picture = ? WHERE id = ?';
        db.query(query, [pictureUrl, donorId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Donor not found' });
            }
            res.json({ success: true, pictureUrl: pictureUrl });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload profile picture for searcher
app.post("/searchers/upload-picture/:id", upload.single('profilePicture'), (req, res) => {
    try {
        const searcherId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const pictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
        
        const query = 'UPDATE searchers SET profile_picture = ? WHERE id = ?';
        db.query(query, [pictureUrl, searcherId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Searcher not found' });
            }
            res.json({ success: true, pictureUrl: pictureUrl });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get profile picture for any user
app.get("/get-profile-picture/:userId/:userType", (req, res) => {
    const { userId, userType } = req.params;
    const table = userType === 'donor' ? 'donors' : 'searchers';
    const query = `SELECT profile_picture FROM ${table} WHERE id = ?`;
    
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.json({ pictureUrl: null });
        }
        res.json({ pictureUrl: result[0].profile_picture });
    });
});

const donorRoutes = require("./routes/donorRoutes");
app.use("/donors", donorRoutes);

const searcherRoutes = require("./routes/searcherRoutes");
app.use("/searchers", searcherRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

const donationRoutes = require("./routes/donationRoutes");
app.use("/donations", donationRoutes);


// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// تشغيل الخادم
app.listen(3000, () => {
    console.log("Server running on port 3000");
});