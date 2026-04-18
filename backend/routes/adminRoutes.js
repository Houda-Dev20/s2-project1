const express = require('express');
const router = express.Router();

const { 
    getStats 
} = require('../controllers/adminControllers');

router.get("/stats", getStats);

module.exports = router;