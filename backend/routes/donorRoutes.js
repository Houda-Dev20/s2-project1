const express = require('express');
const router = express.Router();
//update
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const {
    addDonor,
    updateDonor,
    verifyAndSaveDonor,
    searchDonors,
    getAllDonors,
    loginDonor,
    logoutDonor,
    getDonorProfile,
    activateDonor,
    disactivateDonor,
    resendCode,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    requestEmailChangeDonor,
    confirmEmailChangeDonor,
    getMapDonors
} = require('../controllers/donorControllers');
//update

// ========== PROFILE PICTURE UPLOAD SETUP ==========
// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
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

// Upload profile picture route
router.post('/upload-picture/:id', upload.single('profilePicture'), (req, res) => {
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

// Get profile picture route
router.get('/get-profile-picture/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT profile_picture FROM donors WHERE id = ?';
    
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


router.post('/register', addDonor);
router.post('/verify', verifyAndSaveDonor);
router.post('/resend-code', resendCode);
router.post('/login', loginDonor);
router.post('/logout', logoutDonor);
router.get('/all', getAllDonors);
router.get('/profile/:id', getDonorProfile);
router.put('/update/:id', updateDonor);
router.put('/deactivate/:id', disactivateDonor);
router.put('/active/:id', activateDonor);
router.post('/search', searchDonors);
router.get("/map-data", getMapDonors);

router.post('/request-email-change/:id', requestEmailChangeDonor);
router.post('/confirm-email-change/:id', confirmEmailChangeDonor);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;