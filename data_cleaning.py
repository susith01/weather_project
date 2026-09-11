# ============================================================
# data_cleaning.py
# WeatherGuard - Weather Data Cleaning
# ============================================================
from pathlib import Path
import pandas as pd
import numpy as np
# ------------------------------------------------------------
# 1. Find the folder where this Python file is located
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
# ------------------------------------------------------------
# 2. Define input and output files
# ------------------------------------------------------------
INPUT_FILE = BASE_DIR / "weather_2021_2025.csv"
OUTPUT_FILE = BASE_DIR / "cleaned_weather.csv"
# ------------------------------------------------------------
# 3. Load the dataset
# ------------------------------------------------------------
def load_data():
    print("Loading weather dataset...")
    df = pd.read_csv(INPUT_FILE)
    print("Dataset loaded successfully.")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))
    return df
# ------------------------------------------------------------
# 4. Clean column names
# ------------------------------------------------------------
def clean_column_names(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
    )
    return df
# ------------------------------------------------------------
# 5. Replace invalid values
# ------------------------------------------------------------
def replace_invalid_values(df):
    invalid_values = [
        "",
        " ",
        "NA",
        "N/A",
        "null",
        "NULL",
        "None",
        "-999",
        "-9999",
        -999,
        -9999
    ]
    df = df.replace(invalid_values, np.nan)
    return df
# ------------------------------------------------------------
# 6. Convert possible numeric columns
# ------------------------------------------------------------
def convert_numeric_columns(df):
    for column in df.columns:
        if column not in ["timestamp", "date", "time"]:
            converted = pd.to_numeric(
                df[column],
                errors="coerce"
            )
            # Convert only when enough values are numeric
            numeric_ratio = converted.notna().mean()
            if numeric_ratio > 0.5:
                df[column] = converted
    return df
# ------------------------------------------------------------
# 7. Create timestamp
# ------------------------------------------------------------
def create_timestamp(df):
    # If timestamp already exists
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(
            df["timestamp"],
            errors="coerce"
        )
    # If date column exists
    elif "date" in df.columns:
        df["timestamp"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )
    # If year/month/day columns exist
    elif all(
        column in df.columns
        for column in ["year", "month", "day"]
    ):
        df["timestamp"] = pd.to_datetime(
            df[["year", "month", "day"]],
            errors="coerce"
        )
    else:
        raise ValueError(
            "No timestamp/date/year-month-day columns found."
        )
    return df
# ------------------------------------------------------------
# 8. Remove duplicate records
# ------------------------------------------------------------
def remove_duplicates(df):
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    print(
        "Duplicate rows removed:",
        before - after
    )
    return df
# ------------------------------------------------------------
# 9. Fill missing values
# ------------------------------------------------------------
def fill_missing_values(df):
    numeric_columns = df.select_dtypes(
        include=np.number
    ).columns
    for column in numeric_columns:
        median_value = df[column].median()
        df[column] = df[column].fillna(
            median_value
        )
    object_columns = df.select_dtypes(
        include="object"
    ).columns
    for column in object_columns:
        df[column] = df[column].fillna(
            "Unknown"
        )
    return df
# ------------------------------------------------------------
# 10. Sort data by timestamp
# ------------------------------------------------------------
def sort_data(df):
    df = df.sort_values(
        by="timestamp"
    )
    df = df.reset_index(
        drop=True
    )
    return df
# ------------------------------------------------------------
# 11. Complete cleaning pipeline
# ------------------------------------------------------------
def clean_weather_data():
    df = load_data()
    df = clean_column_names(df)
    df = replace_invalid_values(df)
    df = convert_numeric_columns(df)
    df = create_timestamp(df)
    df = remove_duplicates(df)
    df = fill_missing_values(df)
    df = sort_data(df)
    df.to_csv(
        OUTPUT_FILE,
        index=False
    )
    print(
        "\nCleaned dataset saved to:"
    )
    print(OUTPUT_FILE)
    return df
# ------------------------------------------------------------
# 12. Run this file directly
# ------------------------------------------------------------
if __name__ == "__main__":
    clean_weather_data()
