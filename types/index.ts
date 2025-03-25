export interface Disease {
  name: string;
  icon: string;
}

export interface AnalysisResult {
  name: string;
  description: string;
  symptoms: string;
  causes: string;
  treatment: string;
}

export interface PredictionResponse {
  data: [string, string, string, string, string];
  duration: number;
  average_duration: number;
} 