import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { WeatherProcessedRecord, AppTheme } from "../types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AnomalyTimelineChartProps {
  records: WeatherProcessedRecord[];
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
  theme?: AppTheme;
}

export const AnomalyTimelineChart: React.FC<AnomalyTimelineChartProps> = ({
  records,
  onSelectRecord,
  theme = "purple",
}) => {
  const isMidnight = theme === "midnight";
  const gridStroke = isMidnight ? "#334155" : "#54416d";
  const axisStroke = isMidnight ? "#94a3b8" : "#75b4e3";

  const anomalies = records.filter((r) => r.anomaly);

  if (anomalies.length === 0) {
    return (
      <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-10 h-10 text-[#8fe0ff] mb-2" />
        <h3 className="text-sm font-semibold text-white">No Anomalies Found</h3>
        <p className="text-xs text-[#75b4e3] max-w-sm mt-1">
          No observations match the anomaly criteria under the currently selected filters.
        </p>
      </div>
    );
  }

  // Format data for Scatter
  const scatterData = anomalies.map((r) => ({
    ...r,
    displayTime: r.timestamp.slice(5, 16), // MM-DD HH:mm
  }));

  return (
    <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8fe0ff]" />
            <span>Anomaly Timeline</span>
          </h2>
          <p className="text-xs text-[#75b4e3]">
            Plotly Scatter: Timestamp vs. Isolation Forest Anomaly Score (
            {anomalies.length} anomalous events)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            High Severity (Score &gt; 0.15 or &ge;2 Rules)
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            Medium Severity
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 15, right: 20, bottom: 25, left: -10 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                onSelectRecord?.(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis
              dataKey="displayTime"
              name="Time"
              stroke={axisStroke}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              minTickGap={35}
            />
            <YAxis
              dataKey="anomaly_score"
              name="Anomaly Score"
              stroke={axisStroke}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              domain={[-0.1, "auto"]}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />
            <ReferenceLine y={0.15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "High Threshold (0.15)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
            <ReferenceLine y={0.05} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: "ML Cutoff (0.05)", fill: "#f59e0b", fontSize: 10, position: "insideBottomLeft" }} />
            
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: axisStroke }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const rec = payload[0].payload as WeatherProcessedRecord;
                const isHigh = rec.severity === "High";
                return (
                  <div className="bg-[#2b235a] border border-[#54416d] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 max-w-sm">
                    <div className="flex items-center justify-between border-b border-[#54416d] pb-1.5">
                      <span className="font-semibold text-white">{rec.timestamp}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {rec.severity} Severity
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-200 pt-0.5">
                      <div>Temp: <strong className="text-white font-mono">{rec.temperature}°C</strong></div>
                      <div>Humidity: <strong className="text-white font-mono">{rec.humidity}%</strong></div>
                      <div>Pressure: <strong className="text-white font-mono">{rec.pressure} hPa</strong></div>
                      <div>Wind: <strong className="text-white font-mono">{rec.wind_speed} km/h</strong></div>
                    </div>
                    <div className="flex justify-between border-t border-[#54416d] pt-1 text-slate-300">
                      <span>ML Score: <strong className="text-[#8fe0ff] font-mono">{rec.anomaly_score}</strong></span>
                      <span>Rules Violated: <strong className="text-[#8fe0ff] font-mono">{rec.rule_count}</strong></span>
                    </div>
                    <div className="bg-[#31255a] rounded p-1.5 text-[11px] text-slate-200 border border-[#54416d]">
                      <span className="font-semibold text-[#8fe0ff]">Explanation: </span>
                      {rec.explanation}
                    </div>
                  </div>
                );
              }}
            />

            <Scatter name="Anomalies" data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.severity === "High" ? "#EF4444" : "#F59E0B"}
                  className="cursor-pointer hover:opacity-80 transition"
                  r={entry.severity === "High" ? 6 : 5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 text-center">
        Points are generated by Isolation Forest decision scores + domain rule activations. Click any point to open deep diagnostic.
      </div>
    </div>
  );
};
