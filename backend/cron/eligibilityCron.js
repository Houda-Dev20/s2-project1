const cron = require("node-cron");
const db = require("../config/db");
const { createEligibilityNotification } = require("../controllers/notificationController");

const runEligibilityCheck = () => {
    console.log("🔄 Running eligibility check...");

    // جلب كل المتبرعين في استعلام واحد بدل forEach
    db.query("SELECT * FROM donors", (err, donors) => {
        if (err) return console.error("Eligibility check error:", err);

        // معالجة واحدة بعد واحدة بدل فتح كل اتصالات دفعة واحدة
        const processNext = (index) => {
            if (index >= donors.length) return;
            createEligibilityNotification(donors[index]);
            setTimeout(() => processNext(index + 1), 100);
        };
        processNext(0);
    });
};

cron.schedule("0 0 * * *", runEligibilityCheck);

module.exports = { runEligibilityCheck };