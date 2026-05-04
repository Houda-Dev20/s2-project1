const express = require('express');
const router = express.Router();
const { 
    handleDonation, 
    getDonationStatus, 
    cancelDonation, 
    acceptDonationByDonor,
    acceptDonationBySearcher, 
    getDonorDonations, 
    getSearcherDonations, 
    getDonationById 
} = require('../controllers/donationControllers');

// 1️⃣ المسارات الثابتة (POST)
router.post("/", handleDonation);
router.post('/accept-by-donor/:id', acceptDonationByDonor);
router.post('/accept-by-searcher/:id', acceptDonationBySearcher);
router.post('/:id/cancel', cancelDonation);

// 2️⃣ المسارات الثابتة (GET) - كلها قبل /:id
router.get('/status', getDonationStatus);            // ⭐ مهم جداً قبل /:id
router.get('/donor/:donorId', getDonorDonations);    // ⭐ قبل /:id
router.get('/searcher/:searcherId', getSearcherDonations); // ⭐ قبل /:id

// 3️⃣ المسار المتغير (يجب أن يكون آخراً)
router.get('/:id', getDonationById);                 // هذا يمسك أي رقم معرف

module.exports = router;