import { WeatherRawRecord } from "../types";

/**
 * Seeded PRNG (Linear Congruential Generator) for 100% deterministic reproducibility
 */
class SeededRandom {
  private m = 0x80000000;
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  nextFloat(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  nextGaussian(mean: number = 0, stdev: number = 1): number {
    let u = 1 - this.nextFloat();
    let v = this.nextFloat();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
  }

  nextExp(lambda: number = 0.2): number {
    return -Math.log(1 - this.nextFloat()) / lambda;
  }
}

export function generateSyntheticWeatherData(numRecords: number = 3651): WeatherRawRecord[] {
  const rng = new SeededRandom(42);
  const startDate = new Date(2021, 0, 1, 0, 0, 0); // 2021-01-01 00:00:00

  let currentTemp = 18.0;
  let currentHumidity = 65.0;
  let currentPressure = 1013.25;

  const anomalyIndices: Record<number, string> = {
    50: "extreme_temp_high",     // 74.5°C
    120: "extreme_temp_low",     // -68.2°C
    240: "impossible_humidity",   // 125.0%
    380: "negative_humidity",     // -12.0%
    510: "extreme_pressure_low",  // 720.0 hPa
    690: "extreme_pressure_high", // 1160.0 hPa
    850: "extreme_wind",          // 145.0 km/h
    1020: "rapid_temp_jump",      // +24.0°C jump in 1 hour
    1200: "rapid_pressure_drop",  // -35.0 hPa drop in 1 hour
    1450: "rapid_wind_gust",      // +58.0 km/h jump
    1680: "missing_temp_999",     // -999 null marker
    1850: "missing_rh_na",        // NA null marker
    2100: "multivariate_clash",   // 39.5°C with 98% RH and 1032 hPa
    2350: "multivariate_clash_2", // -16°C with 12% RH and 975 hPa
    2600: "sensor_drift",         // +16.5°C jump + 99% RH
    2890: "rapid_temp_drop",      // -21.0°C jump in 1 hour
    3120: "null_pressure_9999",   // -9999 null marker
    3350: "compound_anomaly",     // 62.0°C + 108 km/h wind + 790 hPa
    3500: "multivariate_clash_3"  // 36°C with 94% RH and 990 hPa at 38 km/h
  };

  const records: WeatherRawRecord[] = [];

  for (let i = 0; i < numRecords; i++) {
    const curTime = new Date(startDate.getTime() + i * 3600 * 1000);
    const dayOfYear = Math.floor((curTime.getTime() - new Date(curTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const hour = curTime.getHours();

    // Seasonal wave
    const seasonalTemp = 14.0 + 12.0 * Math.sin((2 * Math.PI * (dayOfYear - 80)) / 365.25);
    // Diurnal cycle
    const diurnalTemp = 6.0 * Math.sin((2 * Math.PI * (hour - 9)) / 24.0);
    const targetTemp = seasonalTemp + diurnalTemp;
    currentTemp = 0.85 * currentTemp + 0.15 * targetTemp + rng.nextGaussian(0, 0.6);

    // Humidity
    const baseRh = 70.0 - 15.0 * Math.sin((2 * Math.PI * (hour - 9)) / 24.0) + rng.nextGaussian(0, 3.0);
    currentHumidity = Math.max(15.0, Math.min(95.0, baseRh));

    // Pressure
    const synopticPressure = 1013.25 + 8.0 * Math.sin((2 * Math.PI * i) / 168.0) + rng.nextGaussian(0, 0.8);
    currentPressure = synopticPressure;

    // Wind speed
    const baseWind = 8.0 + 5.0 * Math.max(0.0, Math.sin((2 * Math.PI * (hour - 11)) / 24.0)) + rng.nextExp(0.2);
    const currentWind = Math.round(Math.max(0.5, Math.min(45.0, baseWind)) * 10) / 10;

    let tempVal: number | string = Math.round(currentTemp * 10) / 10;
    let rhVal: number | string = Math.round(currentHumidity * 10) / 10;
    let presVal: number | string = Math.round(currentPressure * 10) / 10;
    let wspdVal: number | string = currentWind;

    // Inject anomalies
    if (anomalyIndices[i]) {
      const atype = anomalyIndices[i];
      if (atype === "extreme_temp_high") tempVal = 74.5;
      else if (atype === "extreme_temp_low") tempVal = -68.2;
      else if (atype === "impossible_humidity") rhVal = 125.0;
      else if (atype === "negative_humidity") rhVal = -12.0;
      else if (atype === "extreme_pressure_low") presVal = 720.0;
      else if (atype === "extreme_pressure_high") presVal = 1160.0;
      else if (atype === "extreme_wind") wspdVal = 145.0;
      else if (atype === "rapid_temp_jump") tempVal = Math.round(((tempVal as number) + 24.0) * 10) / 10;
      else if (atype === "rapid_pressure_drop") presVal = Math.round(((presVal as number) - 35.0) * 10) / 10;
      else if (atype === "rapid_wind_gust") wspdVal = Math.round(((wspdVal as number) + 58.0) * 10) / 10;
      else if (atype === "missing_temp_999") tempVal = "-999";
      else if (atype === "missing_rh_na") rhVal = "NA";
      else if (atype === "multivariate_clash") {
        tempVal = 39.5;
        rhVal = 98.0;
        presVal = 1032.0;
        wspdVal = 2.0;
      } else if (atype === "multivariate_clash_2") {
        tempVal = -16.0;
        rhVal = 12.0;
        presVal = 975.0;
        wspdVal = 42.0;
      } else if (atype === "sensor_drift") {
        tempVal = Math.round(((tempVal as number) + 16.5) * 10) / 10;
        rhVal = 99.0;
      } else if (atype === "rapid_temp_drop") {
        tempVal = Math.round(((tempVal as number) - 21.0) * 10) / 10;
      } else if (atype === "null_pressure_9999") {
        presVal = "-9999";
      } else if (atype === "compound_anomaly") {
        tempVal = 62.0;
        wspdVal = 108.0;
        presVal = 790.0;
      } else if (atype === "multivariate_clash_3") {
        tempVal = 36.0;
        rhVal = 94.0;
        presVal = 990.0;
        wspdVal = 38.0;
      }
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestampStr = `${curTime.getFullYear()}-${pad(curTime.getMonth() + 1)}-${pad(curTime.getDate())} ${pad(curTime.getHours())}:${pad(curTime.getMinutes())}:${pad(curTime.getSeconds())}`;

    records.push({
      id: i + 1,
      timestamp: timestampStr,
      temperature: tempVal,
      humidity: rhVal,
      pressure: presVal,
      wind_speed: wspdVal
    });
  }

  return records;
}
