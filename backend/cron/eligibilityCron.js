const cron = require("node-cron");
const db = require("../config/db");
const { createEligibilityNotification } = require("../controllers/notificationController");

cron.schedule("0 0 * * *", () => {
    console.log("🔄 Running eligibility check...");

    db.query("SELECT * FROM donors", (err, donors) => {
        if (err) return console.log(err);

        donors.forEach(donor => {
            createEligibilityNotification(donor);
        });
    });

});
