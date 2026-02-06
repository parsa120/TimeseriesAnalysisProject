// Type definitions for time series analysis

export interface TimeSeriesData {
  values: number[];
  labels: string[];
}

export interface ParameterEstimationResult {
  mme: Record<string, Record<string, number>>;
  mse: Record<string, Record<string, number>>;
}

export interface AnalysisResults {
  autocorrelations: { lag: number; value: number }[];
  pacf: Array<{ lag: number; value: number }>;
  trendCoefficient: number;
  hasTrend: boolean;
  aiFeedback?: string;
  arParameters?: ParameterEstimationResult;  // ADD THIS
  maParameters?: ParameterEstimationResult;  // ADD THIS
}
