# ============================================================
# validation.py
# WeatherGuard - Weather Data Validation
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np
BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "cleaned_weather.csv"
OUTPUT_FILE = BASE_DIR / "validated_weather.csv"
# ------------------------------------------------------------
# Find a column using possible names
# ------------------------------------------------------------
def find_column(df, possible_names):
    for name in possible_names:
        if name in df.columns:
            return name
    return None
# ------------------------------------------------------------
# Validate weather data
# ------------------------------------------------------------
def validate_data(df):
    print("Starting data validation...")
    # Find important columns
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
    # Create validation columns
    df["temperature_invalid"] = False
    df["humidity_invalid"] = False
    df["pressure_invalid"] = False
    df["wind_invalid"] = False
    # --------------------------------------------------------
    # Temperature validation
    # --------------------------------------------------------
    if temperature:
        df["temperature_invalid"] = (
            (df[temperature] < -60) |
            (df[temperature] > 60)
        )
    # --------------------------------------------------------
    # Humidity validation
    # --------------------------------------------------------
    if humidity:
        df["humidity_invalid"] = (
            (df[humidity] < 0) |
            (df[humidity] > 100)
        )
    # --------------------------------------------------------
    # Pressure validation
    # --------------------------------------------------------
    if pressure:
        df["pressure_invalid"] = (
            (df[pressure] < 800) |
            (df[pressure] > 1100)
        )
    # --------------------------------------------------------
    # Wind speed validation
    # --------------------------------------------------------
    if wind_speed:
        df["wind_invalid"] = (
            (df[wind_speed] < 0) |
            (df[wind_speed] > 100)
        )
    # --------------------------------------------------------
    # Count validation failures
    # --------------------------------------------------------
    validation_columns = [
        "temperature_invalid",
        "humidity_invalid",
        "pressure_invalid",
        "wind_invalid"
    ]
    df["validation_error_count"] = (
        df[validation_columns]
        .sum(axis=1)
    )
    # --------------------------------------------------------
    # Overall validation status
    # --------------------------------------------------------
    df["validation_anomaly"] = (
        df["validation_error_count"] > 0
    )
    print(
        "Validation completed."
    )
    return df
# ------------------------------------------------------------
# Main function
# ------------------------------------------------------------
def run_validation():
    df = pd.read_csv(INPUT_FILE)
    df = validate_data(df)
    df.to_csv(
        OUTPUT_FILE,
        index=False
    )
    print(
        "Validated dataset saved to:",
        OUTPUT_FILE
    )
    return df
if __name__ == "__main__":
    run_validation()
