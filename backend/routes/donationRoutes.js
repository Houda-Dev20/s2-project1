const express = require('express');
const router = express.Router();
const { handleDonation, acceptDonation } = require('../controllers/donationControllers');

router.post("/", handleDonation);
router.post("/accept/:id", acceptDonation);

module.exports = router;
