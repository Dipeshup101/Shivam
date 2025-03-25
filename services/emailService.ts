import axios from 'axios';
import { AnalysisResult } from '../types';

const BACKEND_URL = 'http://localhost:5000'; // Update with your backend URL

export interface EmailReportData {
  results: AnalysisResult;
  treatments: string[];
}

export const sendEmailReport = async (email: string, reportData: EmailReportData): Promise<any> => {
  try {
    console.log('Sending email to:', email);
    console.log('Report data:', reportData);
    
    const response = await axios.post(`${BACKEND_URL}/api/send-report`, {
      email,
      reportData: {
        results: [
          reportData.results.name,
          reportData.results.description,
          reportData.results.symptoms,
          reportData.results.causes,
          reportData.results.treatment
        ],
        treatments: reportData.treatments
      }
    });
    
    console.log('Email service response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in email service:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to send email');
  }
};

export default sendEmailReport;