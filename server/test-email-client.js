// Simple script to test the email API endpoint directly
const axios = require('axios');
require('dotenv').config();

// Configuration
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
const testEmail = process.env.EMAIL_USER; // Use the same email from your .env file

console.log('Using email:', testEmail);
console.log('Using server URL:', serverUrl);

// Test data
const testData = {
  email: testEmail,
  reportData: {
    results: [
      'Eczema',
      'A chronic skin condition characterized by itchy, inflamed skin.',
      'Itching, dry skin, redness, scaling, and flaking.',
      'Genetic factors, allergens, and environmental irritants.',
      'Topical corticosteroids, moisturizers, and avoiding triggers.'
    ],
    treatments: [
      'Apply coconut oil to moisturize the skin',
      'Use aloe vera gel for its soothing properties',
      'Take oatmeal baths to relieve itching',
      'Apply a mixture of honey and olive oil for hydration'
    ]
  }
};

async function runTests() {
  console.log('Starting email API tests');
  
  try {
    // Test 1: Check server connectivity
    console.log('\nTest 1: Checking server status');
    const statusResponse = await axios.get(`${serverUrl}/api/test`, { timeout: 10000 });
    console.log('Server status:', statusResponse.data);
    
    // Test 2: Send test email
    console.log('\nTest 2: Sending test email to', testEmail);
    console.log('Request data:', JSON.stringify(testData));
    
    const emailResponse = await axios.post(
      `${serverUrl}/api/send-report`,
      testData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // Increased timeout for email sending
      }
    );
    
    console.log('Email API response:', emailResponse.data);
    
    if (emailResponse.data.success) {
      console.log('✓ Email sent successfully!');
      console.log('Message ID:', emailResponse.data.messageId);
    } else {
      console.error('✗ Email sending failed');
    }
    
  } catch (error) {
    console.error('Error during tests:');
    
    if (error.response) {
      // Server responded with an error status
      console.error('Server error:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Check for specific error types
      if (error.response.status === 404) {
        console.error('Endpoint not found. Make sure the server is running and endpoints are correctly configured.');
      } else if (error.response.status === 500) {
        console.error('Server internal error. Check the server logs for more details.');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received. Is the server running?');
      console.error('Request details:', error.request._currentUrl || error.request);
      
      if (error.code === 'ECONNREFUSED') {
        console.error(`Connection refused at ${serverUrl}`);
        console.error('Make sure the server is running and the port is correct.');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out. The server might be overloaded or unreachable.');
      }
    } else {
      // Error setting up the request
      console.error('Error message:', error.message);
    }
    
    // Exit with error code
    process.exit(1);
  }
  
  // Exit successfully
  process.exit(0);
}

// Run the tests
runTests(); 