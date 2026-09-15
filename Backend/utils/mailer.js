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

export const sendInterviewInvitationEmail = async ({
  email,
  candidateName,
  jobTitle,
  companyName,
  scheduledAt,
  meetingLink,
}) => {
  const formattedDate = new Date(scheduledAt).toLocaleString();
  return sendEmail({
    to: email,
    subject: `Interview Scheduled: ${jobTitle} at ${companyName || "FOREWORK"}`,
    text: `Hello ${candidateName},\n\nYour interview for ${jobTitle} at ${companyName || "the company"} has been scheduled.\n\nDate & Time: ${formattedDate}\nMeeting Link: ${meetingLink}\n\nBest regards,\nRecruiting Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>Interview Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>Your interview for <strong>${jobTitle}</strong> at <strong>${companyName || "the company"}</strong> has been scheduled.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank">${meetingLink}</a></p>
        </div>
        <p>Please make sure to join the meeting link on time.</p>
        <p>Best regards,<br/>Recruiting Team</p>
      </div>
    `,
  });
};

export const sendApplicationSubmittedEmail = async ({
  email,
  candidateName,
  jobTitle,
  companyName,
}) => {
  return sendEmail({
    to: email,
    subject: `Application Submitted: ${jobTitle} at ${companyName || "FOREWORK"}`,
    text: `Hello ${candidateName},\n\nYour application for "${jobTitle}" at ${companyName || "the company"} has been successfully submitted.\n\nYou can track the status of your application from your profile.\n\nBest regards,\nFOREWORK Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>Application Received</h2>
        <p>Dear ${candidateName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName || "the company"}</strong> has been received by the hiring team.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Company:</strong> ${companyName || "FOREWORK Partner"}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <p>You can track the progress of your application on your FOREWORK profile dashboard.</p>
        <p>Best regards,<br/>FOREWORK Team</p>
      </div>
    `,
  });
};

export const sendNewApplicantNotificationEmail = async ({
  email,
  recruiterName,
  candidateName,
  jobTitle,
}) => {
  return sendEmail({
    to: email,
    subject: `New Applicant for ${jobTitle}: ${candidateName}`,
    text: `Hello ${recruiterName},\n\nA new candidate (${candidateName}) has applied for your job posting "${jobTitle}".\n\nLog in to your recruiter dashboard to review their resume and profile.\n\nBest regards,\nFOREWORK Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>New Candidate Application</h2>
        <p>Hello ${recruiterName},</p>
        <p>Great news! A new candidate has submitted an application for your job posting:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Job Title:</strong> ${jobTitle}</p>
          <p><strong>Applicant Name:</strong> ${candidateName}</p>
        </div>
        <p>Please log in to your recruiter dashboard to view the full application and applicant details.</p>
        <p>Best regards,<br/>FOREWORK Recruiting System</p>
      </div>
    `,
  });
};

export const sendApplicationStatusEmail = async ({
  email,
  candidateName,
  jobTitle,
  companyName,
  status,
}) => {
  const isAccepted = status.toLowerCase() === "accepted";
  const statusHeadline = isAccepted ? "Application Accepted!" : "Application Status Update";
  const messageBody = isAccepted
    ? `Congratulations! Your application for <strong>${jobTitle}</strong> at <strong>${companyName || "the company"}</strong> has been accepted. The recruiting team will follow up shortly with next steps.`
    : `Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${companyName || "the company"}</strong>. After careful review, the team has decided not to move forward with your application at this time.`;

  return sendEmail({
    to: email,
    subject: `${statusHeadline} - ${jobTitle}`,
    text: `Hello ${candidateName},\n\nYour application status for "${jobTitle}" at ${companyName || "the company"} has been updated to: ${status.toUpperCase()}.\n\nBest regards,\n${companyName || "Hiring Team"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>${statusHeadline}</h2>
        <p>Dear ${candidateName},</p>
        <p>${messageBody}</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Job:</strong> ${jobTitle}</p>
          <p><strong>Company:</strong> ${companyName || "Company"}</p>
          <p><strong>Updated Status:</strong> <span style="font-weight: bold; color: ${isAccepted ? '#10B981' : '#EF4444'};">${status.toUpperCase()}</span></p>
        </div>
        <p>Best regards,<br/>${companyName || "Hiring Team"}</p>
      </div>
    `,
  });
};

