# Derma Analyzer - Skin Disease Detection App

A mobile application for skin disease detection and analysis using image processing and AI.

## Setup Instructions

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. If you're experiencing TypeScript errors:
   ```
   npm run clear-cache
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the `.env` file in the server directory with your Gmail credentials:
   ```
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_app_password
   PORT=5000
   ```
   
   Note: For Gmail, you'll need to use an App Password. To generate one:
   - Enable 2-Step Verification in your Google Account
   - Go to Security → App passwords
   - Generate a new app password for "Mail" and "Other"
   - Use this password in the .env file

4. Start the backend server:
   ```
   npm run dev
   ```

5. Test the email functionality directly:
   - Open `server/test-email.html` in a browser
   - Enter your email and click "Test Server Connection"
   - If successful, click "Send Test Email"

## Troubleshooting

### Email Issues

If you're experiencing problems with email sending:

1. **Check server status**: Make sure the server is running at http://localhost:5000. Try accessing this URL in your browser to verify.

2. **Test the email directly**: Use the `server/test-email.html` file to test the email sending functionality outside the app.

3. **Check email credentials**: Verify your Gmail credentials in the `.env` file. Make sure:
   - You're using an App Password, not your regular password
   - 2-Step Verification is enabled on your Google account
   - The email and password are correct

4. **Debug with console logs**: Check server console for detailed logs. You should see:
   - Connection to SMTP server
   - Request data from the app
   - PDF generation messages
   - Email sending confirmation

5. **Network issues**: If using a physical device, make sure to update the `BACKEND_URL` in `services/emailService.ts` with your computer's local IP address.

### Frontend Issues

If you're seeing TypeScript/JSX errors:

1. Clear the cache and restart:
   ```
   npm run clear-cache
   ```

2. Make sure the server is running before testing email functionality.

3. If needed, run the TypeScript compiler to check errors:
   ```
   npm run tsc
   ```

### Connection Issues

If the app cannot connect to the backend:

1. Verify that both frontend and backend are running
2. Check the `BACKEND_URL` in `services/emailService.ts`
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. For physical devices, use your computer's local IP address
