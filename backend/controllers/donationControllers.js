const db = require('../config/db');

const handleDonation = (req, res) => {
    const { id_donor, id_searcher } = req.body;

    if (!id_donor || !id_searcher) {
        return res.status(400).json({ message: "Missing donor or searcher ID" });
    }

    db.query("SELECT * FROM donors WHERE id = ?", [id_donor], (err, donorResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (donorResult.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }
        const donor = donorResult[0];

        db.query("SELECT * FROM searchers WHERE id = ?", [id_searcher], (err, searcherResult) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (searcherResult.length === 0) {
                return res.status(404).json({ message: "Searcher not found" });
            }
            const searcher = searcherResult[0];

            function isCompatible(donorBlood, requiredBlood) {
                const compat = {
                    'O-': ['O-'],
                    'O+': ['O+', 'O-'],
                    'A-': ['A-', 'O-'],
                    'A+': ['A+', 'A-', 'O+', 'O-'],
                    'B-': ['B-', 'O-'],
                    'B+': ['B+', 'B-', 'O+', 'O-'],
                    'AB-': ['AB-', 'A-', 'B-', 'O-'],
                    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
                };
                return compat[donorBlood]?.includes(requiredBlood) || false;
            }

            if (!isCompatible(donor.blood_type, searcher.blood_type_research)) {
                return res.status(400).json({
                    message: "Incompatible blood types"
                });
            }

            const today = new Date().toISOString().split('T')[0];
            db.query(
                "INSERT INTO donation (id_donor, id_searcher, donation_date) VALUES (?, ?, ?)",
                [id_donor, id_searcher, today],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Error saving donation" });
                    }
                    res.json({ message: "Donation successful", donationId: result.insertId });
                }
            );
        });
    });
};

module.exports = { handleDonation };
