import axios from 'axios';
import { AnalysisResult } from '../types';
import { Platform } from 'react-native';

// Get the correct backend URL based on platform
const getBackendUrl = () => {
  
  // For Android Emulator, localhost needs to be 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  // For iOS Simulator, localhost works fine
  else if (Platform.OS === 'ios') {
    return 'http://localhost:5000';
  }
  // Default to localhost for web and other platforms
  else {
    return 'http://localhost:5000';
  }
};

// Configure backend URL
const BACKEND_URL = getBackendUrl();

// Number of retry attempts for connection issues
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds

export interface EmailReportData {
  results: AnalysisResult;
  treatments: string[];
}

/**
 * Helper function to wait for a specified time
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tests the connection to the email server
 */
const testServerConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/test`, { timeout: 5000 });
    return true;
  } catch (error: any) {
    return false;
  }
};

/**
 * Sends an email report to the user with analysis results
 * @param email The recipient's email address
 * @param reportData The skin analysis data to include in the report
 * @returns Promise with the response data from the server
 */
const sendEmailReport = async (email: string, reportData: EmailReportData): Promise<any> => {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      // First check if the server is reachable
      const isConnected = await testServerConnection();
      
      if (!isConnected && retries < MAX_RETRIES) {
        retries++;
        await wait(RETRY_DELAY);
        continue;
      }
      
      if (!isConnected) {
        throw new Error("Unable to connect to the email server after multiple attempts");
      }
      
      // Format the data for the API
      const formattedData = {
        email,
        reportData: {
          results: [
            reportData.results.name || 'Unknown condition',
            reportData.results.description || 'No description available',
            reportData.results.symptoms || 'No symptoms listed',
            reportData.results.causes || 'No causes listed',
            reportData.results.treatment || 'No treatment information'
          ],
          treatments: reportData.treatments || []
        }
      };
      
      
      // Send the request to the API
      const response = await axios.post(`${BACKEND_URL}/api/send-report`, formattedData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      });
      
      // Log and return the result
      return response.data;
    } catch (error: any) {
      // Only retry for connection-related errors
      const isConnectionError = !error.response && (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' ||
        error.message.includes('Network Error')
      );
      
      if (isConnectionError && retries < MAX_RETRIES) {
        retries++;
        await wait(RETRY_DELAY);
        continue;
      }
      
    
      
      // Handle specific errors
      if (!error.response && error.code === 'ECONNREFUSED') {
        throw new Error(`Could not connect to email server. Make sure the server is running at ${BACKEND_URL}`);
      }
      
      // Server responded with an error
      if (error.response) {
        throw new Error(`Server error: ${error.response.data?.error || error.message}`);
      }
      
      // Generic error
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
  
  throw new Error("Maximum retry attempts exceeded");
};

export default sendEmailReport;