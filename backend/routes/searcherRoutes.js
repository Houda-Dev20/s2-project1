const express = require('express');
const router = express.Router();

const { addSearcher, updateSearcher, deleteSearcher, verifyEmail, searchSearchers, getAllSearchers, loginSearcher, logoutSearcher } = require('../controllers/searcherControllers');
const { validateSearcher, checkValidation } = require("../validators/searcherValidator");

router.post("/add", validateSearcher, checkValidation, addSearcher);
router.put("/:id", updateSearcher);
router.delete("/:id", deleteSearcher);
router.post("/verify-email", verifyEmail);
router.post("/search", searchSearchers);
router.get("/", getAllSearchers);
router.post("/login", loginSearcher );
router.post("/logout", logoutSearcher );


module.exports = router;

