const express = require('express');
const router = express.Router();
const {
    addDonor,
    updateDonor,
    verifyAndSaveDonor,
    searchDonors,
    getAllDonors,
    loginDonor,
    logoutDonor,
    getDonorProfile,
    activateDonor,
    disactivateDonor,
    resendCode,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    requestEmailChangeDonor,
    confirmEmailChangeDonor
} = require('../controllers/donorControllers');

router.post('/register', addDonor);
router.post('/verify', verifyAndSaveDonor);
router.post('/resend-code', resendCode);
router.post('/login', loginDonor);
router.post('/logout', logoutDonor);
router.get('/all', getAllDonors);
router.get('/profile/:id', getDonorProfile);
router.put('/update/:id', updateDonor);
router.delete('/:id/deactivate', disactivateDonor);
router.post('/:id/activate', activateDonor);
router.post('/search', searchDonors);

router.post('/request-email-change/:id', requestEmailChangeDonor);
router.post('/confirm-email-change/:id', confirmEmailChangeDonor);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;