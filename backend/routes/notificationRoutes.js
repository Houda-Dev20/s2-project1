const express = require("express");
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
} = require("../controllers/notificationController");

router.get("/:id", getNotifications);
router.put("/read/:id", markAsRead);
router.put("/read-all/:user_id", markAllAsRead);
router.get("/unread/:id", getUnreadCount);

module.exports = router;
