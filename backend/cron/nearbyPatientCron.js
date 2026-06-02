const db = require("../config/db");
const { createNearbyPatientNotification } = require("../controllers/notificationController");

const checkNearbyPatientsForDonor = (donorId) => {
    const sql = `
        SELECT s.id AS searcherId
        FROM donors d
        JOIN searchers s ON d.location = s.location
        WHERE d.id = ?
          AND d.available = 1
          AND (
              (d.blood_type = 'O-') OR
              (d.blood_type = 'O+' AND s.blood_type_research IN ('O+','A+','B+','AB+')) OR
              (d.blood_type = 'A-' AND s.blood_type_research IN ('A-','AB-','A+','AB+','O-')) OR
              (d.blood_type = 'A+' AND s.blood_type_research IN ('A+','AB+')) OR
              (d.blood_type = 'B-' AND s.blood_type_research IN ('B-','AB-','B+','AB+','O-')) OR
              (d.blood_type = 'B+' AND s.blood_type_research IN ('B+','AB+')) OR
              (d.blood_type = 'AB-' AND s.blood_type_research IN ('AB-','AB+','A-','B-','O-')) OR
              (d.blood_type = 'AB+' AND s.blood_type_research IN ('AB+'))
          )
          AND d.id NOT IN (
              SELECT user_id FROM notifications
              WHERE type = 'nearby_patient'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          )
    `;

    db.query(sql, [donorId], (err, results) => {
        if (err) return console.error("Nearby check error:", err);
        if (results.length === 0) return;

        console.log(`🔍 Found ${results.length} nearby patients for donor ${donorId}`);

        const processNext = (index) => {
            if (index >= results.length) return;
            createNearbyPatientNotification(donorId, results[index].searcherId);
            console.log(`✅ Notification sent to donor ${donorId} for searcher ${results[index].searcherId}`);
            setTimeout(() => processNext(index + 1), 100);
        };
        processNext(0);
    });
};

module.exports = { checkNearbyPatientsForDonor };