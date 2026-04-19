const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();
require("./cron/eligibilityCron");
require("./cron/nearbyPatientCron"); 

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const donorRoutes = require("./routes/donorRoutes");
app.use("/donors", donorRoutes);

const searcherRoutes = require("./routes/searcherRoutes");
app.use("/searchers", searcherRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

app.listen(3000, () => {
console.log("Server running on port 3000");
});