const cron = require("node-cron");
const db = require("../config/db");
const { createNearbyPatientNotification } = require("../controllers/notificationController");

const checkNearbyPatients = () => {
    // استعلام يستخدم جدول التوافق بدلاً من المساواة المباشرة
    const sql = `
        SELECT DISTINCT d.id AS donorId
        FROM donors d
        JOIN searchers s ON d.location = s.location
        WHERE d.available = 1
          AND (
              (d.blood_type = 'O-') OR
              (d.blood_type = 'O+' AND s.blood_type_research IN ('O+', 'A+', 'B+', 'AB+')) OR
              (d.blood_type = 'A-' AND s.blood_type_research IN ('A-', 'AB-', 'A+', 'AB+', 'O-')) OR
              (d.blood_type = 'A+' AND s.blood_type_research IN ('A+', 'AB+')) OR
              (d.blood_type = 'B-' AND s.blood_type_research IN ('B-', 'AB-', 'B+', 'AB+', 'O-')) OR
              (d.blood_type = 'B+' AND s.blood_type_research IN ('B+', 'AB+')) OR
              (d.blood_type = 'AB-' AND s.blood_type_research IN ('AB-', 'AB+', 'A-', 'B-', 'O-')) OR
              (d.blood_type = 'AB+' AND s.blood_type_research IN ('AB+'))
          )
    `;

    db.query(sql, (err, results) => {
        if (err) return console.log(err);

        results.forEach(row => {
            const checkSql = `
                SELECT id FROM notifications
                WHERE user_id = ? AND type = 'nearby_patient'
            `;
            db.query(checkSql, [row.donorId], (err, res) => {
                if (err) return console.log(err);
                if (res.length === 0) {
                    createNearbyPatientNotification(row.donorId);
                    console.log(`✅ Notificatie aangemaakt voor donor ${row.donorId}`);
                }
            });
        });
    });
};

// Cron elke 10 minuten voor test, later terugzetten naar elk uur
cron.schedule("*/10 * * * *", () => {
    console.log("🔍 Checking nearby patients...");
    checkNearbyPatients();
});

// Exporteer voor handmatige test
module.exports = { checkNearbyPatients };
