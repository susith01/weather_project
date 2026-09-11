# ============================================================
# feature_engineering.py
# WeatherGuard - Feature Engineering
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np
BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "validated_weather.csv"
OUTPUT_FILE = BASE_DIR / "features_weather.csv"
# ------------------------------------------------------------
# Find column
# ------------------------------------------------------------
def find_column(df, possible_names):
    for name in possible_names:
        if name in df.columns:
            return name
    return None
# ------------------------------------------------------------
# Create features
# ------------------------------------------------------------
def create_features(df):
    print("Creating features...")
    temperature = find_column(
        df,
        ["temp", "temperature", "air_temperature"]
    )
    humidity = find_column(
        df,
        ["humidity", "rh", "relative_humidity"]
    )
    pressure = find_column(
        df,
        ["pres", "pressure", "air_pressure"]
    )
    wind_speed = find_column(
        df,
        ["wspd", "wind_speed", "windspeed"]
    )
    # --------------------------------------------------------
    # Temperature change
    # --------------------------------------------------------
    if temperature:
        df["temp_change"] = (
            df[temperature]
            .diff()
        )
    # --------------------------------------------------------
    # Humidity change
    # --------------------------------------------------------
    if humidity:
        df["humidity_change"] = (
            df[humidity]
            .diff()
        )
    # --------------------------------------------------------
    # Pressure change
    # --------------------------------------------------------
    if pressure:
        df["pressure_change"] = (
            df[pressure]
            .diff()
        )
    # --------------------------------------------------------
    # Wind speed change
    # --------------------------------------------------------
    if wind_speed:
        df["wind_change"] = (
            df[wind_speed]
            .diff()
        )
    # --------------------------------------------------------
    # Rolling statistics
    # --------------------------------------------------------
    if temperature:
        df["temp_rolling_mean"] = (
            df[temperature]
            .rolling(window=5, min_periods=1)
            .mean()
        )
        df["temp_rolling_std"] = (
            df[temperature]
            .rolling(window=5, min_periods=1)
            .std()
        )
    if humidity:
        df["humidity_rolling_mean"] = (
            df[humidity]
            .rolling(window=5, min_periods=1)
            .mean()
        )
    if pressure:
        df["pressure_rolling_mean"] = (
            df[pressure]
            .rolling(window=5, min_periods=1)
            .mean()
        )
    # --------------------------------------------------------
    # Time features
    # --------------------------------------------------------
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = (
            df["timestamp"]
            .dt.hour
        )
        df["day_of_week"] = (
            df["timestamp"]
            .dt.dayofweek
        )
        df["month_number"] = (
            df["timestamp"]
            .dt.month
        )
    # --------------------------------------------------------
    # Cross-variable feature
    # --------------------------------------------------------
    if temperature and humidity:
        df["temp_humidity_ratio"] = (
            df[temperature] /
            (df[humidity] + 1)
        )
    # --------------------------------------------------------
    # Replace infinity
    # --------------------------------------------------------
    df = df.replace(
        [np.inf, -np.inf],
        np.nan
    )
    # --------------------------------------------------------
    # Fill missing numeric values
    # --------------------------------------------------------
    numeric_columns = df.select_dtypes(
        include=np.number
    ).columns
    df[numeric_columns] = (
        df[numeric_columns]
        .fillna(
            df[numeric_columns].median()
        )
    )
    print("Feature engineering completed.")
    return df
# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
def run_feature_engineering():
    df = pd.read_csv(
        INPUT_FILE,
        parse_dates=["timestamp"]
    )
    df = create_features(df)
    df.to_csv(
        OUTPUT_FILE,
        index=False
    )
    print(
        "Feature dataset saved to:",
        OUTPUT_FILE
    )
    return df
if __name__ == "__main__":
    run_feature_engineering()
