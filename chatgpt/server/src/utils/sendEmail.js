// src/utils/sendEmail.js
const nodemailer = require('nodemailer');

// Transport configuration using environment variables (Mailtrap/Ethereal placeholders)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {Object} options - nodemailer mail options (to, subject, text, html)
 * @returns {Promise} resolves on successful send
 */
function sendMail(options) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    ...options,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
