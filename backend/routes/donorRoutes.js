const express = require('express');
const router = express.Router();

const { deactivateDonor, addDonor, updateDonor, searchDonors, verifyAndSaveDonor, getAllDonors, loginDonor, logoutDonor, getDonorProfile, activateDonor, disactivateDonor } = require('../controllers/donorControllers');
const { validateDonor, checkValidation } = require("../validators/donorValidator");
const { forgotPassword, verifyResetCode, resetPassword, resendCode  } = require('../controllers/donorControllers');


router.post("/register", validateDonor, checkValidation, addDonor);
router.put("/update/:id", updateDonor);
router.put('/deactivate/:id', deactivateDonor);
router.post("/verify", verifyAndSaveDonor);
router.post("/search", searchDonors);
router.get("/", getAllDonors);
router.post("/login", loginDonor );
router.post("/logout", logoutDonor );
router.post("/active/:id", activateDonor );
router.post("/disactive/:id", disactivateDonor );
router.get("/profile/:id", getDonorProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-code", resendCode);
module.exports = router;

