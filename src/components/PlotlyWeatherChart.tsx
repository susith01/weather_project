import React, { useState } from "react";
import Plot from "react-plotly.js";
import { WeatherProcessedRecord, AppTheme } from "../types";
import { Sliders, Maximize2, Sparkles, Layers } from "lucide-react";

interface PlotlyWeatherChartProps {
  records: WeatherProcessedRecord[];
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
  theme?: AppTheme;
}

export const PlotlyWeatherChart: React.FC<PlotlyWeatherChartProps> = ({
  records,
  onSelectRecord,
  theme = "purple",
}) => {
  const [activeChannel, setActiveChannel] = useState<"temperature" | "multi" | "ml_scores">("temperature");

  const isMidnight = theme === "midnight";
  const canvasBg = isMidnight ? "#090d16" : "#2b235a";
  const gridColor = isMidnight ? "#334155" : "#54416d";
  const textColor = isMidnight ? "#f8fafc" : "#cbd5e1";
  const accentSky = isMidnight ? "#38bdf8" : "#8fe0ff";
  const accentBlue = isMidnight ? "#60a5fa" : "#75b4e3";

  // Sample or slice records for responsive interactive plotting
  const dataSlice = records.slice(0, 300);

  const timestamps = dataSlice.map((r) => r.timestamp);
  const temperatures = dataSlice.map((r) => r.temperature);
  const humidities = dataSlice.map((r) => r.humidity);
  const pressures = dataSlice.map((r) => r.pressure);
  const windSpeeds = dataSlice.map((r) => r.wind_speed);
  
  const ifScores = dataSlice.map((r) => r.anomaly_score);
  const aeLosses = dataSlice.map((r) => r.autoencoder_loss);

  // Anomalies points
  const anomalyRecords = dataSlice.filter((r) => r.anomaly);
  const anomalyTimestamps = anomalyRecords.map((r) => r.timestamp);
  const anomalyTemps = anomalyRecords.map((r) => r.temperature);

  let plotData: any[] = [];

  if (activeChannel === "temperature") {
    plotData = [
      {
        x: timestamps,
        y: temperatures,
        type: "scatter",
        mode: "lines",
        name: "Temperature (°C)",
        line: { color: accentSky, width: 2 },
      },
      {
        x: anomalyTimestamps,
        y: anomalyTemps,
        type: "scatter",
        mode: "markers",
        name: "Detected Anomalies",
        marker: { color: "#ef4444", size: 8, symbol: "circle-open-dot", line: { width: 2, color: "#f87171" } },
      },
    ];
  } else if (activeChannel === "multi") {
    plotData = [
      {
        x: timestamps,
        y: temperatures,
        type: "scatter",
        mode: "lines",
        name: "Temperature (°C)",
        line: { color: accentSky, width: 1.8 },
      },
      {
        x: timestamps,
        y: humidities,
        type: "scatter",
        mode: "lines",
        name: "Humidity (%)",
        line: { color: accentBlue, width: 1.8 },
      },
      {
        x: timestamps,
        y: windSpeeds,
        type: "scatter",
        mode: "lines",
        name: "Wind Speed (km/h)",
        line: { color: isMidnight ? "#f8fafc" : "#e2e8f0", width: 1.5 },
      },
    ];
  } else {
    // ML Scores: Isolation Forest vs Autoencoder Loss
    plotData = [
      {
        x: timestamps,
        y: ifScores,
        type: "scatter",
        mode: "lines",
        name: "Isolation Forest Score",
        line: { color: accentSky, width: 2 },
      },
      {
        x: timestamps,
        y: aeLosses,
        type: "scatter",
        mode: "lines",
        name: "Autoencoder Reconstruction Loss",
        line: { color: accentBlue, width: 2 },
      },
      {
        x: [timestamps[0], timestamps[timestamps.length - 1]],
        y: [0.05, 0.05],
        type: "scatter",
        mode: "lines",
        name: "IForest Contamination Threshold",
        line: { color: "#f43f5e", dash: "dot", width: 1.5 },
      },
    ];
  }

  return (
    <div className="bg-[#31255a] border border-[#54416d] rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2b235a] text-[#8fe0ff] border border-[#75b4e3]/40">
              Interactive Plotly Engine
            </span>
            <span className="text-xs font-semibold text-[#75b4e3]">
              Slide 3 Frontend Spec
            </span>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8fe0ff]" />
            Dynamic Sensor Telemetry & ML Loss Waveform
          </h3>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center bg-[#2b235a] p-0.5 rounded-lg border border-[#54416d] text-xs">
          <button
            onClick={() => setActiveChannel("temperature")}
            className={`px-3 py-1 rounded-md transition ${
              activeChannel === "temperature"
                ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Temperature & Anomalies
          </button>
          <button
            onClick={() => setActiveChannel("multi")}
            className={`px-3 py-1 rounded-md transition ${
              activeChannel === "multi"
                ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Multi-Sensor (T, RH, W)
          </button>
          <button
            onClick={() => setActiveChannel("ml_scores")}
            className={`px-3 py-1 rounded-md transition ${
              activeChannel === "ml_scores"
                ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Dual ML Scores (IF vs AE)
          </button>
        </div>
      </div>

      {/* Plotly Canvas Container */}
      <div className="w-full overflow-hidden rounded-xl bg-[#2b235a] border border-[#54416d]">
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            height: 340,
            margin: { l: 45, r: 25, t: 30, b: 40 },
            paper_bgcolor: canvasBg,
            plot_bgcolor: canvasBg,
            font: { color: textColor, size: 11, family: "Plus Jakarta Sans, sans-serif" },
            showlegend: true,
            legend: { orientation: "h", y: 1.15, x: 0, font: { size: 10, color: textColor } },
            xaxis: {
              gridcolor: gridColor,
              zerolinecolor: accentBlue,
              showgrid: true,
              tickangle: -20,
            },
            yaxis: {
              gridcolor: gridColor,
              zerolinecolor: accentBlue,
              showgrid: true,
            },
            hovermode: "x unified",
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          onClick={(data) => {
            if (data.points && data.points[0] && onSelectRecord) {
              const ptIdx = data.points[0].pointIndex;
              if (dataSlice[ptIdx]) {
                onSelectRecord(dataSlice[ptIdx]);
              }
            }
          }}
        />
      </div>
      <p className="text-[11px] text-slate-500 mt-2 text-right">
        Tip: Click and drag to zoom into anomalies, double-click to reset view. Click on any marker to inspect its SHAP breakdown.
      </p>
    </div>
  );
};
