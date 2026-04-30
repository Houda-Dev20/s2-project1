const db = require('../config/db');
const { createDonationRequestNotification, createRequestAcceptedNotification } = require('./notificationController');

const handleDonation = (req, res) => {
    const { id_donor, id_searcher } = req.body;

    if (!id_donor || !id_searcher) {
        return res.status(400).json({ message: "Missing donor or searcher ID" });
    }

    db.query("SELECT * FROM donors WHERE id = ?", [id_donor], (err, donorResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (donorResult.length === 0) return res.status(404).json({ message: "Donor not found" });
        const donor = donorResult[0];

        db.query("SELECT * FROM searchers WHERE id = ?", [id_searcher], (err, searcherResult) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (searcherResult.length === 0) return res.status(404).json({ message: "Searcher not found" });
            const searcher = searcherResult[0];

            function isCompatible(donorBlood, requiredBlood) {
                const compat = {
                    'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
                    'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'],
                    'AB-': ['AB-', 'A-', 'B-', 'O-'], 'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
                };
                return compat[donorBlood]?.includes(requiredBlood) || false;
            }

            if (!isCompatible(donor.blood_type, searcher.blood_type_research)) {
                return res.status(400).json({ message: "Incompatible blood types" });
            }

            const today = new Date().toISOString().split('T')[0];
            db.query(
                "INSERT INTO donations (id_donor, id_searcher, donation_date, status) VALUES (?, ?, ?, 'pending')",
                [id_donor, id_searcher, today],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Error saving donations" });
                    }
                    const donationId = result.insertId;
                    createDonationRequestNotification(id_searcher, donor.full_name, donor.blood_type, donationId);
                    res.json({ message: "donations successful", donationId: donationId });
                }
            );
        });
    });
};

const acceptDonation = (req, res) => {
    const { id } = req.params;
    db.query("UPDATE donations SET status = 'accepted' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "donations not found" });
        db.query(
            "SELECT d.id_donor, s.full_name AS searcher_name FROM donations d JOIN searchers s ON d.id_searcher = s.id WHERE d.id = ?",
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });
                createRequestAcceptedNotification(rows[0].id_donor, rows[0].searcher_name);
                res.json({ message: "donations accepted, notification sent" });
            }
        );
    });
};

module.exports = { handleDonation, acceptDonation };

