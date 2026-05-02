const db = require('../config/db');
const { createDonationRequestNotification, createDonorAcceptedNotification, createRequestAcceptedNotification, createDonorHelpRequestNotification, createPatientRequestAcceptedNotification,createDonationOfferAcceptedNotification } = require('./notificationController');

const handleDonation = (req, res) => {
    let { id_donor, id_searcher, initiatedBy } = req.body;

    if (!id_donor || !id_searcher) {
        return res.status(400).json({ message: "Missing donor or searcher ID" });
    }

    const initiator = (initiatedBy === 'searcher') ? 'searcher' : 'donor';

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
                "INSERT INTO donations (id_donor, id_searcher, donation_date, status, initiated_by) VALUES (?, ?, ?, 'pending', ?)",
                [id_donor, id_searcher, today, initiator],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Error saving donations" });
                    }
                    const donationId = result.insertId;
                    if (initiator === 'searcher') {
                        createDonorHelpRequestNotification(id_donor, searcher.full_name, searcher.blood_type_research, donationId);
                    } else {
                        createDonationRequestNotification(id_searcher, donor.full_name, donor.blood_type, donationId);
                    }
                    res.json({ message: "Donation request successful", donationId: donationId });
                }
            );
        });
    });
};

// ======================== قبول المتبرع لطلب محتاج (الطلب بدأ بواسطة searcher) ========================
const acceptDonationByDonor = (req, res) => {
    const { id } = req.params;
    db.query("UPDATE donations SET status = 'accepted' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Donation not found" });

        db.query(
            `SELECT d.id_donor, d.id_searcher, 
                    s.full_name AS searcher_name, s.telephon AS searcher_phone,
                    do.full_name AS donor_name, do.telephon AS donor_phone
             FROM donations d
             JOIN searchers s ON d.id_searcher = s.id
             JOIN donors do ON d.id_donor = do.id
             WHERE d.id = ?`,
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });

                const donorId = rows[0].id_donor;
                const searcherId = rows[0].id_searcher;
                const donorName = rows[0].donor_name;
                const searcherName = rows[0].searcher_name;
                const donorPhone = rows[0].donor_phone;
                const searcherPhone = rows[0].searcher_phone;

                const today = new Date().toISOString().split('T')[0];
                db.query("UPDATE donors SET last_donation_date = ?, is_active = 0 WHERE id = ?", [today, donorId], (updateErr) => {
                    if (updateErr) console.error("Error updating donor:", updateErr);
                });

                // إشعار للمتبرع (الذي قبل) - "You accepted a help request from PATIENT_NAME. Contact them at: PHONE"
                const { createDonorAcceptedNotification } = require('./notificationController');
                createDonorAcceptedNotification(donorId, searcherName, searcherPhone);

                // إشعار للمحتاج (صاحب الطلب) - "Your request was accepted by DONOR_NAME. Contact them at: PHONE"
                const { createPatientRequestAcceptedNotification } = require('./notificationController');
                createPatientRequestAcceptedNotification(searcherId, donorName, donorPhone);

                // حذف إشعار الطلب القديم (donor_help_request)
                db.query("DELETE FROM notifications WHERE donation_id = ? AND type = 'donor_help_request'", [id], () => {});

                res.json({ message: "Donation accepted by donor, both parties notified" });
            }
        );
    });
};

// ======================== قبول المحتاج لعرض متبرع (الطلب بدأ بواسطة donor) ========================
const acceptDonationBySearcher = (req, res) => {
    const { id } = req.params;
    db.query("UPDATE donations SET status = 'accepted' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Donation not found" });

        db.query(
            `SELECT d.id_donor, d.id_searcher, 
                    s.full_name AS searcher_name, s.telephon AS searcher_phone,
                    do.full_name AS donor_name, do.telephon AS donor_phone
             FROM donations d
             JOIN searchers s ON d.id_searcher = s.id
             JOIN donors do ON d.id_donor = do.id
             WHERE d.id = ?`,
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });

                const donorId = rows[0].id_donor;
                const searcherId = rows[0].id_searcher;
                const donorName = rows[0].donor_name;
                const searcherName = rows[0].searcher_name;
                const donorPhone = rows[0].donor_phone;
                const searcherPhone = rows[0].searcher_phone;

                const today = new Date().toISOString().split('T')[0];
                db.query("UPDATE donors SET last_donation_date = ?, is_active = 0 WHERE id = ?", [today, donorId], (updateErr) => {
                    if (updateErr) console.error("Error updating donor:", updateErr);
                });

                // إشعار للمحتاج (الذي قبل) - "You accepted a donation offer from DONOR_NAME. Contact them at: PHONE"
                const { createSearcherAcceptedNotification } = require('./notificationController');
                createSearcherAcceptedNotification(searcherId, donorName, donorPhone);

                // إشعار للمتبرع (صاحب العرض) - "Your offer was accepted by PATIENT_NAME. Contact them at: PHONE"
                const { createDonationOfferAcceptedNotification } = require('./notificationController');
                createDonationOfferAcceptedNotification(donorId, searcherName, searcherPhone);

                db.query("DELETE FROM notifications WHERE donation_id = ? AND type = 'donation_request'", [id], () => {});

                res.json({ message: "Donation accepted by searcher, both parties notified" });
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


const getDonationById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT id_donor, id_searcher FROM donations WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "Donation not found" });
        res.json(results[0]);
    });
};

 module.exports = {getDonorDonations, handleDonation, acceptDonationBySearcher, acceptDonationByDonor, getSearcherDonations, getDonationById  };

















