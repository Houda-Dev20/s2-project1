const db = require("../config/db");

const getNotifications = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "error" });
        res.json(results);
    });
};

const createNotification = (user_id, title, message, type, donationId = null) => {
    const sql = "INSERT INTO notifications (user_id, title, message, type, donation_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [user_id, title, message, type, donationId], (err) => {
        if (err) console.log("Notification Error:", err);
    });
};

const createEligibilityNotification = (donor) => {
    const lastDate = new Date(donor.last_donation_date);
    const now = new Date();
    const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
    if (diffDays >= 90 && donor.is_active == 0) {
        const checkSql = "SELECT id FROM notifications WHERE user_id = ? AND type = 'eligibility'";
        db.query(checkSql, [donor.id], (err, result) => {
            if (err) return console.log(err);
            if (result.length === 0) {
                createNotification(donor.id, "You're eligible to donate now", "90 days have passed. Do you want to reactivate your account?", "eligibility");
            }
        });
    }
};

const createDonationRequestNotification = (searcherId, donorName, bloodType, donationId = null) => {
    createNotification(searcherId, "New Donation Request", `${donorName} wants to donate ${bloodType} for you`, "donation_request", donationId);
};

const createRequestAcceptedNotification = (donorId, searcherName) => {
    createNotification(donorId, "Your request was accepted", `${searcherName} accepted your donation request`, "request_accepted");
};

const createNearbyPatientNotification = (donorId) => {
    createNotification(donorId, "Nearby patient found", "Someone you can donate to is near you", "nearby_patient");
};

const markAsRead = (req, res) => {
    const { id } = req.params;
    db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "error" });
        res.json({ message: "Notification marked as read" });
    });
};

const markAllAsRead = (req, res) => {
    const { user_id } = req.params;
    db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [user_id], (err) => {
        if (err) return res.status(500).json({ message: "error" });
        res.json({ message: "All notifications marked as read" });
    });
};

const getUnreadCount = (req, res) => {
    const { id } = req.params;
    db.query("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "error" });
        res.json({ count: result[0].count });
    });
};

const createDonorHelpRequestNotification = (donorId, searcherName, requiredBloodType, donationId = null) => {
    createNotification(donorId, "New Help Request", `${searcherName} needs ${requiredBloodType} blood. Please help!`, "donor_help_request", donationId);
};


const createPatientRequestAcceptedNotification = (searcherId, donorName) => {
    createNotification(searcherId, "Request Accepted", `${donorName} has accepted your donation request.`, "patient_accepted");
};


module.exports = {
    getNotifications,
    createNotification,
    createEligibilityNotification,
    createDonationRequestNotification,
    createRequestAcceptedNotification,
    createNearbyPatientNotification,
    createDonorHelpRequestNotification,
    createPatientRequestAcceptedNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};








