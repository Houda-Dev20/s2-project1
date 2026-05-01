const express = require('express');
const router = express.Router();
const { handleDonation, acceptDonation, getDonorDonations, getSearcherDonations, getDonationById } = require('../controllers/donationControllers');

router.post("/", handleDonation);

router.get('/:id', getDonationById);

router.get('/donor/:donorId', getDonorDonations);
router.get('/searcher/:searcherId', getSearcherDonations);
router.post('/accept/:id', acceptDonation);
module.exports = router;



