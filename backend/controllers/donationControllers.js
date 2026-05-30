const db = require('../config/db');
const { createDonationRequestNotification, createDonorAcceptedNotification, createRequestAcceptedNotification, createDonorHelpRequestNotification, createPatientRequestAcceptedNotification,createDonationOfferAcceptedNotification } = require('./notificationController');

// التحقق من وجود طلب معلق بين متبرع ومحتاج (مع إمكانية تضمين الـ id للاستثناء)
const checkPendingDonation = (donorId, searcherId, excludeId = null) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT id, status FROM donations WHERE id_donor = ? AND id_searcher = ? AND status = 'pending'";
        const params = [donorId, searcherId];
        if (excludeId) {
            sql += " AND id != ?";
            params.push(excludeId);
        }
        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows.length > 0 ? rows[0] : null);
        });
    });
};

// دالة إنشاء طلب جديد (مُعدلة)
const handleDonation = async (req, res) => {
    let { id_donor, id_searcher, initiatedBy } = req.body;

    if (!id_donor || !id_searcher) {
        return res.status(400).json({ message: "Missing donor or searcher ID" });
    }

    const initiator = (initiatedBy === 'searcher') ? 'searcher' : 'donor';

        if (initiator === 'donor') {
        const donorAvailable = await new Promise((resolve, reject) => {
            db.query("SELECT available FROM donors WHERE id = ?", [id_donor], (err, rows) => {
                if (err) return reject(err);
                resolve(rows[0]?.available);
            });
        });
        if (donorAvailable === 0) {
            return res.status(403).json({ 
                message: "You are not available to donate right now. Please enable 'Ready to Donate' first.",
                code: "NOT_AVAILABLE"
            });
        }
    }

    // التحقق من وجود طلب معلق
    try {
        const existing = await checkPendingDonation(id_donor, id_searcher);
        if (existing) {
            return res.status(409).json({ 
                message: "A pending donation request already exists between this donor and patient.",
                donationId: existing.id
            });
        }
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Database error while checking existing requests" });
    }

    // باقي التحقق من التوافق والوجود
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

        // ← أضف هذا: اجعل المتبرع غير متاح عند إرسال الطلب
        if (initiator === 'donor') {
            db.query("UPDATE donors SET available = 0 WHERE id = ?", [id_donor], (updateErr) => {
                if (updateErr) console.error("Error updating donor availability:", updateErr);
            });
        }

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


const getDonationStatus = (req, res) => {
    const { donorId, searcherId } = req.query;
    if (!donorId || !searcherId) {
        return res.status(400).json({ message: "Missing donorId or searcherId" });
    }
    db.query(
        `SELECT id, status, initiated_by 
         FROM donations 
         WHERE id_donor = ? AND id_searcher = ? 
         ORDER BY id DESC LIMIT 1`,
        [donorId, searcherId],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (rows.length === 0) {
                return res.json({ hasRequest: false });
            }
            const donation = rows[0];
            res.json({ 
                hasRequest: true, 
                donationId: donation.id, 
                status: donation.status,
                initiatedBy: donation.initiated_by
            });
        }
    );
};

const cancelDonation = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM notifications WHERE donation_id = ?", [id], (deleteErr) => {
        if (deleteErr) console.error("Error deleting notifications:", deleteErr);

        db.query(
            "UPDATE donations SET status = 'cancelled' WHERE id = ? AND status = 'pending'",
            [id],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database error" });
                if (result.affectedRows === 0) return res.status(404).json({ message: "No pending donation found to cancel" });

                res.json({ message: "Donation request cancelled successfully" });
            }
        );
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
                db.query("UPDATE donors SET last_donation_date = ?, available  = 0 WHERE id = ?", [today, donorId], (updateErr) => {
                    if (updateErr) console.error("Error updating donor:", updateErr);
                });

                // إشعار للمتبرع (الذي قبل) - "You accepted a help request from PATIENT_NAME. Contact them at: PHONE"
                const { createDonorAcceptedNotification } = require('./notificationController');
                createDonorAcceptedNotification(donorId, searcherName, searcherPhone, id);

                const { createPatientRequestAcceptedNotification } = require('./notificationController');
                createPatientRequestAcceptedNotification(searcherId, donorName, donorPhone);

                db.query("DELETE FROM notifications WHERE donation_id = ? AND type = 'donor_help_request'", [id], () => {});

                res.json({ message: "Donation accepted by donor, both parties notified" });
            }
        );
    });
};

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
                db.query("UPDATE donors SET last_donation_date = ?, available = 0 WHERE id = ?", [today, donorId], (updateErr) => {
                    if (updateErr) console.error("Error updating donor:", updateErr);
                });

                // إشعار للمحتاج (الذي قبل) - "You accepted a donation offer from DONOR_NAME. Contact them at: PHONE"
                const { createSearcherAcceptedNotification } = require('./notificationController');
                createSearcherAcceptedNotification(searcherId, donorName, donorPhone);

                // إشعار للمتبرع (صاحب العرض) - "Your offer was accepted by PATIENT_NAME. Contact them at: PHONE"
                const { createDonationOfferAcceptedNotification } = require('./notificationController');
                createDonationOfferAcceptedNotification(donorId, searcherName, searcherPhone, id);

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
        WHERE d.id_donor = ? AND d.status = 'completed'
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
        WHERE d.id_searcher = ? AND d.status = 'completed'
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
    db.query("SELECT id_donor, id_searcher, status FROM donations WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "Donation not found" });
        res.json(results[0]);
    });
};

const getDonorPendingStatus = (req, res) => {
    const { donorId } = req.params;
    db.query(
        "SELECT id FROM donations WHERE id_donor = ? AND status = 'pending' LIMIT 1",
        [donorId],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ hasPending: rows.length > 0 });
        }
    );
};

const completeDonation = (req, res) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    db.query("UPDATE donations SET status = 'completed' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Donation not found" });

        db.query(
            `SELECT d.id_donor, d.id_searcher,
                    s.full_name AS searcher_name,
                    do.full_name AS donor_name
             FROM donations d
             JOIN searchers s ON d.id_searcher = s.id
             JOIN donors do ON d.id_donor = do.id
             WHERE d.id = ?`,
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });

                const { id_donor, id_searcher, donor_name, searcher_name } = rows[0];

                // تحديث last_donation_date
                db.query("UPDATE donors SET last_donation_date = ? WHERE id = ?", [today, id_donor], (err) => {
                    if (err) console.error("Error updating last_donation_date:", err);
                });

                // إشعار للمتبرع
                const { createNotification } = require('./notificationController');
                createNotification(id_donor, "Donation Completed", `Thank you! Your donation to ${searcher_name} has been recorded.`, "donation_completed");

                // إشعار للمحتاج
                createNotification(id_searcher, "Donation Completed", `${donor_name} has confirmed that the donation took place. Thank you!`, "donation_completed");

                res.json({ message: "Donation marked as completed" });
            }
        );
    });
};

const failDonation = (req, res) => {
    const { id } = req.params;

    db.query("UPDATE donations SET status = 'failed' WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Donation not found" });

        db.query(
            `SELECT d.id_donor, d.id_searcher,
                    s.full_name AS searcher_name,
                    do.full_name AS donor_name
             FROM donations d
             JOIN searchers s ON d.id_searcher = s.id
             JOIN donors do ON d.id_donor = do.id
             WHERE d.id = ?`,
            [id],
            (err, rows) => {
                if (err) return res.status(500).json({ message: "Error fetching details" });
                if (rows.length === 0) return res.status(404).json({ message: "Details not found" });

                const { id_donor, id_searcher, donor_name, searcher_name } = rows[0];

                const { createNotification } = require('./notificationController');
                createNotification(id_donor, "Donation Did Not Happen", `You reported that the donation with ${searcher_name} did not take place.`, "donation_failed");
                createNotification(id_searcher, "Donation Did Not Happen", `${donor_name} reported that the donation did not take place.`, "donation_failed");

                res.json({ message: "Donation marked as failed" });
            }
        );
    });
};

 module.exports = {checkPendingDonation, getDonationStatus,cancelDonation,getDonorDonations, handleDonation, acceptDonationBySearcher, acceptDonationByDonor, getSearcherDonations, getDonationById, getDonorPendingStatus, failDonation, completeDonation  };

















