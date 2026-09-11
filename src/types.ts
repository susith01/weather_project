/**
 * WeatherGuard Core Types & Interfaces
 */

export type Severity = "All" | "Normal" | "Medium" | "High";
export type DetectionModel = "hybrid" | "isolation_forest" | "autoencoder";
export type AppTheme = "purple" | "midnight";

export interface AWSStationInfo {
  id: string;
  name: string;
  code: string;
  state: string;
  region: "North" | "South" | "East" | "West" | "Central" | "Northeast" | "Himalayan";
  latitude: number;
  longitude: number;
  elevationM: number;
  wmoStationId: string;
  activeSensors: string[];
  status: "Online" | "Degraded" | "Maintenance";
  lastPing: string;
  baselineTemp: number;
  baselineHumidity: number;
  baselinePressure: number;
  baselineWind: number;
}

export interface ShapAttribution {
  feature: string;
  displayName: string;
  value: number;
  attribution: number; // positive = pushes to anomaly, negative = pulls to normal
  direction: "anomaly" | "normal";
}

export interface WMOComplianceCheck {
  ruleId: string;
  name: string;
  standard: "WMO-No. 8" | "IMD-QC-2024";
  targetSensor: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

export interface WeatherRawRecord {
  id: number;
  timestamp: string;
  stationId?: string;
  temperature: number | string;
  humidity: number | string;
  pressure: number | string;
  wind_speed: number | string;
}

export interface WeatherProcessedRecord {
  id: number;
  timestamp: string;
  dateObj: Date;
  stationId?: string;
  
  // Cleaned variables
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;

  // Validation flags (WMO/IMD physical boundaries)
  temperature_invalid: boolean;
  humidity_invalid: boolean;
  pressure_invalid: boolean;
  wind_invalid: boolean;
  validation_error_count: number;
  validation_anomaly: boolean;

  // Feature Engineering
  temp_change: number;
  humidity_change: number;
  pressure_change: number;
  wind_change: number;
  temp_rolling_mean: number;
  temp_rolling_std: number;
  humidity_rolling_mean: number;
  pressure_rolling_mean: number;
  hour: number;
  day_of_week: number;
  month_number: number;
  temp_humidity_ratio: number;

  // Domain & Physical Rules
  rule_temperature: boolean;
  rule_humidity: boolean;
  rule_pressure: boolean;
  rule_wind: boolean;
  rule_sudden_change: boolean;
  rule_count: number;
  rule_anomaly: boolean;

  // Primary ML: Isolation Forest
  ml_anomaly: boolean;
  anomaly_score: number;

  // Advanced ML: Deep Autoencoder (Temporal & Sequence Reconstruction Loss)
  autoencoder_loss: number;
  autoencoder_anomaly: boolean;

  // Interpretability: SHAP Feature Attribution
  shap_attributions: ShapAttribution[];

  // WMO / IMD Standards Compliance
  wmo_checks?: WMOComplianceCheck[];

  // Final Hybrid Decision & Meta
  anomaly: boolean;
  severity: "Normal" | "Medium" | "High";
  explanation: string;
}

export interface PipelineStepInfo {
  step: number;
  id: string;
  title: string;
  file: string;
  description: string;
  status: "idle" | "running" | "completed";
  durationMs?: number;
  outputSummary?: string;
}

export interface PipelineExecutionStats {
  totalRecords: number;
  totalAnomalies: number;
  totalNormal: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  anomalyRate: number;
  ruleOnlyAnomalies: number;
  mlOnlyAnomalies: number;
  autoencoderAnomalies: number;
  dualAnomalies: number;
  avgInferenceLatencyMs: number;
}

