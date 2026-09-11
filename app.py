# ============================================================
# app.py
# WeatherGuard Dashboard
# ============================================================
from pathlib import Path
import pandas as pd
import streamlit as st
import plotly.express as px
# ------------------------------------------------------------
# Project folder
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
RESULT_FILE = (
    BASE_DIR /
    "anomaly_results.csv"
)
# ------------------------------------------------------------
# Page configuration
# ------------------------------------------------------------
st.set_page_config(
    page_title="WeatherGuard",
    page_icon="🌦️",
    layout="wide"
)
# ------------------------------------------------------------
# Title
# ------------------------------------------------------------
st.title(
    "🌦️ WeatherGuard"
)
st.subheader(
    "AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations"
)
# ------------------------------------------------------------
# Load data
# ------------------------------------------------------------
if not RESULT_FILE.exists():
    st.error(
        "anomaly_results.csv not found."
    )
    st.info(
        "First run: python pipeline.py"
    )
    st.stop()
df = pd.read_csv(
    RESULT_FILE,
    parse_dates=["timestamp"]
)
# ------------------------------------------------------------
# Sidebar
# ------------------------------------------------------------
st.sidebar.header(
    "Filters"
)
# Severity filter
severity_options = [
    "All",
    "Normal",
    "Medium",
    "High"
]
selected_severity = st.sidebar.selectbox(
    "Severity",
    severity_options
)
# ------------------------------------------------------------
# Apply filter
# ------------------------------------------------------------
filtered_df = df.copy()
if selected_severity != "All":
    filtered_df = filtered_df[
        filtered_df["severity"]
        == selected_severity
    ]
# ------------------------------------------------------------
# Metrics
# ------------------------------------------------------------
total_records = len(df)
total_anomalies = int(
    df["anomaly"].sum()
)
total_normal = (
    total_records -
    total_anomalies
)
high_count = int(
    (df["severity"] == "High")
    .sum()
)
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(
        "Total Records",
        total_records
    )
with col2:
    st.metric(
        "Anomalies",
        total_anomalies
    )
with col3:
    st.metric(
        "Normal",
        total_normal
    )
with col4:
    st.metric(
        "High Severity",
        high_count
    )
# ------------------------------------------------------------
# Anomaly rate
# ------------------------------------------------------------
anomaly_rate = (
    total_anomalies /
    total_records *
    100
)
st.metric(
    "Anomaly Rate",
    f"{anomaly_rate:.2f}%"
)
# ------------------------------------------------------------
# Severity chart
# ------------------------------------------------------------
st.header(
    "Severity Distribution"
)
severity_count = (
    df["severity"]
    .value_counts()
    .reset_index()
)
severity_count.columns = [
    "severity",
    "count"
]
fig = px.bar(
    severity_count,
    x="severity",
    y="count",
    title="Weather Anomaly Severity",
    color="severity",
    color_discrete_map={"Normal": "#10B981", "Medium": "#F59E0B", "High": "#EF4444"}
)
st.plotly_chart(
    fig,
    use_container_width=True
)
# ------------------------------------------------------------
# Temperature chart
# ------------------------------------------------------------
temperature_column = None
for column in [
    "temp",
    "temperature",
    "air_temperature"
]:
    if column in df.columns:
        temperature_column = column
        break
if temperature_column:
    st.header(
        "Temperature Trend"
    )
    fig_temp = px.line(
        filtered_df,
        x="timestamp",
        y=temperature_column,
        title="Temperature Over Time"
    )
    st.plotly_chart(
        fig_temp,
        use_container_width=True
    )
# ------------------------------------------------------------
# Anomaly timeline
# ------------------------------------------------------------
st.header(
    "Anomaly Timeline"
)
anomaly_df = filtered_df[
    filtered_df["anomaly"] == True
]
if len(anomaly_df) > 0:
    fig_anomaly = px.scatter(
        anomaly_df,
        x="timestamp",
        y="anomaly_score",
        hover_data=[
            "severity",
            "explanation"
        ],
        color="severity",
        color_discrete_map={"Medium": "#F59E0B", "High": "#EF4444"},
        title="Detected Weather Anomalies"
    )
    st.plotly_chart(
        fig_anomaly,
        use_container_width=True
    )
else:
    st.success(
        "No anomalies found for the selected filter."
    )
# ------------------------------------------------------------
# Anomaly table
# ------------------------------------------------------------
st.header(
    "Detected Anomalies"
)
if len(anomaly_df) > 0:
    display_columns = [
        column
        for column in [
            "timestamp",
            temperature_column,
            "rh",
            "humidity",
            "pres",
            "wspd",
            "anomaly_score",
            "severity",
            "explanation"
        ]
        if column is not None
        and column in anomaly_df.columns
    ]
    st.dataframe(
        anomaly_df[
            display_columns
        ],
        use_container_width=True
    )
# ------------------------------------------------------------
# Full dataset
# ------------------------------------------------------------
with st.expander(
    "View Complete Dataset"
):
    st.dataframe(
        filtered_df,
        use_container_width=True
    )
