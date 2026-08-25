/**
 * Email service using Brevo (Sendinblue) HTTP API.
 *
 * Uses Brevo's transactional email endpoint over HTTPS to send emails
 * reliably across all cloud hosting providers (e.g. Railway) without SMTP restrictions.
 */
const axios = require('axios');

/**
 * Generic email sender using Brevo HTTP API.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Haven Hideaway',
          email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || error.message || 'Failed to send email via Brevo';
    console.error('[Brevo Email Error]:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Send an account-verification email.
 * @param {string} toEmail - Recipient email address
 * @param {string} verificationLink - Full verification URL
 */
async function sendVerificationEmail(toEmail, verificationLink) {
  return await sendEmail({
    to: toEmail,
    subject: 'Verify your Haven Hideaway account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px 24px; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #a78bfa; font-size: 26px; font-weight: 800; margin: 0 0 6px;">Haven Hideaway</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Your sanctuary community</p>
        </div>

        <h2 style="color: #f1f5f9; font-size: 20px; font-weight: 700; margin: 0 0 12px;">Welcome! Please verify your email</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
          Thank you for joining Haven Hideaway. Click the button below to confirm your email address and activate your account.
        </p>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${verificationLink}"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px;">
            ✓ Verify My Email
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 0 0 24px;">
          ${verificationLink}
        </p>

        <hr style="border: none; border-top: 1px solid #1e293b; margin: 0 0 20px;" />

        <p style="color: #475569; font-size: 12px; line-height: 1.5; margin: 0;">
          This link expires in <strong style="color: #94a3b8;">24 hours</strong>.
          If you didn't create a Haven Hideaway account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
