// sendEmail.js — Nodemailer helper for transactional emails
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a transactional email.
 * @param {{ to: string, subject: string, text: string, html?: string }} opts
 */
async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"Todo App" <${process.env.SMTP_FROM || 'no-reply@todoapp.com'}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  });
}

module.exports = { sendEmail };
