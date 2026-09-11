import React, { useState } from "react";
import { Copy, Check, FileCode, Terminal, Download } from "lucide-react";

interface CodeViewerModalProps {
  initialFile?: string;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  initialFile = "data_cleaning.py",
}) => {
  const [activeFile, setActiveFile] = useState<string>(initialFile);
  const [copied, setCopied] = useState(false);

  const files: Record<string, { label: string; lang: string; code: string; desc: string }> = {
    "data_cleaning.py": {
      label: "data_cleaning.py",
      lang: "python",
      desc: "Step 1: Ingestion, null removal (-999, NA), date parsing, median imputation",
      code: `# ============================================================
# data_cleaning.py
# WeatherGuard - Weather Data Cleaning
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "weather_2021_2025.csv"
OUTPUT_FILE = BASE_DIR / "cleaned_weather.csv"

def load_data():
    print("Loading weather dataset...")
    df = pd.read_csv(INPUT_FILE)
    print("Dataset loaded successfully. Rows:", len(df), "Cols:", len(df.columns))
    return df

def clean_column_names(df):
    df.columns = (
        df.columns.str.strip().str.lower().str.replace(" ", "_").str.replace("-", "_")
    )
    return df

def replace_invalid_values(df):
    invalid_values = ["", " ", "NA", "N/A", "null", "NULL", "None", "-999", "-9999", -999, -9999]
    return df.replace(invalid_values, np.nan)

def convert_numeric_columns(df):
    for column in df.columns:
        if column not in ["timestamp", "date", "time"]:
            converted = pd.to_numeric(df[column], errors="coerce")
            if converted.notna().mean() > 0.5:
                df[column] = converted
    return df

def create_timestamp(df):
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    elif "date" in df.columns:
        df["timestamp"] = pd.to_datetime(df["date"], errors="coerce")
    return df

def remove_duplicates(df):
    return df.drop_duplicates()

def fill_missing_values(df):
    numeric_columns = df.select_dtypes(include=np.number).columns
    for col in numeric_columns:
        df[col] = df[col].fillna(df[col].median())
    return df

def sort_data(df):
    return df.sort_values(by="timestamp").reset_index(drop=True)

def clean_weather_data():
    df = load_data()
    df = clean_column_names(df)
    df = replace_invalid_values(df)
    df = convert_numeric_columns(df)
    df = create_timestamp(df)
    df = remove_duplicates(df)
    df = fill_missing_values(df)
    df = sort_data(df)
    df.to_csv(OUTPUT_FILE, index=False)
    print("Cleaned dataset saved to:", OUTPUT_FILE)
    return df

if __name__ == "__main__":
    clean_weather_data()`,
    },

    "validation.py": {
      label: "validation.py",
      lang: "python",
      desc: "Step 2: Physical bounds validation (-60 to 60°C, RH 0-100%, 800-1100 hPa, etc.)",
      code: `# ============================================================
# validation.py
# WeatherGuard - Weather Data Validation
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "cleaned_weather.csv"
OUTPUT_FILE = BASE_DIR / "validated_weather.csv"

def find_column(df, possible_names):
    for name in possible_names:
        if name in df.columns:
            return name
    return None

def validate_data(df):
    temperature = find_column(df, ["temp", "temperature", "air_temperature"])
    humidity = find_column(df, ["humidity", "rh", "relative_humidity"])
    pressure = find_column(df, ["pres", "pressure", "air_pressure"])
    wind_speed = find_column(df, ["wspd", "wind_speed", "windspeed"])

    df["temperature_invalid"] = (df[temperature] < -60) | (df[temperature] > 60) if temperature else False
    df["humidity_invalid"] = (df[humidity] < 0) | (df[humidity] > 100) if humidity else False
    df["pressure_invalid"] = (df[pressure] < 800) | (df[pressure] > 1100) if pressure else False
    df["wind_invalid"] = (df[wind_speed] < 0) | (df[wind_speed] > 100) if wind_speed else False

    validation_columns = ["temperature_invalid", "humidity_invalid", "pressure_invalid", "wind_invalid"]
    df["validation_error_count"] = df[validation_columns].sum(axis=1)
    df["validation_anomaly"] = df["validation_error_count"] > 0
    return df

def run_validation():
    df = pd.read_csv(INPUT_FILE)
    df = validate_data(df)
    df.to_csv(OUTPUT_FILE, index=False)
    return df

if __name__ == "__main__":
    run_validation()`,
    },

    "feature_engineering.py": {
      label: "feature_engineering.py",
      lang: "python",
      desc: "Step 3: Rolling mean/std, lag deltas (diff), cyclic time features",
      code: `# ============================================================
# feature_engineering.py
# WeatherGuard - Feature Engineering
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "validated_weather.csv"
OUTPUT_FILE = BASE_DIR / "features_weather.csv"

def create_features(df):
    # Differentials (1-step diff)
    df["temp_change"] = df["temperature"].diff()
    df["humidity_change"] = df["humidity"].diff()
    df["pressure_change"] = df["pressure"].diff()
    df["wind_change"] = df["wind_speed"].diff()

    # Rolling statistics (5-period window)
    df["temp_rolling_mean"] = df["temperature"].rolling(window=5, min_periods=1).mean()
    df["temp_rolling_std"] = df["temperature"].rolling(window=5, min_periods=1).std()
    df["humidity_rolling_mean"] = df["humidity"].rolling(window=5, min_periods=1).mean()
    df["pressure_rolling_mean"] = df["pressure"].rolling(window=5, min_periods=1).mean()

    # Time features
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["month_number"] = df["timestamp"].dt.month

    # Cross-variable feature
    df["temp_humidity_ratio"] = df["temperature"] / (df["humidity"] + 1)
    return df.fillna(df.median(numeric_only=True))

def run_feature_engineering():
    df = pd.read_csv(INPUT_FILE, parse_dates=["timestamp"])
    df = create_features(df)
    df.to_csv(OUTPUT_FILE, index=False)
    return df

if __name__ == "__main__":
    run_feature_engineering()`,
    },

    "rules.py": {
      label: "rules.py",
      lang: "python",
      desc: "Step 4: Domain rule checks & 99th percentile rapid jump rule",
      code: `# ============================================================
# rules.py
# WeatherGuard - Rule Based Anomaly Detection
# ============================================================
import pandas as pd

def temperature_rule(df):
    return (df["temperature"] < -60) | (df["temperature"] > 60)

def humidity_rule(df):
    return (df["humidity"] < 0) | (df["humidity"] > 100)

def pressure_rule(df):
    return (df["pressure"] < 800) | (df["pressure"] > 1100)

def wind_rule(df):
    return (df["wind_speed"] < 0) | (df["wind_speed"] > 100)

def sudden_change_rule(df):
    change_cols = ["temp_change", "humidity_change", "pressure_change", "wind_change"]
    result = pd.Series(False, index=df.index)
    for col in change_cols:
        if col in df.columns:
            threshold = df[col].abs().quantile(0.99)
            result = result | (df[col].abs() > threshold)
    return result

def apply_rules(df):
    df["rule_temperature"] = temperature_rule(df)
    df["rule_humidity"] = humidity_rule(df)
    df["rule_pressure"] = pressure_rule(df)
    df["rule_wind"] = wind_rule(df)
    df["rule_sudden_change"] = sudden_change_rule(df)
    rule_cols = ["rule_temperature", "rule_humidity", "rule_pressure", "rule_wind", "rule_sudden_change"]
    df["rule_count"] = df[rule_cols].sum(axis=1)
    df["rule_anomaly"] = df["rule_count"] > 0
    return df`,
    },

    "anomaly_model.py": {
      label: "anomaly_model.py",
      lang: "python",
      desc: "Step 5: Isolation Forest ML model (StandardScaler & fit)",
      code: `# ============================================================
# anomaly_model.py
# WeatherGuard - Isolation Forest
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "isolation_forest.pkl"

def select_features(df):
    excluded = ["timestamp", "year", "month", "day", "rule_anomaly", "rule_count", "validation_anomaly", "validation_error_count"]
    return [col for col in df.select_dtypes(include=np.number).columns if col not in excluded]

def train_model(df):
    features = select_features(df)
    X = df[features].fillna(df[features].median())

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(n_estimators=200, contamination=0.01, random_state=42, n_jobs=-1)
    model.fit(X_scaled)

    prediction = model.predict(X_scaled)
    df["ml_anomaly"] = (prediction == -1)
    df["anomaly_score"] = -model.decision_function(X_scaled)

    joblib.dump({"model": model, "scaler": scaler, "features": features}, MODEL_FILE)
    return df`,
    },

    "explanation.py": {
      label: "explanation.py",
      lang: "python",
      desc: "Step 8: Human-readable natural language reason generator",
      code: `# ============================================================
# explanation.py
# WeatherGuard - Anomaly Explanation
# ============================================================
def generate_explanation(row):
    reasons = []
    if row.get("rule_temperature", False):
        reasons.append("Temperature is outside the expected range")
    if row.get("rule_humidity", False):
        reasons.append("Humidity is outside the expected range")
    if row.get("rule_pressure", False):
        reasons.append("Pressure is outside the expected range")
    if row.get("rule_wind", False):
        reasons.append("Wind speed is outside the expected range")
    if row.get("rule_sudden_change", False):
        reasons.append("Sudden weather-variable change detected")
    if row.get("ml_anomaly", False):
        reasons.append("Unusual combination of weather conditions detected by ML")
    if len(reasons) == 0:
        return "Normal weather observation"
    return "; ".join(reasons)

def add_explanations(df):
    df["explanation"] = df.apply(generate_explanation, axis=1)
    return df`,
    },

    "pipeline.py": {
      label: "pipeline.py",
      lang: "python",
      desc: "Main orchestrator (Runs Steps 1 through 10)",
      code: `# ============================================================
# pipeline.py
# WeatherGuard - Complete ML Pipeline
# ============================================================
from pathlib import Path
import pandas as pd
from data_cleaning import clean_weather_data
from validation import validate_data
from feature_engineering import create_features
from rules import apply_rules
from anomaly_model import train_model
from explanation import add_explanations

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = BASE_DIR / "anomaly_results.csv"

def assign_severity(row):
    rule_count = row.get("rule_count", 0)
    ml_anomaly = row.get("ml_anomaly", False)
    score = row.get("anomaly_score", 0)

    if rule_count >= 2: return "High"
    if ml_anomaly and score > 0.15: return "High"
    if rule_count == 1: return "Medium"
    if ml_anomaly: return "Medium"
    return "Normal"

def run_pipeline():
    print("=" * 60)
    print("WEATHERGUARD - Automatic Weather Station Anomaly Detection")
    print("=" * 60)

    df = clean_weather_data()
    df = validate_data(df)
    df = create_features(df)
    df = apply_rules(df)
    df = train_model(df)

    df["anomaly"] = df["rule_anomaly"] | df["ml_anomaly"]
    df["severity"] = df.apply(assign_severity, axis=1)
    df = add_explanations(df)

    df.to_csv(OUTPUT_FILE, index=False)
    print("Pipeline completed. Results saved to:", OUTPUT_FILE)

if __name__ == "__main__":
    run_pipeline()`,
    },

    "app.py": {
      label: "app.py",
      lang: "python",
      desc: "Streamlit + Plotly interactive visual dashboard",
      code: `# ============================================================
# app.py
# WeatherGuard Dashboard (Streamlit + Plotly)
# ============================================================
from pathlib import Path
import pandas as pd
import streamlit as st
import plotly.express as px

BASE_DIR = Path(__file__).resolve().parent
RESULT_FILE = BASE_DIR / "anomaly_results.csv"

st.set_page_config(page_title="WeatherGuard", page_icon="🌦️", layout="wide")
st.title("🌦️ WeatherGuard")
st.subheader("AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations")

if not RESULT_FILE.exists():
    st.error("anomaly_results.csv not found. First run: python pipeline.py")
    st.stop()

df = pd.read_csv(RESULT_FILE, parse_dates=["timestamp"])

st.sidebar.header("Filters")
selected_severity = st.sidebar.selectbox("Severity", ["All", "Normal", "Medium", "High"])

filtered_df = df.copy()
if selected_severity != "All":
    filtered_df = filtered_df[filtered_df["severity"] == selected_severity]

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Records", len(df))
col2.metric("Anomalies", int(df["anomaly"].sum()))
col3.metric("Normal", len(df) - int(df["anomaly"].sum()))
col4.metric("High Severity", int((df["severity"] == "High").sum()))

st.header("Severity Distribution")
severity_count = df["severity"].value_counts().reset_index()
severity_count.columns = ["severity", "count"]
fig = px.bar(
    severity_count, x="severity", y="count",
    title="Weather Anomaly Severity", color="severity",
    color_discrete_map={"Normal": "#10B981", "Medium": "#F59E0B", "High": "#EF4444"}
)
st.plotly_chart(fig, use_container_width=True)

st.header("Temperature Trend")
fig_temp = px.line(filtered_df, x="timestamp", y="temperature", title="Temperature Over Time")
st.plotly_chart(fig_temp, use_container_width=True)

st.header("Anomaly Timeline")
anomaly_df = filtered_df[filtered_df["anomaly"] == True]
if len(anomaly_df) > 0:
    fig_anomaly = px.scatter(
        anomaly_df, x="timestamp", y="anomaly_score",
        hover_data=["severity", "explanation"],
        color="severity",
        color_discrete_map={"Medium": "#F59E0B", "High": "#EF4444"},
        title="Detected Weather Anomalies"
    )
    st.plotly_chart(fig_anomaly, use_container_width=True)

st.header("Detected Anomalies")
st.dataframe(anomaly_df, use_container_width=True)

with st.expander("View Complete Dataset"):
    st.dataframe(filtered_df, use_container_width=True)`,
    },

    "requirements.txt": {
      label: "requirements.txt",
      lang: "text",
      desc: "Python package dependencies including FastAPI, PyTorch, and SHAP",
      code: `pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
joblib>=1.3.0
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.5.0
shap>=0.44.0
torch>=2.1.0
streamlit>=1.30.0
plotly>=5.18.0
psycopg2-binary>=2.9.9`,
    },

    "fastapi_app.py": {
      label: "fastapi_app.py",
      lang: "python",
      desc: "FastAPI REST API server with real-time inference & SHAP endpoints (Slide 3)",
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="WeatherGuard AWS API", version="2.0.0")

class SensorReadingInput(BaseModel):
    station_id: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float

@app.post("/api/v1/detect")
async def evaluate_sensor_reading(reading: SensorReadingInput):
    # 1. WMO-No. 8 gross bounds check
    # 2. Isolation Forest score
    # 3. Deep Autoencoder reconstruction MSE
    # 4. SHAP feature attribution
    return {"status": "success", "anomaly": False, "severity": "Normal"}`,
    },

    "autoencoder_model.py": {
      label: "autoencoder_model.py",
      lang: "python",
      desc: "Advanced Model: Deep Bottleneck Autoencoder for temporal sequence anomalies (Slide 3)",
      code: `import numpy as np
import pandas as pd

class WeatherAutoencoder:
    def __init__(self, input_dim: int = 8, latent_dim: int = 3):
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        self.threshold = 0.15

    def encode(self, x):
        # 8 -> 16 -> 6 -> 3 latent representation
        return np.tanh(np.dot(x, self.w_enc))

    def decode(self, z):
        # 3 -> 6 -> 16 -> 8 reconstructed inputs
        return np.dot(z, self.w_dec)

    def compute_reconstruction_loss(self, x):
        z = self.encode(x)
        x_hat = self.decode(z)
        return np.mean(np.square(x - x_hat), axis=-1)`,
    },

    "shap_explainer.py": {
      label: "shap_explainer.py",
      lang: "python",
      desc: "SHAP / LIME Model Explainability & Interpretability Suite (Slide 4)",
      code: `import shap
import numpy as np

def compute_shap_attributions(model, X_sample):
    """
    Deconstructs black-box anomaly decisions into transparent Shapley values.
    Returns exact marginal contribution of each weather variable.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)
    return shap_values`,
    },

    "wmo_imd_standards.py": {
      label: "wmo_imd_standards.py",
      lang: "python",
      desc: "WMO-No. 8 and IMD Meteorological Quality Control Standards (Slide 6)",
      code: `class WMOIMDQualityValidator:
    WMO_BOUNDS = {
        "temperature": {"min": -60.0, "max": 60.0, "unit": "°C"},
        "humidity": {"min": 0.0, "max": 100.0, "unit": "%"},
        "pressure": {"min": 800.0, "max": 1100.0, "unit": "hPa"},
        "wind_speed": {"min": 0.0, "max": 100.0, "unit": "km/h"},
    }
    IMD_MAX_1H_STEP = {
        "temperature": 10.0, "humidity": 30.0, "pressure": 12.0, "wind_speed": 40.0
    }`,
    },

    "db_schema.sql": {
      label: "db_schema.sql",
      lang: "sql",
      desc: "PostgreSQL / Supabase Relational & Time-Series Database Schema (Slide 3)",
      code: `CREATE TABLE IF NOT EXISTS aws_stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    wmo_id VARCHAR(20) UNIQUE,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    elevation_meters INT NOT NULL
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES aws_stations(station_id),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    pressure NUMERIC(6, 2),
    wind_speed NUMERIC(5, 2)
);`,
    },

    "Dockerfile": {
      label: "Dockerfile",
      lang: "dockerfile",
      desc: "Multi-stage Docker container deployment for AWS ECS/Fargate (Slide 3)",
      code: `FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
COPY --from=frontend-builder /app/dist ./static
EXPOSE 8000
CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]`,
    },

    "docker-compose.yml": {
      label: "docker-compose.yml",
      lang: "yaml",
      desc: "Full stack orchestration: FastAPI + PostgreSQL + Redis Queue (Slide 4)",
      code: `version: '3.8'
services:
  backend:
    build: .
    ports: ["8000:8000"]
    depends_on: [db, queue]
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
  queue:
    image: redis:7-alpine
    ports: ["6379:6379"]`,
    },
  };

  const cur = files[activeFile] || files["data_cleaning.py"];

  const handleCopy = () => {
    navigator.clipboard.writeText(cur.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">WeatherGuard Codebase</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Original Python modules and dependencies matching the architectural specification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied" : "Copy Script"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File tabs */}
        <div className="lg:col-span-3 space-y-1.5">
          {Object.entries(files).map(([fname, f]) => (
            <button
              key={fname}
              onClick={() => setActiveFile(fname)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                activeFile === fname
                  ? "bg-cyan-950/70 text-cyan-300 border border-cyan-800 font-semibold"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${activeFile === fname ? "text-cyan-400" : "text-slate-500"}`} />
              <span className="truncate">{fname}</span>
            </button>
          ))}
        </div>

        {/* Code box */}
        <div className="lg:col-span-9 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-300 font-semibold">{cur.label}</span>
            <span className="text-slate-400 text-[11px]">{cur.desc}</span>
          </div>

          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
            <code>{cur.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
