# ============================================================
# pipeline.py
# WeatherGuard - Complete ML Pipeline
# ============================================================
from pathlib import Path
import pandas as pd
from data_cleaning import (
    clean_weather_data
)
from validation import (
    validate_data
)
from feature_engineering import (
    create_features
)
from rules import (
    apply_rules
)
from anomaly_model import (
    train_model
)
from explanation import (
    add_explanations
)
# ------------------------------------------------------------
# Project folder
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
# ------------------------------------------------------------
# Final output
# ------------------------------------------------------------
OUTPUT_FILE = (
    BASE_DIR /
    "anomaly_results.csv"
)
# ------------------------------------------------------------
# Assign severity
# ------------------------------------------------------------
def assign_severity(row):
    rule_count = row.get(
        "rule_count",
        0
    )
    ml_anomaly = row.get(
        "ml_anomaly",
        False
    )
    score = row.get(
        "anomaly_score",
        0
    )
    # High severity
    if rule_count >= 2:
        return "High"
    if ml_anomaly and score > 0.15:
        return "High"
    # Medium severity
    if rule_count == 1:
        return "Medium"
    if ml_anomaly:
        return "Medium"
    # Normal
    return "Normal"
# ------------------------------------------------------------
# Run complete pipeline
# ------------------------------------------------------------
def run_pipeline():
    print("\n")
    print("=" * 60)
    print("WEATHERGUARD")
    print("Automatic Weather Station Anomaly Detection")
    print("=" * 60)
    # --------------------------------------------------------
    # STEP 1 - Cleaning
    # --------------------------------------------------------
    print("\nSTEP 1: Data Cleaning")
    df = clean_weather_data()
    # --------------------------------------------------------
    # STEP 2 - Validation
    # --------------------------------------------------------
    print("\nSTEP 2: Data Validation")
    df = validate_data(df)
    # --------------------------------------------------------
    # STEP 3 - Feature Engineering
    # --------------------------------------------------------
    print("\nSTEP 3: Feature Engineering")
    df = create_features(df)
    # --------------------------------------------------------
    # STEP 4 - Rule Detection
    # --------------------------------------------------------
    print("\nSTEP 4: Rule-Based Detection")
    df = apply_rules(df)
    # --------------------------------------------------------
    # STEP 5 - Machine Learning
    # --------------------------------------------------------
    print("\nSTEP 5: Isolation Forest")
    df = train_model(df)
    # --------------------------------------------------------
    # STEP 6 - Hybrid anomaly decision
    # --------------------------------------------------------
    print("\nSTEP 6: Hybrid Detection")
    df["anomaly"] = (
        df["rule_anomaly"] |
        df["ml_anomaly"]
    )
    # --------------------------------------------------------
    # STEP 7 - Severity
    # --------------------------------------------------------
    print("\nSTEP 7: Severity Classification")
    df["severity"] = (
        df.apply(
            assign_severity,
            axis=1
        )
    )
    # --------------------------------------------------------
    # STEP 8 - Explanation
    # --------------------------------------------------------
    print("\nSTEP 8: Generating Explanations")
    df = add_explanations(df)
    # --------------------------------------------------------
    # STEP 9 - Save results
    # --------------------------------------------------------
    df.to_csv(
        OUTPUT_FILE,
        index=False
    )
    # --------------------------------------------------------
    # STEP 10 - Summary
    # --------------------------------------------------------
    total = len(df)
    anomalies = int(
        df["anomaly"].sum()
    )
    normal = total - anomalies
    print("\n")
    print("=" * 60)
    print("PIPELINE COMPLETED")
    print("=" * 60)
    print(
        "Total records:",
        total
    )
    print(
        "Anomalies:",
        anomalies
    )
    print(
        "Normal:",
        normal
    )
    print(
        "Anomaly rate:",
        round(
            anomalies / total * 100,
            2
        ),
        "%"
    )
    print(
        "\nResults saved to:"
    )
    print(OUTPUT_FILE)
# ------------------------------------------------------------
# Run pipeline
# ------------------------------------------------------------
if __name__ == "__main__":
    run_pipeline()
