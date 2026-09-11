import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { WeatherProcessedRecord, AppTheme } from "../types";

interface SeverityChartProps {
  records: WeatherProcessedRecord[];
  theme?: AppTheme;
}

export const SeverityChart: React.FC<SeverityChartProps> = ({ records, theme = "purple" }) => {
  const isMidnight = theme === "midnight";
  const normalColor = isMidnight ? "#38bdf8" : "#75b4e3";
  const gridStroke = isMidnight ? "#334155" : "#54416d";
  const axisStroke = isMidnight ? "#94a3b8" : "#75b4e3";
  const tooltipBg = isMidnight ? "#0f172a" : "#2b235a";
  const tooltipBorder = isMidnight ? "#334155" : "#54416d";

  const normalCount = records.filter((r) => r.severity === "Normal").length;
  const mediumCount = records.filter((r) => r.severity === "Medium").length;
  const highCount = records.filter((r) => r.severity === "High").length;

  const data = [
    { severity: "Normal", count: normalCount, color: normalColor },
    { severity: "Medium", count: mediumCount, color: "#F59E0B" },
    { severity: "High", count: highCount, color: "#EF4444" },
  ];

  return (
    <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Severity Distribution</h2>
          <p className="text-xs text-[#75b4e3]">Weather Anomaly Severity breakdown</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: normalColor }}></span>
            Normal: <strong className="text-white font-mono">{normalCount}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            Medium: <strong className="text-white font-mono">{mediumCount}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            High: <strong className="text-white font-mono">{highCount}</strong>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} vertical={false} />
            <XAxis
              dataKey="severity"
              stroke={axisStroke}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
            />
            <YAxis
              stroke={axisStroke}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
              }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} records`, "Count"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
