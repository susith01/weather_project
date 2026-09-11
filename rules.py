# ============================================================
# rules.py
# WeatherGuard - Rule Based Anomaly Detection
# ============================================================
import pandas as pd
# ------------------------------------------------------------
# Find column
# ------------------------------------------------------------
def find_column(df, possible_names):
    for name in possible_names:
        if name in df.columns:
            return name
    return None
# ------------------------------------------------------------
# Temperature rule
# ------------------------------------------------------------
def temperature_rule(df):
    column = find_column(
        df,
        ["temp", "temperature", "air_temperature"]
    )
    if column is None:
        return pd.Series(
            False,
            index=df.index
        )
    return (
        (df[column] < -60) |
        (df[column] > 60)
    )
# ------------------------------------------------------------
# Humidity rule
# ------------------------------------------------------------
def humidity_rule(df):
    column = find_column(
        df,
        ["humidity", "rh", "relative_humidity"]
    )
    if column is None:
        return pd.Series(
            False,
            index=df.index
        )
    return (
        (df[column] < 0) |
        (df[column] > 100)
    )
# ------------------------------------------------------------
# Pressure rule
# ------------------------------------------------------------
def pressure_rule(df):
    column = find_column(
        df,
        ["pres", "pressure", "air_pressure"]
    )
    if column is None:
        return pd.Series(
            False,
            index=df.index
        )
    return (
        (df[column] < 800) |
        (df[column] > 1100)
    )
# ------------------------------------------------------------
# Wind rule
# ------------------------------------------------------------
def wind_rule(df):
    column = find_column(
        df,
        ["wspd", "wind_speed", "windspeed"]
    )
    if column is None:
        return pd.Series(
            False,
            index=df.index
        )
    return (
        (df[column] < 0) |
        (df[column] > 100)
    )
# ------------------------------------------------------------
# Sudden change rule
# ------------------------------------------------------------
def sudden_change_rule(df):
    change_columns = [
        "temp_change",
        "humidity_change",
        "pressure_change",
        "wind_change"
    ]
    available = [
        column
        for column in change_columns
        if column in df.columns
    ]
    if not available:
        return pd.Series(
            False,
            index=df.index
        )
    result = pd.Series(
        False,
        index=df.index
    )
    for column in available:
        threshold = (
            df[column]
            .abs()
            .quantile(0.99)
        )
        result = (
            result |
            (df[column].abs() > threshold)
        )
    return result
# ------------------------------------------------------------
# Combine all rules
# ------------------------------------------------------------
def apply_rules(df):
    df["rule_temperature"] = (
        temperature_rule(df)
    )
    df["rule_humidity"] = (
        humidity_rule(df)
    )
    df["rule_pressure"] = (
        pressure_rule(df)
    )
    df["rule_wind"] = (
        wind_rule(df)
    )
    df["rule_sudden_change"] = (
        sudden_change_rule(df)
    )
    rule_columns = [
        "rule_temperature",
        "rule_humidity",
        "rule_pressure",
        "rule_wind",
        "rule_sudden_change"
    ]
    df["rule_count"] = (
        df[rule_columns]
        .sum(axis=1)
    )
    df["rule_anomaly"] = (
        df["rule_count"] > 0
    )
    return df
