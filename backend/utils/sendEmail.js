const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "YOUR_EMAIL@gmail.com",
pass: "APP_PASSWORD"
}
});

const sendVerificationEmail = (email, code) => {

const mailOptions = {
from: "YOUR_EMAIL@gmail.com",
to: email,
subject: "Email Verification",
text: `Your verification code is: ${code}`
};

return transporter.sendMail(mailOptions);

};

module.exports = sendVerificationEmail;