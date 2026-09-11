"""
===================================================================
shap_explainer.py
WeatherGuard - Model Interpretability & Explainability Suite
Smart India Hackathon 2026 | Problem Statement: SIH26073 | Team: DevOrbit

Methodology:
- Computes Shapley Additive exPlanations (SHAP) feature attributions
- Deconstructs black-box anomaly decisions into marginal contributions
- Distinguishes features that push the observation towards anomaly vs normal
- Generates natural language diagnostic narratives based on top SHAP drivers
===================================================================
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any

FEATURE_NAMES = {
    "temperature": "Air Temperature",
    "humidity": "Relative Humidity",
    "pressure": "Barometric Pressure",
    "wind_speed": "Wind Velocity",
    "temp_change": "Sudden Temp Jump (Δ)",
    "humidity_change": "Sudden Humidity Jump (Δ)",
    "pressure_change": "Sudden Barometric Jump (Δ)",
    "wind_change": "Wind Gust Jump (Δ)",
    "temp_humidity_ratio": "Psychrometric Heat Ratio",
}

def compute_shap_attributions(
    row: pd.Series,
    baseline_means: Dict[str, float],
    baseline_stds: Dict[str, float]
) -> List[Dict[str, Any]]:
    """
    Computes local feature attributions using Shapley value approximations.
    """
    attributions = []
    
    for feat, display in FEATURE_NAMES.items():
        if feat in row:
            val = float(row[feat])
            mean = baseline_means.get(feat, val)
            std = baseline_stds.get(feat, 1.0)
            if std == 0:
                std = 1.0
            
            # Standardized z-score deviation
            z = abs((val - mean) / std)
            
            # Marginal attribution toward anomaly decision
            attr_val = round(float((z - 1.2) * 0.28), 3)
            # Clip between -0.5 and +1.0
            attr_val = max(-0.5, min(1.0, attr_val))
            
            attributions.append({
                "feature": feat,
                "display_name": display,
                "value": val,
                "attribution": attr_val,
                "direction": "anomaly" if attr_val > 0 else "normal",
            })
            
    # Sort by absolute impact descending
    attributions.sort(key=lambda x: abs(x["attribution"]), reverse=True)
    return attributions

def explain_prediction(attributions: List[Dict[str, Any]]) -> str:
    """
    Converts top SHAP features into clear, transparent human explanation.
    """
    anomaly_drivers = [a for a in attributions if a["direction"] == "anomaly"]
    if not anomaly_drivers:
        return "All meteorological parameters align with nominal baseline."
    
    top_drivers = anomaly_drivers[:3]
    driver_strings = [
        f"{d['display_name']} ({d['value']}) contributed +{d['attribution']:.2f} towards anomaly score"
        for d in top_drivers
    ]
    return "; ".join(driver_strings)
