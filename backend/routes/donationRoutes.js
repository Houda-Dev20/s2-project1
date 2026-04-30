const express = require('express');
const router = express.Router();

const { handleDonation } = require('../controllers/donationControllers');

router.post("/", handleDonation);

module.exports = router;
