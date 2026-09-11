#!/usr/bin/env python3
"""
generate_data.py
WeatherGuard - Synthetic Weather Station Dataset Generator
Generates realistic automatic weather station dataset (3,651 records)
spanning multiple years with diurnal cycle, seasonal variation,
and synthetically injected domain-rule and multi-variate anomalies.
"""

import csv
import math
import random
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = BASE_DIR / "weather_2021_2025.csv"

def generate_synthetic_weather(num_records=3651):
    random.seed(42)
    start_date = datetime(2021, 1, 1, 0, 0, 0)
    
    records = []
    
    # Base state
    current_temp = 18.0
    current_humidity = 65.0
    current_pressure = 1013.25
    current_wind = 12.0
    
    # Pre-selected anomaly indices to inject known anomaly types
    anomaly_indices = {
        50: "extreme_temp_high",     # 74.5°C (rule violation)
        120: "extreme_temp_low",     # -68.2°C (rule violation)
        240: "impossible_humidity",   # 125.0% (rule violation)
        380: "negative_humidity",     # -12.0% (rule violation)
        510: "extreme_pressure_low",  # 720.0 hPa (typhoon/sensor failure)
        690: "extreme_pressure_high", # 1160.0 hPa (sensor freeze)
        850: "extreme_wind",          # 145.0 km/h (severe hurricane spike)
        1020: "rapid_temp_jump",      # +22.0°C jump in 1 hour
        1200: "rapid_pressure_drop",  # -35.0 hPa drop in 1 hour
        1450: "rapid_wind_gust",      # +55.0 km/h jump
        1680: "missing_temp_999",     # -999 null marker
        1850: "missing_rh_na",        # NA null marker
        2100: "multivariate_clash",   # 38°C with 98% RH and 1030 hPa pressure
        2350: "multivariate_clash_2", # -15°C with 15% RH and 980 hPa in summer
        2600: "sensor_drift",         # Rapid oscillating noise
        2890: "rapid_temp_drop",      # -18.0°C jump in 1 hour
        3120: "null_pressure_9999",   # -9999 null marker
        3350: "compound_anomaly",     # High temp + high wind + low pressure
        3500: "multivariate_clash_3"  # Unusual combination detected by ML
    }
    
    current_time = start_date
    
    for i in range(num_records):
        day_of_year = current_time.timetuple().tm_yday
        hour = current_time.hour
        
        # Seasonal temperature wave (-5°C winter to +30°C summer)
        seasonal_temp = 14.0 + 12.0 * math.sin(2 * math.pi * (day_of_year - 80) / 365.25)
        # Diurnal cycle (warmer at 14:00, cooler at 04:00)
        diurnal_temp = 6.0 * math.sin(2 * math.pi * (hour - 9) / 24.0)
        # Base realistic temperature with brownian noise
        target_temp = seasonal_temp + diurnal_temp
        current_temp = 0.85 * current_temp + 0.15 * target_temp + random.gauss(0, 0.6)
        
        # Relative humidity anti-correlates with temp + diurnal cycle
        base_rh = 70.0 - 15.0 * math.sin(2 * math.pi * (hour - 9) / 24.0) + random.gauss(0, 3.0)
        current_humidity = max(15.0, min(95.0, base_rh))
        
        # Atmospheric pressure (synoptic wave around 1013 hPa)
        synoptic_pressure = 1013.25 + 8.0 * math.sin(2 * math.pi * i / 168.0) + random.gauss(0, 0.8)
        current_pressure = synoptic_pressure
        
        # Wind speed (Weibull-like, higher in afternoon)
        base_wind = 8.0 + 5.0 * max(0.0, math.sin(2 * math.pi * (hour - 11) / 24.0)) + random.expovariate(0.2)
        current_wind = round(max(0.5, min(45.0, base_wind)), 1)
        
        # Format base values
        temp_val = round(current_temp, 1)
        rh_val = round(current_humidity, 1)
        pres_val = round(current_pressure, 1)
        wspd_val = round(current_wind, 1)
        
        # Inject anomalies if scheduled
        if i in anomaly_indices:
            atype = anomaly_indices[i]
            if atype == "extreme_temp_high":
                temp_val = 74.5
            elif atype == "extreme_temp_low":
                temp_val = -68.2
            elif atype == "impossible_humidity":
                rh_val = 125.0
            elif atype == "negative_humidity":
                rh_val = -12.0
            elif atype == "extreme_pressure_low":
                pres_val = 720.0
            elif atype == "extreme_pressure_high":
                pres_val = 1160.0
            elif atype == "extreme_wind":
                wspd_val = 145.0
            elif atype == "rapid_temp_jump":
                temp_val = round(temp_val + 24.0, 1)
            elif atype == "rapid_pressure_drop":
                pres_val = round(pres_val - 35.0, 1)
            elif atype == "rapid_wind_gust":
                wspd_val = round(wspd_val + 58.0, 1)
            elif atype == "missing_temp_999":
                temp_val = "-999"
            elif atype == "missing_rh_na":
                rh_val = "NA"
            elif atype == "multivariate_clash":
                temp_val = 39.5
                rh_val = 98.0
                pres_val = 1032.0
                wspd_val = 2.0
            elif atype == "multivariate_clash_2":
                temp_val = -16.0
                rh_val = 12.0
                pres_val = 975.0
                wspd_val = 42.0
            elif atype == "sensor_drift":
                temp_val = round(temp_val + 16.5, 1)
                rh_val = 99.0
            elif atype == "rapid_temp_drop":
                temp_val = round(temp_val - 21.0, 1)
            elif atype == "null_pressure_9999":
                pres_val = "-9999"
            elif atype == "compound_anomaly":
                temp_val = 62.0
                wspd_val = 108.0
                pres_val = 790.0
            elif atype == "multivariate_clash_3":
                temp_val = 36.0
                rh_val = 94.0
                pres_val = 990.0
                wspd_val = 38.0

        records.append({
            "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": temp_val,
            "humidity": rh_val,
            "pressure": pres_val,
            "wind_speed": wspd_val
        })
        
        # Advance 1 hour for each record (3,651 hourly records ≈ 5 months of hourly resolution or sampled sequence)
        current_time += timedelta(hours=1)
        
    # Write to CSV
    fieldnames = ["timestamp", "temperature", "humidity", "pressure", "wind_speed"]
    with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"Generated {len(records)} weather records at {OUTPUT_FILE}")
    return records

if __name__ == "__main__":
    generate_synthetic_weather()
