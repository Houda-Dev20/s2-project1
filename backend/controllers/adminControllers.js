const db = require('../config/db');

const getStats = (req, res) => {
    const stats = {};

    // 1. إجمالي المتبرعين
    db.query("SELECT COUNT(*) AS totalDonors FROM donors", (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        stats.totalDonors = result[0].totalDonors;

        // 2. المتبرعين المتاحين
        db.query("SELECT COUNT(*) AS availableDonors FROM donors WHERE available = 1", (err, result2) => {
            if (err) return res.status(500).json({ message: "Database error" });
            stats.availableDonors = result2[0].availableDonors;

            // 3. إجمالي الباحثين عن دم
            db.query("SELECT COUNT(*) AS totalSearchers FROM searchers", (err, result3) => {
                if (err) return res.status(500).json({ message: "Database error" });
                stats.totalSearchers = result3[0].totalSearchers;

                // 4. الأرواح المنقذة في آخر 7 أيام
                db.query(`
                    SELECT COUNT(*) AS livesSavedWeek 
                    FROM donations 
                    WHERE status = 'completed' 
                    AND donation_date >= CURDATE() - INTERVAL 7 DAY
                `, (err, result4) => {
                    if (err) return res.status(500).json({ message: "Database error" });
                    stats.livesSavedWeek = result4[0].livesSavedWeek;

                    // 5. الأرواح المنقذة في آخر 30 يوماً
                    db.query(`
                        SELECT COUNT(*) AS livesSavedMonth 
                        FROM donations 
                        WHERE status = 'completed' 
                        AND donation_date >= CURDATE() - INTERVAL 30 DAY
                    `, (err, result5) => {
                        if (err) return res.status(500).json({ message: "Database error" });
                        stats.livesSavedMonth = result5[0].livesSavedMonth;

                        // 6. توزيع فصائل الدم
                        db.query(`
                            SELECT blood_type, COUNT(*) AS count 
                            FROM donors 
                            GROUP BY blood_type
                        `, (err, result6) => {
                            if (err) return res.status(500).json({ message: "Database error" });
                            stats.bloodTypes = result6;

                            // 7. توزيع المتبرعين حسب الموقع
                            db.query(`
                                SELECT location, COUNT(*) AS count
                                FROM donors
                                GROUP BY location
                            `, (err, result7) => {
                                if (err) return res.status(500).json({ message: "Database error" });
                                stats.donorsByLocation = result7;

                                // 8. فصيلة الدم الأكثر شيوعاً
                                db.query(`
                                    SELECT blood_type, COUNT(*) AS count
                                    FROM donors
                                    GROUP BY blood_type
                                    ORDER BY count DESC
                                    LIMIT 1
                                `, (err, result8) => {
                                    if (err) return res.status(500).json({ message: "Database error" });
                                    stats.mostCommonBloodType = result8[0];

                                    // إرسال جميع الإحصائيات
                                    res.json(stats);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = { getStats };