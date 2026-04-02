const express = require('express');
const router = express.Router();

const { 
    getStats,  
    activateDonor, 
    disactivateDonor 
} = require('../controllers/adminControllers');

router.get("/stats", getStats);
router.put("/donors/:id/activate", activateDonor);
router.put("/donors/:id/disactivate", disactivateDonor);

module.exports = router;