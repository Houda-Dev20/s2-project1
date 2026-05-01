const express = require('express');
const router = express.Router();
const { handleDonation, acceptDonation, getDonorDonations, getSearcherDonations } = require('../controllers/donationControllers');

router.post("/", handleDonation);
router.post("/accept/:id", acceptDonation);
router.get('/donor/:donorId', getDonorDonations);

router.get('/searcher/:searcherId', getSearcherDonations);
module.exports = router;

