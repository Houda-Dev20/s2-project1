const db = require("../config/db");

const getNotifications = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT * 
        FROM notifications 
        WHERE donor_id = ? 
        ORDER BY created_at DESC
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "error" });

        res.json(results);
    });
};

const createNotification = (donor_id, title, message, type) => {

    const sql = `
        INSERT INTO notifications (donor_id, title, message, type)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [donor_id, title, message, type], (err) => {
        if (err) console.log("Notification Error:", err);
    });
};

const createEligibilityNotification = (donor) => {

    const lastDate = new Date(donor.last_donation_date);
    const now = new Date();

    const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);

    if (diffDays >= 90 && donor.available == 0) {

        const checkSql = `
            SELECT id FROM notifications 
            WHERE donor_id = ? AND type = 'eligibility'
        `;

        db.query(checkSql, [donor.id], (err, result) => {
            if (err) return console.log(err);

            if (result.length === 0) {

                    createNotification(
                        donor.id,
                        "You're eligible to donate now",
                        "90 days have passed. Do you want to reactivate your account?",
                        "eligibility"
                    );

            }
        });
    }
};

const markAsRead = (req, res) => {
    const { id } = req.params;

    db.query(
        "UPDATE notifications SET is_read = 1 WHERE id = ?",
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: "error" });

            res.json({ message: "Notification marked as read" });
        }
    );
};

const markAllAsRead = (req, res) => {
    const { donor_id } = req.params;

    db.query(
        "UPDATE notifications SET is_read = 1 WHERE donor_id = ?",
        [donor_id],
        (err) => {
            if (err) return res.status(500).json({ message: "error" });

            res.json({ message: "All notifications marked as read" });
        }
    );
};

const getUnreadCount = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT COUNT(*) AS count FROM notifications WHERE donor_id = ? AND is_read = 0",
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "error" });

            res.json({ count: result[0].count });
        }
    );
};

module.exports = {
    getNotifications,
    createNotification,
    createEligibilityNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};