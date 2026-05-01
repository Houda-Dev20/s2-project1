const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();
require("./cron/eligibilityCron");
require("./cron/nearbyPatientCron");

const app = express();  

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const donorController = require('./controllers/donorControllers');

app.post('/donors/verify', donorController.verifyAndSaveDonor);
app.post('/donors/request-email-change/:id', donorController.requestEmailChangeDonor);
app.post('/donors/confirm-email-change/:id', donorController.confirmEmailChangeDonor);
app.get('/donors/profile/:id', donorController.getDonorProfile);
const donorRoutes = require("./routes/donorRoutes");
app.use("/donors", donorRoutes);

const searcherRoutes = require("./routes/searcherRoutes");
app.use("/searchers", searcherRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

const donationRoutes = require("./routes/donationRoutes");
app.use("/donations", donationRoutes);

// تشغيل الخادم
app.listen(3000, () => {
    console.log("Server running on port 3000");
});