import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { WeatherProcessedRecord, AppTheme } from "../types";
import { Thermometer, Droplets, Gauge, Wind } from "lucide-react";

interface TemperatureTrendChartProps {
  records: WeatherProcessedRecord[];
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
  theme?: AppTheme;
}

export const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({
  records,
  onSelectRecord,
  theme = "purple",
}) => {
  const isMidnight = theme === "midnight";
  const gridStroke = isMidnight ? "#334155" : "#54416d";
  const axisStroke = isMidnight ? "#94a3b8" : "#75b4e3";

  const [selectedVariable, setSelectedVariable] = useState<
    "temperature" | "humidity" | "pressure" | "wind_speed"
  >("temperature");

  const [showRollingMean, setShowRollingMean] = useState(true);

  // Sample data points if records are very large to keep rendering at 60fps
  const chartData = useMemo(() => {
    if (records.length <= 400) {
      return records;
    }
    // Subsample step but keep all anomalies guaranteed in the chart!
    const step = Math.ceil(records.length / 300);
    const sampled: WeatherProcessedRecord[] = [];
    records.forEach((r, i) => {
      if (r.anomaly || i % step === 0) {
        sampled.push(r);
      }
    });
    return sampled;
  }, [records]);

  const varConfig = {
    temperature: {
      label: "Temperature",
      unit: "°C",
      color: "#8fe0ff",
      icon: Thermometer,
      min: -30,
      max: 60,
    },
    humidity: {
      label: "Relative Humidity",
      unit: "%",
      color: "#75b4e3",
      icon: Droplets,
      min: 0,
      max: 100,
    },
    pressure: {
      label: "Pressure",
      unit: "hPa",
      color: "#8fe0ff",
      icon: Gauge,
      min: 800,
      max: 1100,
    },
    wind_speed: {
      label: "Wind Speed",
      unit: "km/h",
      color: "#e2e8f0",
      icon: Wind,
      min: 0,
      max: 120,
    },
  }[selectedVariable];

  return (
    <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <varConfig.icon className="w-4 h-4 text-[#8fe0ff]" />
            <span>{varConfig.label} Trend</span>
          </h2>
          <p className="text-xs text-[#75b4e3]">
            Observation timeline ({chartData.length} plotted points, anomalies flagged)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Variable Selector */}
          <div className="inline-flex rounded-lg p-0.5 bg-[#2b235a] border border-[#54416d]">
            {(
              [
                { id: "temperature", label: "Temp (°C)" },
                { id: "humidity", label: "Humidity (%)" },
                { id: "pressure", label: "Pressure (hPa)" },
                { id: "wind_speed", label: "Wind (km/h)" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariable(v.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedVariable === v.id
                    ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Rolling Mean Toggle */}
          {selectedVariable === "temperature" && (
            <button
              onClick={() => setShowRollingMean(!showRollingMean)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition ${
                showRollingMean
                  ? "bg-[#2b235a] border-[#8fe0ff] text-[#8fe0ff]"
                  : "bg-[#2b235a]/40 border-[#54416d] text-slate-300 hover:text-white"
              }`}
            >
              5h Rolling Avg
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                onSelectRecord?.(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis
              dataKey="timestamp"
              stroke={axisStroke}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(v) => {
                const parts = v.split(" ");
                return parts[0] ? parts[0].slice(5) : v;
              }}
              minTickGap={40}
            />
            <YAxis
              stroke={axisStroke}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              unit={varConfig.unit}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2b235a",
                borderColor: "#54416d",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
              }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const rec = payload[0].payload as WeatherProcessedRecord;
                return (
                  <div className="bg-[#2b235a] border border-[#54416d] p-2.5 rounded-lg shadow-xl text-xs space-y-1 max-w-xs">
                    <div className="font-semibold text-white border-b border-[#54416d] pb-1">
                      {rec.timestamp}
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>{varConfig.label}:</span>
                      <span className="font-mono font-bold text-[#8fe0ff]">
                        {rec[selectedVariable]} {varConfig.unit}
                      </span>
                    </div>
                    {selectedVariable === "temperature" && (
                      <div className="flex justify-between text-[#75b4e3]">
                        <span>5h Rolling Mean:</span>
                        <span className="font-mono">{rec.temp_rolling_mean} °C</span>
                      </div>
                    )}
                    {rec.anomaly && (
                      <div className="mt-1 pt-1 border-t border-[#54416d]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rec.severity === "High" ? "bg-rose-500" : "bg-amber-500"
                            }`}
                          ></span>
                          <span
                            className={`font-semibold ${
                              rec.severity === "High" ? "text-rose-400" : "text-amber-400"
                            }`}
                          >
                            {rec.severity} Severity Anomaly
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{rec.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Primary Value Line */}
            <Line
              type="monotone"
              dataKey={selectedVariable}
              stroke={varConfig.color}
              strokeWidth={1.75}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload.anomaly) return null;
                const isHigh = payload.severity === "High";
                return (
                  <circle
                    key={`dot-${payload.id}`}
                    cx={cx}
                    cy={cy}
                    r={isHigh ? 5 : 4}
                    fill={isHigh ? "#ef4444" : "#f59e0b"}
                    stroke="#2b235a"
                    strokeWidth={1.5}
                    className="cursor-pointer animate-pulse"
                  />
                );
              }}
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            />

            {/* Optional Rolling Mean Line for Temperature */}
            {selectedVariable === "temperature" && showRollingMean && (
              <Line
                type="monotone"
                dataKey="temp_rolling_mean"
                stroke="#75b4e3"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Click any anomaly point to inspect details in the drawer</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Anomaly
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Anomaly
          </span>
        </div>
      </div>
    </div>
  );
};
