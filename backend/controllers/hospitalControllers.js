const db = require("../config/db");

const getHospitals = (req, res) => {
    db.query("SELECT * FROM hospitals", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result);
    });
};

module.exports = { getHospitals };