# WeatherGuard 🌦️
## AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations

WeatherGuard is an end-to-end data processing and anomaly detection pipeline designed to safeguard automatic weather station (AWS) observational records. It combines physical bounds validation, feature engineering, statistical domain rules, and unsupervised machine learning (Isolation Forest) with natural language explanations and interactive dashboard analytics.

---

### 📁 Project Folder Structure

```text
WeatherGuard/
│
├── weather_2021_2025.csv       # Raw weather station dataset (3,651 hourly records)
├── generate_data.py            # Synthetic dataset generator with injected anomalies
│
├── data_cleaning.py            # Step 1: Ingestion, null removal (-999, NA), date parsing
├── validation.py              # Step 2: Physical bounds validation (-60 to 60°C, RH 0-100%, etc.)
├── feature_engineering.py     # Step 3: Rolling mean/std, lag deltas, cyclic time features
├── rules.py                   # Step 4: Domain rule checks & 99th percentile rapid jump rule
├── anomaly_model.py           # Step 5: Isolation Forest ML model (StandardScaler & fit)
├── explanation.py             # Step 8: Human-readable natural language reason generator
├── pipeline.py                # Main orchestrator (Runs Steps 1 through 10)
├── app.py                     # Streamlit + Plotly interactive visual dashboard
│
├── requirements.txt           # Python package dependencies
└── README.md                  # Project overview & roadmap
```

---

### 🔄 Architectural Pipeline Flow

```text
               weather_2021_2025.csv
                         │
                         ▼
             ┌──────────────────────┐
             │   data_cleaning.py   │ ──► cleaned_weather.csv
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │    validation.py     │ ──► validated_weather.csv
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │feature_engineering.py│ ──► features_weather.csv
             └──────────┬───────────┘
                        │
                ┌───────┴────────┐
                ▼                ▼
         ┌─────────────┐   ┌──────────────┐
         │  rules.py   │   │  Isolation   │
         │             │   │   Forest     │
         │ Domain      │   │              │
         │ Rules       │   │ ML Model     │
         └──────┬──────┘   └──────┬───────┘
                │                 │
                └────────┬────────┘
                         ▼
                ┌─────────────────┐
                │ Hybrid Decision │ (Rule OR ML)
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Severity &      │ (High / Medium / Normal)
                │ Explanation     │
                └────────┬────────┘
                         │
                         ▼
                anomaly_results.csv
                         │
                         ▼
                ┌─────────────────┐
                │     app.py      │
                │                 │
                │  DASHBOARD UI   │ (http://localhost:8501)
                └─────────────────┘
```

---

### 🚀 Quick Start (Python CLI & Streamlit)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate synthetic dataset:**
   ```bash
   python generate_data.py
   ```

3. **Execute the complete 10-step detection pipeline:**
   ```bash
   python pipeline.py
   ```

4. **Launch the interactive Streamlit dashboard:**
   ```bash
   streamlit run app.py
   ```

---

### 🔬 Anomaly Detection Logic

- **Physical Bounds**:
  - Air Temperature: `-60°C` to `+60°C`
  - Relative Humidity: `0%` to `100%`
  - Barometric Pressure: `800 hPa` to `1100 hPa`
  - Wind Speed: `0 km/h` to `100 km/h`
- **Rapid Jump Rule**:
  - Checks if the rate of change (`|diff|`) exceeds the 99th percentile for temperature, humidity, pressure, or wind.
- **Machine Learning (Isolation Forest)**:
  - Scaled multi-feature feature vectors using `StandardScaler`.
  - Unsupervised isolation trees isolating rare combinations (e.g. freezing temperature with summer solar patterns or hurricane-force pressure crashes).
- **Severity Scoring**:
  - `High`: $\ge 2$ rule violations OR (ML anomaly with anomaly score $> 0.15$)
  - `Medium`: 1 rule violation OR ML anomaly
  - `Normal`: Clean observation
