const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const { deactivateDonor, addDonor, updateDonor, searchDonors, verifyEmail, getAllDonors, loginDonor, logoutDonor, getDonorProfile, activateDonor, disactivateDonor } = require('../controllers/donorControllers');
const { validateDonor, checkValidation } = require("../validators/donorValidator");

router.post("/register", validateDonor, checkValidation, addDonor);
router.put("/update/:id", updateDonor);
router.put('/deactivate/:id', deactivateDonor);
router.post("/verify", verifyEmail);
router.post("/search", searchDonors);
router.get("/", getAllDonors);
router.post("/login", loginDonor );
router.post("/logout", logoutDonor );
router.post("/active/:id", activateDonor );
router.post("/disactive/:id", disactivateDonor );
router.get("/profile/:id", getDonorProfile);


//token functions
router.get('/profile', verifyToken, getProfile);

module.exports = router;
