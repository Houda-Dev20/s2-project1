const express = require('express');
const router = express.Router();

const { deactivateSearcher, addSearcher, updateSearcher, searchSearchers, verifyAndSave, getAllSearchers, loginSearcher, logoutSearcher, getProfile } = require('../controllers/searcherControllers');
const { validateSearcher, checkValidation } = require("../validators/searcherValidator");

router.post("/register", validateSearcher, checkValidation, addSearcher);
router.put("/update/:id", updateSearcher);
router.put('/deactivate/:id', deactivateSearcher);
router.post("/verify", verifyAndSave);
router.post("/search", searchSearchers);
router.get("/", getAllSearchers);
router.post("/login", loginSearcher );
router.post("/logout", logoutSearcher );



module.exports = router;


