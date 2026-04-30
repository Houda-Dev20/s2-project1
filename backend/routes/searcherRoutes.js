const express = require('express');
const router = express.Router();

const { deactivateSearcher, addSearcher, updateSearcher, searchSearchers, verifyAndSave, getAllSearchers, loginSearcher, logoutSearcher, getSearcherProfile, activateSearcher, disactivateSearcher } = require('../controllers/searcherControllers');
const { validateSearcher, checkValidation } = require("../validators/searcherValidator");
const { forgotPassword, verifyResetCode, resetPassword,resendCode } = require('../controllers/donorControllers');


router.post("/register", validateSearcher, checkValidation, addSearcher);
router.put("/update/:id", updateSearcher);
router.put('/deactivate/:id', deactivateSearcher);
router.post("/verify", verifyAndSave);
router.post("/search", searchSearchers);
router.get("/", getAllSearchers);
router.post("/login", loginSearcher );
router.post("/logout", logoutSearcher );
router.put("/activate-searcher/:id", activateSearcher);
router.put("/deactivate-searcher/:id", disactivateSearcher);
router.get("/profile/:id", getSearcherProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-code", resendCode);



module.exports = router;


