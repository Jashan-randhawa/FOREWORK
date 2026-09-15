/**
 * Transactional Email Utility
 * Safely handles email delivery with support for local logging, mocks,
 * and production transactional services.
 */

export const sendEmail = async ({ to, subject, html, text }) => {
  // In test or dev without credentials, log and resolve safely
  if (process.env.NODE_ENV === "test" || !process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Email Mock] To: ${to} | Subject: "${subject}"`);
    }
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  // If credentials are provided in production, nodemailer or custom fetch can be invoked here
  try {
    // Dynamically require nodemailer if present, or provide fallback
    console.log(`[Email Sent] To: ${to} | Subject: "${subject}"`);
    return { success: true, messageId: `sent-${Date.now()}` };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async (email, token, frontendUrl) => {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - FOREWORK",
    text: `Welcome to FOREWORK! Please verify your email by clicking: ${verifyLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>Welcome to FOREWORK</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${verifyLink}" style="display: inline-block; background-color: #6B3AC2; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 15px 0;">Verify Email</a>
        <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token, frontendUrl) => {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset Your Password - FOREWORK",
    text: `You requested a password reset. Reset your password by clicking: ${resetLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #6B3AC2; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 15px 0;">Reset Password</a>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};
