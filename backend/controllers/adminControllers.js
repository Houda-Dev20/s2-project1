const db = require('../config/db');

const getStats = (req, res) => {
    const stats = {};
    db.query("SELECT COUNT(*) AS totalDonors FROM donors", (err, result) => {
        if (err) return res.status(500).json({ message: "error" });
        stats.totalDonors = result[0].totalDonors;
        db.query("SELECT COUNT(*) AS availableDonors FROM donors WHERE available = 1", (err, result2) => {
            if (err) return res.status(500).json({ message: "error" });
            stats.availableDonors = result2[0].availableDonors;
            db.query("SELECT COUNT(*) AS totalSearchers FROM searchers", (err, result3) => {
                if (err) return res.status(500).json({ message: "error" });
                stats.totalSearchers = result3[0].totalSearchers;
                db.query(`
                    SELECT blood_type, COUNT(*) AS count 
                    FROM donors 
                    GROUP BY blood_type
                `, (err, result4) => {
                    if (err) return res.status(500).json({ message: "error" });
                    stats.bloodTypes = result4;
                    db.query(`
                        SELECT location, COUNT(*) AS count
                        FROM donors
                        GROUP BY location
                    `, (err, result5) => {
                        if (err) return res.status(500).json({ message: "error" });
                        stats.donorsByLocation = result5;
                        db.query(`
                            SELECT blood_type, COUNT(*) AS count
                            FROM donors
                            GROUP BY blood_type
                            ORDER BY count DESC
                            LIMIT 1
                        `, (err, result6) => {
                            if (err) return res.status(500).json({ message: "error" });

                            stats.mostCommonBloodType = result6[0];

                            
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
};

const activateDonor = (req, res) => {
    const { id } = req.params;

    db.query("UPDATE donors SET available = 1 WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "error" });

        res.json({ message: "Donor activated successfully" });
    });
};

const disactivateDonor = (req, res) => {
    const { id } = req.params;

    db.query("UPDATE donors SET available = 0 WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "error" });

        res.json({ message: "Donor deactivated successfully" });
    });
};
module.exports = { getStats, activateDonor, disactivateDonor };