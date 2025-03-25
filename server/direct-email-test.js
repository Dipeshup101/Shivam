// Simple script to test email functionality directly
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration - Use the same email from .env file to test sending to yourself
const emailToSend = process.env.EMAIL_USER; // Send to the same email
const subject = 'Derma Analyzer Test Email';
const message = 'This is a test email from Derma Analyzer. If you receive this, email functionality is working correctly.';

// Verify environment variables
console.log('Environment check:');
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_USER value:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587');
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE || 'false');

// Check required env vars
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('ERROR: Missing required environment variables. Please check your .env file.');
  console.error('Make sure EMAIL_USER and EMAIL_PASS are set.');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production' // Only reject unauthorized in production
  }
});

// Main function to test email
async function testEmail() {
  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP server connection successful');
    
    // Send test email
    console.log('Sending test email to:', emailToSend);
    const mailOptions = {
      from: `"Derma Analyzer" <${process.env.EMAIL_USER}>`,
      to: emailToSend,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #4F46E5;">Derma Analyzer Test Email</h2>
        <p>${message}</p>
        <p style="color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
          This is an automated test email sent at ${new Date().toLocaleString()}
        </p>
      </div>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    
    // Provide helpful suggestions based on error
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if your EMAIL_HOST and EMAIL_PORT are correct.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Check your firewall settings or try a different port.');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed. Verify your username and password.');
      console.error('If using Gmail with 2FA, make sure you\'re using an App Password.');
    } else if (error.responseCode >= 500) {
      console.error('SMTP server rejected the request. Check your SMTP settings and credentials.');
    }
    
    return false;
  }
}

// Run the test
testEmail()
  .then(success => {
    process.exit(success ? 0 : 1);
  }); 