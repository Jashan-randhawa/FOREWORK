import nodemailer from "nodemailer";

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
    const fromAddress = process.env.EMAIL_FROM || "no-reply@forework.com";
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
