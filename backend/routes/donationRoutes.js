const express = require('express');
const router = express.Router();
const { handleDonation, acceptDonationByDonor,acceptDonationBySearcher, getDonorDonations, getSearcherDonations, getDonationById } = require('../controllers/donationControllers');

router.post("/", handleDonation);

router.get('/:id', getDonationById);

router.get('/donor/:donorId', getDonorDonations);
router.get('/searcher/:searcherId', getSearcherDonations);
router.post('/accept-by-donor/:id', acceptDonationByDonor);
router.post('/accept-by-searcher/:id', acceptDonationBySearcher);

module.exports = router;


