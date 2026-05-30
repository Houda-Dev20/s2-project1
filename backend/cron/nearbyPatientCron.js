const cron = require("node-cron");
const db = require("../config/db");
const { createNearbyPatientNotification } = require("../controllers/notificationController");

const checkNearbyPatients = () => {
    console.log("🔍 Checking nearby patients...");

    // ← دمج الاستعلامين في واحد بدل استعلام داخل forEach
    const sql = `
SELECT d.id AS donorId, s.id AS searcherId, s.location AS searcherLocation
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
AND d.id NOT IN (
    SELECT user_id FROM notifications 
    WHERE type = 'nearby_patient' 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
)
    `;

    db.query(sql, (err, results) => {
        if (err) return console.error("Nearby check error:", err);

        // معالجة واحدة بعد واحدة
        const processNext = (index) => {
            if (index >= results.length) return;
createNearbyPatientNotification(results[index].donorId, results[index].searcherId);            console.log(`✅ Notification created for donor ${results[index].donorId}`);
            setTimeout(() => processNext(index + 1), 100);
        };
        processNext(0);
    });
};

cron.schedule("* * * * *", checkNearbyPatients);

module.exports = { checkNearbyPatients };