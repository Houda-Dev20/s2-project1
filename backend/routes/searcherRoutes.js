const express = require('express');
const router = express.Router();

const { deactivateSearcher, addSearcher, updateSearcher, searchSearchers, verifyAndSave, getAllSearchers, loginSearcher, logoutSearcher, getSearcherProfile, activateSearcher, disactivateSearcher, requestEmailChange, confirmEmailChange,getMapSearchers, updateAvailability } = require('../controllers/searcherControllers');
const { validateSearcher, checkValidation } = require("../validators/searcherValidator");
const { forgotPassword, verifyResetCode, resetPassword,resendCode } = require('../controllers/donorControllers');


router.post("/register", validateSearcher, checkValidation, addSearcher);
router.put("/update/:id", updateSearcher);
router.put('/deactivate/:id', deactivateSearcher);
router.post("/verify", verifyAndSave);
router.post("/search", searchSearchers);
router.get("/all", getAllSearchers);
router.post("/login", loginSearcher );
router.post("/logout", logoutSearcher );
router.put("/activate-searcher/:id", activateSearcher);
router.put("/deactivate-searcher/:id", disactivateSearcher);
router.get("/map-data", getMapSearchers);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-code", resendCode);

router.get("/profile/:id", getSearcherProfile);
router.post("/request-email-change/:id", requestEmailChange);
router.post("/confirm-email-change/:id", confirmEmailChange);
router.put("/update-availability/:id", updateAvailability);


router.get("/test", (req, res) => {
    res.json({ message: "searcher routes working" });
});


module.exports = router;


