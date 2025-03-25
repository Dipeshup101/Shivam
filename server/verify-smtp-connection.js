require('dotenv').config();
const nodemailer = require('nodemailer');
const { createLogger, format, transports } = require('winston');

// Create a logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
});

// Check for required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_HOST', 'EMAIL_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  logger.info('Please add these variables to your .env file and try again.');
  process.exit(1);
}

// Log SMTP settings (without showing the full password)
logger.info('Verifying SMTP connection with the following settings:');
logger.info(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
logger.info(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
logger.info(`EMAIL_USER: ${process.env.EMAIL_USER}`);
logger.info(`EMAIL_PASS: ${'•'.repeat(6)}${process.env.EMAIL_PASS.slice(-2)}`);
logger.info(`EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'false'}`);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true // Enable debug output
});

// Verify SMTP connection
logger.info('Attempting to verify SMTP connection...');

async function testConnection() {
  try {
    // Instead of using verify(), create a connection directly
    await transporter.verify();
    logger.info('✅ SMTP connection verified successfully!');
    logger.info('Your email configuration is working correctly.');
    
    // Optional: Send a test email to yourself
    if (process.argv.includes('--send-test')) {
      logger.info('Sending test email to verify full email delivery...');
      
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'SMTP Connection Test',
        text: 'If you received this email, your SMTP configuration is working correctly!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #4F46E5;">SMTP Connection Test</h2>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <p>Configuration details:</p>
            <ul>
              <li>Host: ${process.env.EMAIL_HOST}</li>
              <li>Port: ${process.env.EMAIL_PORT}</li>
              <li>User: ${process.env.EMAIL_USER}</li>
              <li>Secure: ${process.env.EMAIL_SECURE || 'false'}</li>
            </ul>
            <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
              This is an automated test email from your Derma Analyzer application.
            </p>
          </div>
        `
      });
      
      logger.info(`✅ Test email sent successfully! Message ID: ${info.messageId}`);
      logger.info(`Check your inbox at ${process.env.EMAIL_USER}`);
    }
    
    return true;
  } catch (error) {
    logger.error('❌ SMTP connection verification failed!');
    logger.error(`Error: ${error.message}`);
    
    // Provide helpful suggestions based on common errors
    if (error.code === 'ECONNREFUSED') {
      logger.info('Suggestion: Check if the host and port are correct and if the SMTP server is accessible from your network.');
    } else if (error.code === 'ETIMEDOUT') {
      logger.info('Suggestion: The connection timed out. Check your firewall settings or try a different port.');
    } else if (error.code === 'EAUTH') {
      logger.info('Suggestion: Authentication failed. Verify your username and password.');
      logger.info('Note: If you\'re using Gmail, make sure you\'ve enabled "Less secure app access" or are using an App Password.');
    } else if (error.responseCode >= 500) {
      logger.info('Suggestion: The SMTP server rejected the request. Check your SMTP settings and credentials.');
    }
    
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  });

logger.info('Usage: node verify-smtp-connection.js [--send-test]');
logger.info('  --send-test  Sends a test email to verify full email delivery'); 