# ============================================================
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
# ------------------------------------------------------------
# Select ML features
# ------------------------------------------------------------
def select_features(df):
    excluded_columns = [
        "timestamp",
        "year",
        "month",
        "day",
        "rule_anomaly",
        "rule_count",
        "validation_anomaly",
        "validation_error_count"
    ]
    excluded_columns += [
        column
        for column in df.columns
        if "source" in column.lower()
    ]
    numeric_df = df.select_dtypes(
        include=np.number
    )
    feature_columns = [
        column
        for column in numeric_df.columns
        if column not in excluded_columns
    ]
    return feature_columns
# ------------------------------------------------------------
# Train Isolation Forest
# ------------------------------------------------------------
def train_model(df):
    print("Training Isolation Forest...")
    feature_columns = select_features(df)
    if len(feature_columns) == 0:
        raise ValueError(
            "No numerical features available."
        )
    X = df[feature_columns].copy()
    # --------------------------------------------------------
    # Fill missing values
    # --------------------------------------------------------
    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )
    X = X.fillna(
        X.median()
    )
    # --------------------------------------------------------
    # Scale features
    # --------------------------------------------------------
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    # --------------------------------------------------------
    # Create model
    # --------------------------------------------------------
    model = IsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )
    # --------------------------------------------------------
    # Train model
    # --------------------------------------------------------
    model.fit(X_scaled)
    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------
    prediction = model.predict(
        X_scaled
    )
    # Isolation Forest:
    # 1 = normal
    # -1 = anomaly
    df["ml_anomaly"] = (
        prediction == -1
    )
    # --------------------------------------------------------
    # Anomaly score
    # --------------------------------------------------------
    decision_score = (
        model.decision_function(
            X_scaled
        )
    )
    df["anomaly_score"] = (
        -decision_score
    )
    # --------------------------------------------------------
    # Save model
    # --------------------------------------------------------
    joblib.dump(
        {
            "model": model,
            "scaler": scaler,
            "features": feature_columns
        },
        MODEL_FILE
    )
    print(
        "Model saved to:",
        MODEL_FILE
    )
    print(
        "Features used:",
        feature_columns
    )
    return df
