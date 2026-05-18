const express = require("express");
const router = express.Router();
const { getHospitals } = require("../controllers/hospitalControllers");

router.get("/", getHospitals);

module.exports = router;