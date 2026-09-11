-- ============================================================
-- db_schema.sql
-- WeatherGuard - PostgreSQL / Supabase Schema
-- Smart India Hackathon 2026 | Problem Statement: SIH26073
-- Team: DevOrbit | Theme: Disaster Management & Smart Automation
-- ============================================================

-- Enable PostGIS for geospatial station mapping if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Automatic Weather Stations Registry (Scales to 250+ stations across India)
CREATE TABLE IF NOT EXISTS aws_stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    wmo_id VARCHAR(20) UNIQUE,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    elevation_meters INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Online', -- Online, Degraded, Maintenance
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sensor Telemetry Time-Series
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES aws_stations(station_id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Core meteorological variables
    temperature NUMERIC(5, 2), -- in Celsius
    humidity NUMERIC(5, 2),    -- in %
    pressure NUMERIC(6, 2),    -- in hPa
    wind_speed NUMERIC(5, 2),  -- in km/h
    
    -- Feature engineering lag deltas
    temp_change NUMERIC(5, 2),
    humidity_change NUMERIC(5, 2),
    pressure_change NUMERIC(5, 2),
    wind_change NUMERIC(5, 2),
    temp_rolling_mean NUMERIC(5, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_station_time ON sensor_readings(station_id, recorded_at DESC);

-- 3. Anomaly Detections & Diagnostics
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id BIGSERIAL PRIMARY KEY,
    sensor_reading_id BIGINT REFERENCES sensor_readings(id) ON DELETE CASCADE,
    station_id VARCHAR(50) REFERENCES aws_stations(station_id),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Decision flags
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    severity VARCHAR(20) NOT NULL, -- Normal, Medium, High
    
    -- Model metrics
    isolation_forest_score NUMERIC(6, 4),
    isolation_forest_flag BOOLEAN,
    autoencoder_reconstruction_loss NUMERIC(6, 4),
    autoencoder_flag BOOLEAN,
    rule_violation_count INT DEFAULT 0,
    
    -- Interpretability (SHAP top drivers & natural language diagnosis)
    top_shap_driver VARCHAR(100),
    shap_attributions JSONB,
    explanation TEXT NOT NULL,
    
    -- Quality Standards
    wmo_no8_compliant BOOLEAN DEFAULT TRUE,
    imd_qc_compliant BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomaly_detections(severity);
CREATE INDEX IF NOT EXISTS idx_anomalies_station_time ON anomaly_detections(station_id, detected_at DESC);
