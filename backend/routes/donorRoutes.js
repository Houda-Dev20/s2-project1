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

// ========== مسارات المتبرعين ==========
router.post('/donors/register', addDonor);
router.post('/donors/verify', verifyAndSaveDonor);
router.post('/donors/resend-code', resendCode);
router.post('/donors/login', loginDonor);
router.post('/donors/logout', logoutDonor);
router.get('/donors/all', getAllDonors);
router.get('/donors/profile/:id', getDonorProfile);
router.put('/donors/:id', updateDonor);
router.delete('/donors/:id/deactivate', disactivateDonor);
router.post('/donors/:id/activate', activateDonor);
router.post('/donors/search', searchDonors);

// ========== مسارات تغيير البريد ==========
router.post('/donors/request-email-change/:id', requestEmailChangeDonor);
router.post('/donors/confirm-email-change/:id', confirmEmailChangeDonor);

// ========== مسارات استعادة كلمة المرور ==========
router.post('/donors/forgot-password', forgotPassword);
router.post('/donors/verify-reset-code', verifyResetCode);
router.post('/donors/reset-password', resetPassword);

module.exports = router;