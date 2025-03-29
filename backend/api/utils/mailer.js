import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, // You can use other services like Yahoo, Outlook, etc.
  auth: {
    user: process.env.GMAIL, // Your email address
    pass: process.env.GMAIL_PASSWORD, // Your email password or app-specific password (if 2FA enabled)
  },
});



export async function sendMail(mailOptions) {
  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error occurred:", error);
    }
    console.log("Email sent successfully:", info.response);
  });
}
