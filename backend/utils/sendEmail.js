require('dotenv').config(); 
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
});

const sendVerificationEmail = async  (email, code) => {

const mailOptions = {
from: process.env.EMAIL_USER,
to: email,
subject: "Email Verification - Blood Donation",
text: `Your verification code is: ${code}`,
html: `<div style="font-family: Arial; padding: 20px;">
                <h2>Welcome to Blood Donation Platform</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #e74c3c;">${code}</h1>
                <p>Enter this code to verify your email address.</p>
               </div>`
};

try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to:", email);
        return true;
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
        return false;
    }
};

module.exports = sendVerificationEmail;


