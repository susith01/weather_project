"""
===================================================================
wmo_imd_standards.py
WeatherGuard - Meteorological Quality Control Standards Validator
Conforming to:
- WMO-No. 8: Guide to Meteorological Instruments and Methods of Observation
- IMD: AWS Quality Control and Data Validation Guidelines
===================================================================
"""

class WMOIMDQualityValidator:
    # WMO Gross Range Limits (Tropical / Sub-Tropical / Alpine India)
    WMO_BOUNDS = {
        "temperature": {"min": -60.0, "max": 60.0, "unit": "°C"},
        "humidity": {"min": 0.0, "max": 100.0, "unit": "%"},
        "pressure": {"min": 800.0, "max": 1100.0, "unit": "hPa"},
        "wind_speed": {"min": 0.0, "max": 100.0, "unit": "km/h"},
    }

    # IMD Max Step (Rate-of-Change in 1 Hour)
    IMD_MAX_1H_STEP = {
        "temperature": 10.0,  # Max 10°C change/hour
        "humidity": 30.0,     # Max 30% change/hour
        "pressure": 12.0,     # Max 12 hPa barometric jump/hour
        "wind_speed": 40.0,   # Max 40 km/h jump/hour
    }

    @classmethod
    def check_gross_range(cls, sensor: str, value: float) -> bool:
        if sensor not in cls.WMO_BOUNDS:
            return True
        bounds = cls.WMO_BOUNDS[sensor]
        return bounds["min"] <= value <= bounds["max"]

    @classmethod
    def check_step_jump(cls, sensor: str, delta: float) -> bool:
        if sensor not in cls.IMD_MAX_1H_STEP:
            return True
        return abs(delta) <= cls.IMD_MAX_1H_STEP[sensor]

    @classmethod
    def check_psychrometric_consistency(cls, temp: float, rh: float) -> bool:
        """
        Thermodynamic consistency: Extreme high temp with extreme high RH violates
        standard atmospheric thermodynamics in non-maritime high altitudes.
        """
        if temp > 46.0 and rh > 90.0:
            return False  # Wet bulb temperature exceeds physical survivability
        return True
