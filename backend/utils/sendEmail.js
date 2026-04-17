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

const sendVerificationEmail = async (email, code, userType = 'user') => {
    const subject = userType === 'donor' 
        ? "Verify Your Email - Blood Donor Registration"
        : "Verify Your Email - Blood Request Registration";

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; background-color: #e74c3c; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🩸 Blood Donation Platform</h1>
            </div>
            <div style="padding: 20px;">
                <h2>Welcome ${userType === 'donor' ? 'Donor' : 'Seeker'}!</h2>
                <p>Thank you for registering with our Blood Donation Platform.</p>
                <p>Please use the verification code below to complete your registration:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e74c3c; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                        ${code}
                    </div>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in <strong>1 minute</strong>.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; text-align: center;">Blood Donation Platform - Saving Lives Together</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Blood Donation Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `Your verification code is: ${code}\n\nThis code will expire in 1 minute.`,
        html: htmlContent
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to: ${email} (${userType})`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        return false;
    }
};

module.exports = sendVerificationEmail;


