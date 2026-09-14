import nodemailer from "nodemailer";
import config from "../config/index.js";

let transporter = null;

if (config.email.smtpHost && config.email.smtpUser) {
  transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort || 587,
    secure: config.email.smtpPort === 465,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
  });
} else {
  // Safe mock client in dev/test/staging without SMTP
  transporter = {
    sendMail: async (options) => {
      // In dev/test, safely simulate successful send
      return {
        messageId: `mock_${Date.now()}`,
        accepted: [options.to],
        rejected: [],
      };
    },
  };
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const fromAddress = config.email.from || "no-reply@forework.com";
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || "Transactional notification from FOREWORK",
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email Client Error] Failed to send email:", err.message);
    return { success: false, error: err.message };
  }
};

export default {
  sendEmail,
};
