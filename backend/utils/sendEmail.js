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

    const isDonor = userType === 'donor';

    const subject = isDonor 
        ? "🩸 Verify Your Email - Donor Account"
        : "🆘 Verify Your Email - Blood Request";

    const title = isDonor 
        ? "Welcome Blood Donor ❤️"
        : "Urgent Blood Request 🆘";

    const message = isDonor
        ? "Thank you for joining as a donor. You can help save lives!"
        : "We received your blood request. Please verify to continue.";

    const color = isDonor ? "#e74c3c" : "#c0392b";

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; border:1px solid #eee; border-radius:12px; overflow:hidden">
            
            <!-- Header -->
            <div style="background:${color}; padding:20px; text-align:center;">
                <h1 style="color:white; margin:0;">🩸 Blood Donation Platform</h1>
            </div>

            <!-- Body -->
            <div style="padding:25px;">
                <h2 style="margin-top:0;">${title}</h2>

                <p style="font-size:15px; color:#555;">
                    ${message}
                </p>

                <p>Please use the verification code below:</p>

                <!-- Code Box -->
                <div style="text-align:center; margin:30px 0;">
                    <span style="
                        display:inline-block;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:6px;
                        color:${color};
                        background:#f4f4f4;
                        padding:15px 25px;
                        border-radius:10px;
                    ">
                        ${code}
                    </span>
                </div>

                <p style="font-size:14px; color:#777;">
                    ⏱ This code expires in <strong>1 minute</strong>
                </p>

                ${
                    isDonor
                    ? `<p style="color:#2ecc71;">💚 Your donation can save up to 3 lives!</p>`
                    : `<p style="color:#e67e22;">⚠️ Please verify quickly to find donors faster.</p>`
                }

                <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

                <p style="font-size:12px; text-align:center; color:#aaa;">
                    Blood Donation Platform — Saving Lives Together ❤️
                </p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Blood Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `Verification code: ${code} (expires in 1 minute)`,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email} (${userType})`);
        return true;
    } catch (error) {
        console.error("❌ Email error:", error.message);
        return false;
    }
};
module.exports = sendVerificationEmail;


