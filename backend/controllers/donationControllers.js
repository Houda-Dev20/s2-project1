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
        if (result.affectedRows === 0) return res.status(404).json({ message: "Donation not found" });
        db.query(
            "SELECT d.id_donor, s.full_name AS searcher_name FROM donations d JOIN searchers s ON d.id_searcher = s.id WHERE d.id = ?",
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });
                const donorId = rows[0].id_donor;
                const searcherName = rows[0].searcher_name;
                const today = new Date().toISOString().split('T')[0];
                // تحديث last_donation_date و is_active = 0
                db.query("UPDATE donors SET last_donation_date = ?, is_active = 0 WHERE id = ?", [today, donorId], (updateErr) => {
                    if (updateErr) console.error("Error updating donor:", updateErr);
                });
                db.query("DELETE FROM notifications WHERE donation_id = ? AND type = 'donation_request'", [id], (delErr) => {
                    if (delErr) console.error("Error deleting notification:", delErr);
                });
                createRequestAcceptedNotification(donorId, searcherName);
                res.json({ message: "Donation accepted, donor deactivated (is_active=0)" });
            }
        );
    });
};


const getDonorDonations = (req, res) => {
    const { donorId } = req.params;
    const sql = `
        SELECT d.donation_date, d.status, s.full_name AS searcher_name, s.Hospital_name
        FROM donations d
        JOIN searchers s ON d.id_searcher = s.id
        WHERE d.id_donor = ?
        ORDER BY d.donation_date DESC
    `;
    db.query(sql, [donorId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};


const getSearcherDonations = (req, res) => {
    const { searcherId } = req.params;
    const sql = `
        SELECT d.donation_date, s.Hospital_name
        FROM donations d
        JOIN searchers s ON d.id_searcher = s.id
        WHERE d.id_searcher = ? AND d.status = 'accepted'
        ORDER BY d.donation_date DESC
    `;
    db.query(sql, [searcherId], (err, results) => {
        if (err) {
            console.error("Error in getSearcherDonations:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json(results || []);
    });
};

module.exports = { getDonorDonations, handleDonation, acceptDonation, getSearcherDonations };







