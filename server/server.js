const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create the Express app
const app = express();

// Make console.log more informative for objects
const betterLog = (label, obj) => {
  console.log(`${label}:`, JSON.stringify(obj, null, 2));
};

// Configure CORS to allow all origins
app.use(cors({
    origin: '*', // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request headers:', JSON.stringify(req.headers));
    if (req.method !== 'GET') {
        console.log('Request body:', JSON.stringify(req.body || {}));
    }
    next();
});

// Increase payload size limits for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Log environment variables (without exposing actual values)
// console.log('Environment check:');
// console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
// console.log('EMAIL_USER value:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
// console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
// console.log('Port to be used:', process.env.PORT || 5000);

// Simple homepage route
app.get('/', (req, res) => {
  res.send('Derma Analyzer Email Server is running. Go to /api/test for API test.');
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running correctly',
    time: new Date().toISOString()
  });
});

// Configure nodemailer with detailed logging
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

// Verify SMTP connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
    console.error('This may be due to:');
    console.error('1. Incorrect email or password');
    console.error('2. Less secure app access not enabled');
    console.error('3. 2FA enabled but no app password used');
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// HTML template for email
const generateEmailHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(to right, #4F46E5, #7C3AED);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
            color: #4F46E5;
            font-size: 1.2em;
            margin-bottom: 10px;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 5px;
        }
        .treatment-list {
            list-style-type: none;
            padding-left: 0;
        }
        .treatment-item {
            padding: 10px;
            border-left: 3px solid #4F46E5;
            margin-bottom: 10px;
            background: white;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Skin Disease Detection Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
        <div class="section-title">Disease Name</div>
        <p>${data.results && data.results[0] ? data.results[0] : 'Not identified'}</p>
    </div>

    <div class="section">
        <div class="section-title">Description</div>
        <p>${data.results && data.results[1] ? data.results[1] : 'No description available'}</p>
    </div>

    <div class="section">
        <div class="section-title">Related Issues</div>
        <p>${data.results && data.results[2] ? data.results[2] : 'No related issues identified'}</p>
    </div>

    <div class="section">
        <div class="section-title">Risk Factors</div>
        <p>${data.results && data.results[3] ? data.results[3] : 'No risk factors identified'}</p>
    </div>

    <div class="section">
        <div class="section-title">Recommended Treatments</div>
        <ul class="treatment-list">
            ${data.treatments && data.treatments.length ? data.treatments.map(treatment => `
                <li class="treatment-item">${treatment}</li>
            `).join('') : '<li class="treatment-item">No specific treatments available</li>'}
        </ul>
    </div>

    <div class="footer">
        <p>This is an automated report from Derma Analyzer</p>
        <p>Please consult with a healthcare professional for medical advice</p>
    </div>
</body>
</html>
`;

// Generate PDF from HTML
const generatePDF = (html) => {
    return new Promise((resolve, reject) => {
        try {
            const options = {
                format: 'Letter',
                border: {
                    top: "20px",
                    right: "20px",
                    bottom: "20px",
                    left: "20px"
                },
                timeout: 60000 // 60 seconds timeout
            };

            // Create the PDF
            pdf.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    console.error('PDF generation error:', err);
                    reject(err);
                } else {
                    console.log('PDF generated successfully, size:', buffer.length, 'bytes');
                    resolve(buffer);
                }
            });
        } catch (error) {
            console.error('Error in PDF generation:', error);
            reject(error);
        }
    });
};

// Main email sending endpoint
app.post('/api/send-report', async (req, res) => {
    console.log('Received email request at:', new Date().toISOString());
    console.log('Request body exists:', !!req.body);
    console.log('Email address in request:', req.body?.email);
    
    try {
        // Validate request body
        if (!req.body) {
            return res.status(400).json({
                success: false,
                error: 'Request body is missing'
            });
        }
        
        const { email, reportData } = req.body;
        
        // Validate email
        if (!email) {
            console.error('Missing email address in request');
            return res.status(400).json({ 
                success: false, 
                error: 'Email address is required' 
            });
        }
        
        // Validate report data
        if (!reportData || !reportData.results) {
            console.error('Missing report data in request:', reportData);
            return res.status(400).json({ 
                success: false, 
                error: 'Report data is required' 
            });
        }
        
        console.log('Processing report for email:', email);
        betterLog('Report data', reportData);
        
        try {
            // Generate HTML content for email
            const htmlContent = generateEmailHTML(reportData);
            console.log('HTML content generated, length:', htmlContent.length);
            
            // Generate PDF attachment
            console.log('Generating PDF...');
            const pdfBuffer = await generatePDF(htmlContent);

            // Set up email data
            const mailOptions = {
                from: `"Derma Analyzer" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Skin Disease Detection Report - ${reportData.results[0] || 'Analysis'}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: 'skin-disease-report.pdf',
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            // Send the email
            console.log('Attempting to send email to:', email);
            const info = await transporter.sendMail(mailOptions);
            console.log('Message sent successfully! ID:', info.messageId);
            
            // Return success response
            return res.json({ 
                success: true, 
                messageId: info.messageId 
            });
        } catch (pdfError) {
            console.error('Error in PDF generation or email sending:', pdfError);
            return res.status(500).json({ 
                success: false, 
                error: pdfError.message,
                step: 'PDF generation or email sending'
            });
        }
    } catch (error) {
        console.error('Error processing email request:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
});

// Status endpoint to check server status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        email_configured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other application or use a different port.`);
        process.exit(1);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server has been terminated');
        process.exit(0);
    });
}); 