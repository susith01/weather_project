# ============================================================
# explanation.py
# WeatherGuard - Anomaly Explanation
# ============================================================
def generate_explanation(row):
    reasons = []
    # --------------------------------------------------------
    # Temperature
    # --------------------------------------------------------
    if row.get(
        "rule_temperature",
        False
    ):
        reasons.append(
            "Temperature is outside the expected range"
        )
    # --------------------------------------------------------
    # Humidity
    # --------------------------------------------------------
    if row.get(
        "rule_humidity",
        False
    ):
        reasons.append(
            "Humidity is outside the expected range"
        )
    # --------------------------------------------------------
    # Pressure
    # --------------------------------------------------------
    if row.get(
        "rule_pressure",
        False
    ):
        reasons.append(
            "Pressure is outside the expected range"
        )
    # --------------------------------------------------------
    # Wind
    # --------------------------------------------------------
    if row.get(
        "rule_wind",
        False
    ):
        reasons.append(
            "Wind speed is outside the expected range"
        )
    # --------------------------------------------------------
    # Sudden change
    # --------------------------------------------------------
    if row.get(
        "rule_sudden_change",
        False
    ):
        reasons.append(
            "Sudden weather-variable change detected"
        )
    # --------------------------------------------------------
    # ML anomaly
    # --------------------------------------------------------
    if row.get(
        "ml_anomaly",
        False
    ):
        reasons.append(
            "Unusual combination of weather conditions detected by ML"
        )
    # --------------------------------------------------------
    # Normal
    # --------------------------------------------------------
    if len(reasons) == 0:
        return "Normal weather observation"
    return "; ".join(reasons)
# ------------------------------------------------------------
# Apply explanation to entire dataset
# ------------------------------------------------------------
def add_explanations(df):
    df["explanation"] = (
        df.apply(
            generate_explanation,
            axis=1
        )
    )
    return df
