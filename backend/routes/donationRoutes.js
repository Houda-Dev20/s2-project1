const express = require('express');
const router = express.Router();
const { handleDonation, acceptDonation, getDonorDonations } = require('../controllers/donationControllers');

router.post("/", handleDonation);
router.post("/accept/:id", acceptDonation);
router.get('/donor/:donorId', getDonorDonations);

module.exports = router;
