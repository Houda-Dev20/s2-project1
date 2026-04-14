const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const { deactivateAccount, addDonor, updateDonor, searchDonors, verifyEmail, getAllDonors, loginDonor, logoutDonor, getProfile } = require('../controllers/donorControllers');
const { validateDonor, checkValidation } = require("../validators/donorValidator");

router.post("/add", validateDonor, checkValidation, addDonor);
router.put("/update/:id", updateDonor);
router.put('/deactivate/:id', deactivateAccount);
router.post("/verify-email", verifyEmail);
router.post("/search-donors", searchDonors);
router.get("/", getAllDonors);
router.post("/login", loginDonor );
router.post("/logout", logoutDonor );

//token functions
router.get('/profile', verifyToken, getProfile);

module.exports = router;
