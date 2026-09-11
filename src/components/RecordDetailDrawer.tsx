import React from "react";
import { WeatherProcessedRecord } from "../types";
import { X, AlertTriangle, ShieldCheck, Thermometer, Droplets, Gauge, Wind, Activity } from "lucide-react";

interface RecordDetailDrawerProps {
  record: WeatherProcessedRecord | null;
  onClose: () => void;
  onOpenShap?: (record: WeatherProcessedRecord) => void;
}

export const RecordDetailDrawer: React.FC<RecordDetailDrawerProps> = ({
  record,
  onClose,
  onOpenShap,
}) => {
  if (!record) return null;

  const isHigh = record.severity === "High";
  const isMed = record.severity === "Medium";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-[#2b235a] border-l border-[#54416d] h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#54416d] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#75b4e3]">Record #{record.id}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    isHigh
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : isMed
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-[#31255a] text-[#8fe0ff] border border-[#75b4e3]/40"
                  }`}
                >
                  {record.severity} Severity
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-mono mt-1">
                {record.timestamp}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#31255a] text-slate-300 hover:text-white hover:bg-[#54416d] transition border border-[#54416d]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation Alert */}
          <div
            className={`p-4 rounded-xl border ${
              record.anomaly
                ? isHigh
                  ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
                  : "bg-amber-950/40 border-amber-800/80 text-amber-200"
                : "bg-[#31255a]/60 border-[#75b4e3]/40 text-[#8fe0ff]"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {record.anomaly ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#8fe0ff]" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {record.anomaly ? "Anomaly Diagnosis" : "Validated Observation"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">{record.explanation}</p>
              </div>
            </div>
          </div>

          {/* Observed Meteorological Readings */}
          <div>
            <h3 className="text-xs font-bold text-[#75b4e3] uppercase tracking-wider mb-3">
              Meteorological Variables
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#31255a] rounded-xl border border-[#54416d]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#8fe0ff]" />
                    Temperature
                  </span>
                  {record.rule_temperature && (
                    <span className="text-[10px] text-rose-400 font-bold">OUT OF BOUNDS</span>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {record.temperature}°C
                </div>
                <div className="text-[11px] text-[#75b4e3] mt-0.5">
                  Δ: {record.temp_change > 0 ? `+${record.temp_change}` : record.temp_change}°C | 5h Avg: {record.temp_rolling_mean}°C
                </div>
              </div>

              <div className="p-3 bg-[#31255a] rounded-xl border border-[#54416d]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#75b4e3]" />
                    Humidity
                  </span>
                  {record.rule_humidity && (
                    <span className="text-[10px] text-rose-400 font-bold">OUT OF BOUNDS</span>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {record.humidity}%
                </div>
                <div className="text-[11px] text-[#75b4e3] mt-0.5">
                  Δ: {record.humidity_change > 0 ? `+${record.humidity_change}` : record.humidity_change}% | 5h Avg: {record.humidity_rolling_mean}%
                </div>
              </div>

              <div className="p-3 bg-[#31255a] rounded-xl border border-[#54416d]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#8fe0ff]" />
                    Pressure
                  </span>
                  {record.rule_pressure && (
                    <span className="text-[10px] text-rose-400 font-bold">OUT OF BOUNDS</span>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {record.pressure} hPa
                </div>
                <div className="text-[11px] text-[#75b4e3] mt-0.5">
                  Δ: {record.pressure_change > 0 ? `+${record.pressure_change}` : record.pressure_change} hPa | 5h Avg: {record.pressure_rolling_mean}
                </div>
              </div>

              <div className="p-3 bg-[#31255a] rounded-xl border border-[#54416d]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#75b4e3]" />
                    Wind Speed
                  </span>
                  {record.rule_wind && (
                    <span className="text-[10px] text-rose-400 font-bold">OUT OF BOUNDS</span>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  {record.wind_speed} km/h
                </div>
                <div className="text-[11px] text-[#75b4e3] mt-0.5">
                  Δ: {record.wind_change > 0 ? `+${record.wind_change}` : record.wind_change} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Model & Rule Diagnostic Scores */}
          <div>
            <h3 className="text-xs font-bold text-[#75b4e3] uppercase tracking-wider mb-3">
              Diagnostic Classifications
            </h3>
            <div className="bg-[#31255a]/70 rounded-xl border border-[#54416d] p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Isolation Forest ML Score:</span>
                <span className="font-mono font-bold text-[#8fe0ff]">
                  {record.anomaly_score.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">ML Anomaly Flag:</span>
                <span
                  className={`font-semibold ${
                    record.ml_anomaly ? "text-amber-400" : "text-[#75b4e3]"
                  }`}
                >
                  {record.ml_anomaly ? "Flagged True" : "Normal False"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Deep Autoencoder MSE Loss:</span>
                <span className="font-mono font-bold text-[#8fe0ff]">
                  {record.autoencoder_loss}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Autoencoder Anomaly Flag:</span>
                <span
                  className={`font-semibold ${
                    record.autoencoder_anomaly ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  {record.autoencoder_anomaly ? "Flagged True" : "Normal False"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Domain Rules Triggered:</span>
                <span className="font-mono font-bold text-amber-400">
                  {record.rule_count} rules
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">99th Percentile Rapid Jump:</span>
                <span
                  className={`font-semibold ${
                    record.rule_sudden_change ? "text-rose-400" : "text-slate-400"
                  }`}
                >
                  {record.rule_sudden_change ? "Triggered" : "Normal"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Temp / Humidity Ratio:</span>
                <span className="font-mono text-slate-200">
                  {record.temp_humidity_ratio.toFixed(3)}
                </span>
              </div>
            </div>

            {/* SHAP Interpretability Button */}
            {onOpenShap && (
              <button
                onClick={() => onOpenShap(record)}
                className="w-full mt-3 py-2 px-3 rounded-lg bg-[#31255a] hover:bg-[#54416d] text-[#8fe0ff] border border-[#54416d] text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>🔬</span>
                <span>Inspect SHAP Feature Attribution Waterfall</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-[#54416d]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[#31255a] hover:bg-[#54416d] text-xs font-semibold text-white border border-[#54416d] transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
