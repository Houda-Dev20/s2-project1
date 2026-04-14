const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "process.env.email@gmail.com",
pass: "process.env.app pss"
}
});

const sendVerificationEmail = (email, code) => {

const mailOptions = {
from: "email@gmail.com",
to: email,
subject: "Email Verification",
text: `Your verification code is: ${code}`
};

return transporter.sendMail(mailOptions);

};

module.exports = sendVerificationEmail;