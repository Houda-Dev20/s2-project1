const cron = require("node-cron");
const db = require("../config/db");

const { createNearbyPatientNotification } = require("../controllers/notificationController");

const checkNearbyPatients = () => {

    const sql = `
        SELECT d.id AS donorId
        FROM donors d
        JOIN searchers s
        ON d.location = s.location
        AND d.blood_type = s.blood_type_research
        WHERE d.available = 1
    `;

    db.query(sql, (err, results) => {
        if (err) return console.log(err);

        results.forEach(row => {

            const checkSql = `
                SELECT id FROM notifications 
                WHERE donor_id = ? AND type = 'nearby_patient'
            `;

            db.query(checkSql, [row.donorId], (err, res) => {

                if (err) return console.log(err);

                if (res.length === 0) {
                    createNearbyPatientNotification(row.donorId);
                }

            });
        });
    });
};

cron.schedule("0 * * * *", () => {
    console.log("🔍 Checking nearby patients...");
    checkNearbyPatients();
});