import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      `SMTP not configured — skipping email send to ${to} (subject: ${subject})`
    );
    return { skipped: true };
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return info;
};

export const passwordResetEmailTemplate = (name, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #1e293b;">Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your Emerson University LMS password. This link expires in 15 minutes.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

export const verifyEmailTemplate = (name, verifyUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #1e293b;">Welcome to Emerson University LMS</h2>
    <p>Hi ${name},</p>
    <p>Please verify your email address to activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Verify Email</a>
  </div>
`;
