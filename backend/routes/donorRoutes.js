const express = require('express');
const router = express.Router();

const { deactivateAccount, addDonor, updateDonor, searchDonors, verifyEmail, getAllDonors, loginDonor, logoutDonor } = require('../controllers/donorControllers');
const { validateDonor, checkValidation } = require("../validators/donorValidator");

router.post("/add", validateDonor, checkValidation, addDonor);
router.put("/:id", updateDonor);
router.put('/deactivate/:id', deactivateAccount);
router.post("/verify-email", verifyEmail);
router.post("/search-donors", searchDonors);
router.get("/", getAllDonors);
router.post("/login", loginDonor );
router.post("/logout", logoutDonor );

module.exports = router;
