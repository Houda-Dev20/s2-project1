const express = require('express');
const router = express.Router();

const { deleteDonor, addDonor, updateDonor, searchDonors, verifyEmail, getAllDonors, loginDonor, logoutDonor } = require('../controllers/donorControllers');
const { validateDonor, checkValidation } = require("../validators/donorValidator");

router.post("/add", validateDonor, checkValidation, addDonor);
router.put("/:id", updateDonor);
router.delete('/:id', deleteDonor);
router.post("/verify-email", verifyEmail);
router.post("/search-donors", searchDonors);
router.get("/", getAllDonors);
router.post("/login", loginDonor );
router.post("/logout", logoutDonor );

module.exports = router;
