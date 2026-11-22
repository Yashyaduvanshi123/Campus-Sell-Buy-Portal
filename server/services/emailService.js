const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email in dev mode
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Created Ethereal test email account for dev reset links.');
    } catch {
      transporter = {
        sendMail: async (options) => {
          console.log('\n--- SIMULATED EMAIL ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Reset URL: ${options.text || options.html}`);
          console.log('------------------------\n');
          return { messageId: 'simulated-id' };
        }
      };
    }
  }

  return transporter;
};

const sendPasswordResetEmail = async ({ toEmail, resetUrl, userName }) => {
  const mailer = await getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Campus Sell & Buy" <no-reply@campusmarket.edu>',
    to: toEmail,
    subject: 'Password Reset Request - Campus Sell & Buy Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #059669; margin-bottom: 16px;">Campus Sell & Buy Portal</h2>
        <p>Hello ${userName || 'Student'},</p>
        <p>You requested a password reset for your Campus Sell & Buy account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Campus Sell & Buy Portal - Connecting Student Buyers and Sellers</p>
      </div>
    `,
    text: `Hello ${userName || 'Student'},\n\nYou requested a password reset. Please click or paste the following link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\nIf you did not request this, ignore this email.`
  };

  const info = await mailer.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendPasswordResetEmail
};
