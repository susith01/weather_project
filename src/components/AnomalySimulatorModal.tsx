import React, { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle, Zap, RefreshCw } from "lucide-react";
import { WeatherRawRecord, WeatherProcessedRecord } from "../types";
import { executeWeatherGuardPipeline } from "../pipeline/engine";

interface AnomalySimulatorModalProps {
  onInjectRecord: (record: WeatherRawRecord) => void;
  recentRecords: WeatherProcessedRecord[];
}

export const AnomalySimulatorModal: React.FC<AnomalySimulatorModalProps> = ({
  onInjectRecord,
  recentRecords,
}) => {
  const [temperature, setTemperature] = useState<number>(22.5);
  const [humidity, setHumidity] = useState<number>(60.0);
  const [pressure, setPressure] = useState<number>(1013.2);
  const [windSpeed, setWindSpeed] = useState<number>(15.0);

  const [simResult, setSimResult] = useState<{
    anomaly: boolean;
    severity: string;
    explanation: string;
    score: number;
    ruleCount: number;
  } | null>(null);

  const presets = [
    {
      name: "Extreme Heat Spike",
      icon: "🔥",
      temp: 74.5,
      rh: 25.0,
      pres: 1008.0,
      wind: 12.0,
      desc: "Violates temperature upper limit (+60°C)",
    },
    {
      name: "Sub-Zero Freeze",
      icon: "❄️",
      temp: -68.0,
      rh: 85.0,
      pres: 1020.0,
      wind: 8.0,
      desc: "Violates physical temperature lower limit (-60°C)",
    },
    {
      name: "Impossible Humidity",
      icon: "💧",
      temp: 24.0,
      rh: 125.0,
      pres: 1012.0,
      wind: 6.0,
      desc: "Relative humidity exceeds 100% saturation",
    },
    {
      name: "Severe Barometric Crash",
      icon: "🌪️",
      temp: 26.0,
      rh: 90.0,
      pres: 720.0,
      wind: 85.0,
      desc: "Pressure drops below 800 hPa lower boundary",
    },
    {
      name: "Hurricane Gust Spike",
      icon: "💨",
      temp: 20.0,
      rh: 80.0,
      pres: 990.0,
      wind: 145.0,
      desc: "Wind speed exceeds 100 km/h boundary",
    },
    {
      name: "Rapid Temperature Jump",
      icon: "⚡",
      temp: 46.0,
      rh: 45.0,
      pres: 1011.0,
      wind: 20.0,
      desc: "+24°C sudden jump from previous hourly state",
    },
    {
      name: "Multivariate Clash (ML)",
      icon: "🧠",
      temp: 39.0,
      rh: 98.0,
      pres: 1032.0,
      wind: 2.0,
      desc: "Rare thermodynamic combination detected by Isolation Forest",
    },
    {
      name: "Nominal Baseline (Normal)",
      icon: "☀️",
      temp: 21.0,
      rh: 62.0,
      pres: 1014.0,
      wind: 14.0,
      desc: "Standard calibrated weather observation",
    },
  ];

  const handleTestEvaluation = () => {
    const last10 = recentRecords.slice(-10).map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      temperature: r.temperature,
      humidity: r.humidity,
      pressure: r.pressure,
      wind_speed: r.wind_speed,
    }));

    const testTime = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const testTimestamp = `${testTime.getFullYear()}-${pad(testTime.getMonth() + 1)}-${pad(
      testTime.getDate()
    )} ${pad(testTime.getHours())}:${pad(testTime.getMinutes())}:${pad(testTime.getSeconds())}`;

    const testItem: WeatherRawRecord = {
      id: 99999,
      timestamp: testTimestamp,
      temperature,
      humidity,
      pressure,
      wind_speed: windSpeed,
    };

    const runData = [...last10, testItem];
    const { processed } = executeWeatherGuardPipeline(runData);
    const evalResult = processed[processed.length - 1];

    setSimResult({
      anomaly: evalResult.anomaly,
      severity: evalResult.severity,
      explanation: evalResult.explanation,
      score: evalResult.anomaly_score,
      ruleCount: evalResult.rule_count,
    });
  };

  const handleInjectIntoStream = () => {
    const testTime = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const testTimestamp = `${testTime.getFullYear()}-${pad(testTime.getMonth() + 1)}-${pad(
      testTime.getDate()
    )} ${pad(testTime.getHours())}:${pad(testTime.getMinutes())}:${pad(testTime.getSeconds())}`;

    const newRecord: WeatherRawRecord = {
      id: Date.now(),
      timestamp: testTimestamp,
      temperature,
      humidity,
      pressure,
      wind_speed: windSpeed,
    };

    onInjectRecord(newRecord);
    handleTestEvaluation();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">
            Interactive Sensor Anomaly Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Simulate sensory malfunctions, physical boundary violations, rapid rate-of-change jumps, or multi-variate clashes to observe live pipeline scoring and natural language diagnostic responses.
        </p>
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
          Select Anomaly Scenario Preset:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setTemperature(p.temp);
                setHumidity(p.rh);
                setPressure(p.pres);
                setWindSpeed(p.wind);
                setSimResult(null);
              }}
              className="p-3 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 text-left transition flex items-start gap-2.5"
            >
              <span className="text-lg">{p.icon}</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Value Sliders & Input */}
      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Tweak Observation Variables
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Temperature</span>
              <span className="font-mono font-bold text-cyan-300">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="-80"
              max="90"
              step="0.5"
              value={temperature}
              onChange={(e) => {
                setTemperature(parseFloat(e.target.value));
                setSimResult(null);
              }}
              className="w-full accent-cyan-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>-80°C</span>
              <span>Bound: -60 to 60°C</span>
              <span>+90°C</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Relative Humidity</span>
              <span className="font-mono font-bold text-emerald-300">{humidity}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="140"
              step="1"
              value={humidity}
              onChange={(e) => {
                setHumidity(parseFloat(e.target.value));
                setSimResult(null);
              }}
              className="w-full accent-emerald-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>-20%</span>
              <span>Bound: 0 to 100%</span>
              <span>140%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Barometric Pressure</span>
              <span className="font-mono font-bold text-purple-300">{pressure} hPa</span>
            </div>
            <input
              type="range"
              min="700"
              max="1200"
              step="1"
              value={pressure}
              onChange={(e) => {
                setPressure(parseFloat(e.target.value));
                setSimResult(null);
              }}
              className="w-full accent-purple-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>700 hPa</span>
              <span>Bound: 800 to 1100</span>
              <span>1200 hPa</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Wind Speed</span>
              <span className="font-mono font-bold text-amber-300">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="160"
              step="1"
              value={windSpeed}
              onChange={(e) => {
                setWindSpeed(parseFloat(e.target.value));
                setSimResult(null);
              }}
              className="w-full accent-amber-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>0 km/h</span>
              <span>Bound: 0 to 100</span>
              <span>160 km/h</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTestEvaluation}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Evaluate Anomaly Detection Live</span>
          </button>

          <button
            onClick={handleInjectIntoStream}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inject Into Stream Dataset</span>
          </button>
        </div>
      </div>

      {/* Live Result Evaluation Box */}
      {simResult && (
        <div
          className={`p-5 rounded-xl border transition ${
            simResult.anomaly
              ? simResult.severity === "High"
                ? "bg-rose-950/30 border-rose-800 text-rose-200"
                : "bg-amber-950/30 border-amber-800 text-amber-200"
              : "bg-emerald-950/30 border-emerald-800 text-emerald-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {simResult.anomaly ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">
                    {simResult.anomaly
                      ? `${simResult.severity} Severity Anomaly Flagged`
                      : "Nominal Observation (Pass)"}
                  </h4>
                  <span className="text-xs opacity-75">
                    (Isolation Forest Score: {simResult.score.toFixed(3)} | Rules Violated: {simResult.ruleCount})
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{simResult.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
