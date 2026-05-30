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
    getDonationById,
    getDonorPendingStatus,
    completeDonation,
    failDonation
} = require('../controllers/donationControllers');

// 1️⃣ المسارات الثابتة (POST)
router.post("/", handleDonation);
router.post('/:id/accept-by-donor', acceptDonationByDonor);
router.post('/:id/accept-by-searcher', acceptDonationBySearcher);
router.post('/:id/cancel', cancelDonation);
router.post('/:id/complete', completeDonation);
router.post('/:id/fail', failDonation);

// 2️⃣ المسارات الثابتة (GET) - كلها قبل /:id
router.get('/status', getDonationStatus);            // ⭐ مهم جداً قبل /:id
router.get('/donor/:donorId', getDonorDonations);    // ⭐ قبل /:id
router.get('/searcher/:searcherId', getSearcherDonations); // ⭐ قبل /:id
router.get('/donor-pending/:donorId', getDonorPendingStatus);
// 3️⃣ المسار المتغير (يجب أن يكون آخراً)
router.get('/:id', getDonationById);                 // هذا يمسك أي رقم معرف

module.exports = router;