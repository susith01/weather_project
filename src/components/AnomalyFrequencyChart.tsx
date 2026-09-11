import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WeatherProcessedRecord, AppTheme } from "../types";
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Layers,
} from "lucide-react";

export type TimeGranularity = "weekly" | "monthly" | "daily";
export type ReliabilityChartMode = "combined" | "stacked_bars" | "reliability_line";

interface AnomalyFrequencyChartProps {
  records: WeatherProcessedRecord[];
  theme?: AppTheme;
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
}

interface BucketData {
  periodKey: string;
  displayLabel: string;
  dateRange: string;
  totalCount: number;
  normalCount: number;
  mediumCount: number;
  highCount: number;
  totalAnomalies: number;
  reliabilityRate: number; // percentage (0 - 100)
  topTrigger?: string;
  records: WeatherProcessedRecord[];
}

export const AnomalyFrequencyChart: React.FC<AnomalyFrequencyChartProps> = ({
  records,
  theme = "purple",
  onSelectRecord,
}) => {
  const [granularity, setGranularity] = useState<TimeGranularity>("weekly");
  const [chartMode, setChartMode] = useState<ReliabilityChartMode>("combined");
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null);

  const isMidnight = theme === "midnight";
  const gridStroke = isMidnight ? "#334155" : "#54416d";
  const axisStroke = isMidnight ? "#94a3b8" : "#75b4e3";
  const tooltipBg = isMidnight ? "#0f172a" : "#2b235a";
  const tooltipBorder = isMidnight ? "#334155" : "#54416d";
  const reliabilityColor = isMidnight ? "#38bdf8" : "#8fe0ff";
  const mediumColor = "#F59E0B";
  const highColor = "#EF4444";

  // Aggregate records into chronological buckets
  const { buckets, overallStats } = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        buckets: [],
        overallStats: {
          total: 0,
          anomalies: 0,
          high: 0,
          medium: 0,
          reliabilityRate: 100,
          cleanBuckets: 0,
          peakBucket: null as BucketData | null,
        },
      };
    }

    // Sort records chronologically
    const sorted = [...records].sort(
      (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
    );

    const map = new Map<string, BucketData>();

    const pad = (n: number) => n.toString().padStart(2, "0");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sorted.forEach((rec) => {
      const d = rec.dateObj;
      let key = "";
      let label = "";
      let range = "";

      if (granularity === "monthly") {
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        range = `Full Month (${monthNames[d.getMonth()]} ${d.getFullYear()})`;
      } else if (granularity === "daily") {
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        label = `${monthNames[d.getMonth()]} ${pad(d.getDate())}`;
        range = `${monthNames[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
      } else {
        // Weekly (7-day buckets starting from day 1 of the dataset)
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const dayOfYear = Math.floor(
          (d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
        );
        const weekNumber = Math.floor(dayOfYear / 7) + 1;
        key = `${d.getFullYear()}-W${pad(weekNumber)}`;
        label = `W${weekNumber} (${monthNames[d.getMonth()]})`;

        // Calculate week start and end
        const weekStartDay = (weekNumber - 1) * 7;
        const weekStartDate = new Date(startOfYear.getTime() + weekStartDay * 86400000);
        const weekEndDate = new Date(weekStartDate.getTime() + 6 * 86400000);
        range = `${monthNames[weekStartDate.getMonth()]} ${pad(weekStartDate.getDate())} - ${monthNames[weekEndDate.getMonth()]} ${pad(weekEndDate.getDate())}`;
      }

      let bucket = map.get(key);
      if (!bucket) {
        bucket = {
          periodKey: key,
          displayLabel: label,
          dateRange: range,
          totalCount: 0,
          normalCount: 0,
          mediumCount: 0,
          highCount: 0,
          totalAnomalies: 0,
          reliabilityRate: 100,
          records: [],
        };
        map.set(key, bucket);
      }

      bucket.totalCount += 1;
      bucket.records.push(rec);

      if (rec.severity === "High") {
        bucket.highCount += 1;
        bucket.totalAnomalies += 1;
      } else if (rec.severity === "Medium") {
        bucket.mediumCount += 1;
        bucket.totalAnomalies += 1;
      } else {
        bucket.normalCount += 1;
      }
    });

    const bucketList: BucketData[] = [];
    let totalAll = 0;
    let highAll = 0;
    let mediumAll = 0;
    let anomaliesAll = 0;
    let cleanCount = 0;
    let peak: BucketData | null = null;

    map.forEach((bucket) => {
      // Calculate reliability rate: percentage of non-anomalous readings
      const rate =
        bucket.totalCount > 0
          ? ((bucket.totalCount - bucket.totalAnomalies) / bucket.totalCount) * 100
          : 100;
      bucket.reliabilityRate = Math.round(rate * 10) / 10;

      // Detect top anomaly trigger in this bucket
      if (bucket.totalAnomalies > 0) {
        const triggers: Record<string, number> = {};
        bucket.records.forEach((r) => {
          if (r.anomaly) {
            const cause = r.explanation.split("(")[0].trim() || "Multi-sensor Anomaly";
            triggers[cause] = (triggers[cause] || 0) + 1;
          }
        });
        const top = Object.entries(triggers).sort((a, b) => b[1] - a[1])[0];
        bucket.topTrigger = top ? `${top[0]} (${top[1]}x)` : undefined;
      }

      totalAll += bucket.totalCount;
      highAll += bucket.highCount;
      mediumAll += bucket.mediumCount;
      anomaliesAll += bucket.totalAnomalies;

      if (bucket.totalAnomalies === 0) {
        cleanCount += 1;
      }

      if (!peak || bucket.totalAnomalies > peak.totalAnomalies) {
        peak = bucket;
      }

      bucketList.push(bucket);
    });

    const overallReliability =
      totalAll > 0 ? ((totalAll - anomaliesAll) / totalAll) * 100 : 100;

    return {
      buckets: bucketList,
      overallStats: {
        total: totalAll,
        anomalies: anomaliesAll,
        high: highAll,
        medium: mediumAll,
        reliabilityRate: Math.round(overallReliability * 10) / 10,
        cleanBuckets: cleanCount,
        peakBucket: peak,
      },
    };
  }, [records, granularity]);

  // Selected bucket inspection
  const selectedBucket = useMemo(() => {
    if (!selectedBucketKey) return null;
    return buckets.find((b) => b.periodKey === selectedBucketKey) || null;
  }, [selectedBucketKey, buckets]);

  // Determine min reliability rate for YAxis domain
  const minReliability = useMemo(() => {
    if (buckets.length === 0) return 90;
    const lowest = Math.min(...buckets.map((b) => b.reliabilityRate));
    return Math.max(0, Math.floor((lowest - 5) / 5) * 5);
  }, [buckets]);

  // Reliability tier
  const reliabilityTier =
    overallStats.reliabilityRate >= 99.0
      ? { label: "WMO Grade A (Optimal)", color: "text-emerald-400", bg: "bg-emerald-950/70 border-emerald-800" }
      : overallStats.reliabilityRate >= 97.0
      ? { label: "WMO Grade B (Reliable)", color: "text-[#8fe0ff]", bg: "bg-cyan-950/70 border-cyan-800" }
      : overallStats.reliabilityRate >= 95.0
      ? { label: "Guarded (Fair)", color: "text-amber-400", bg: "bg-amber-950/70 border-amber-800" }
      : { label: "Degraded (Attention Required)", color: "text-rose-400", bg: "bg-rose-950/70 border-rose-800" };

  if (records.length === 0) {
    return (
      <div
        id="anomaly-frequency-empty"
        className="bg-[#31255a] border border-[#54416d] rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center"
      >
        <CheckCircle2 className="w-10 h-10 text-[#8fe0ff] mb-2" />
        <h3 className="text-sm font-semibold text-white">No Telemetry Records Available</h3>
        <p className="text-xs text-[#75b4e3] max-w-sm mt-1">
          Telemetry data is currently empty or filtered out. Adjust filters or rerun the pipeline to view reliability frequency.
        </p>
      </div>
    );
  }

  return (
    <div
      id="anomaly-frequency-container"
      className="bg-[#31255a] border border-[#54416d] rounded-xl p-5 shadow-sm space-y-4"
    >
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#54416d] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8fe0ff]" />
            <h2 className="text-sm font-semibold text-white">
              System Reliability & Anomaly Frequency Over Time
            </h2>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${reliabilityTier.bg} ${reliabilityTier.color}`}>
              {reliabilityTier.label}
            </span>
          </div>
          <p className="text-xs text-[#75b4e3] mt-0.5">
            Temporal breakdown of High vs. Medium severity events and AWS sensor reliability index (%)
          </p>
        </div>

        {/* Controls: Granularity & Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Granularity Selector */}
          <div
            id="granularity-selector-group"
            className="inline-flex rounded-lg p-0.5 bg-[#2b235a] border border-[#54416d] text-xs font-medium"
            role="radiogroup"
            aria-label="Time Granularity"
          >
            {(["weekly", "monthly", "daily"] as TimeGranularity[]).map((g) => (
              <button
                key={g}
                id={`granularity-btn-${g}`}
                type="button"
                role="radio"
                aria-checked={granularity === g}
                onClick={() => {
                  setGranularity(g);
                  setSelectedBucketKey(null);
                }}
                className={`px-2.5 py-1 rounded capitalize transition cursor-pointer ${
                  granularity === g
                    ? "bg-[#54416d] text-white font-bold shadow-sm ring-1 ring-[#8fe0ff]/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Chart Mode Selector */}
          <div
            id="chart-mode-selector-group"
            className="inline-flex rounded-lg p-0.5 bg-[#2b235a] border border-[#54416d] text-xs font-medium"
            role="radiogroup"
            aria-label="Chart Visualization Mode"
          >
            <button
              id="mode-btn-combined"
              type="button"
              role="radio"
              aria-checked={chartMode === "combined"}
              onClick={() => setChartMode("combined")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                chartMode === "combined"
                  ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Combined: Severity Bars + Reliability Rate Line"
            >
              Combined
            </button>
            <button
              id="mode-btn-bars"
              type="button"
              role="radio"
              aria-checked={chartMode === "stacked_bars"}
              onClick={() => setChartMode("stacked_bars")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                chartMode === "stacked_bars"
                  ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Severity Bars Only"
            >
              Frequency
            </button>
            <button
              id="mode-btn-line"
              type="button"
              role="radio"
              aria-checked={chartMode === "reliability_line"}
              onClick={() => setChartMode("reliability_line")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                chartMode === "reliability_line"
                  ? "bg-[#75b4e3] text-[#2b235a] font-bold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Reliability Rate Line Only"
            >
              Reliability %
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#2b235a] border border-[#54416d] rounded-lg p-3">
          <div className="flex items-center justify-between text-[#75b4e3] text-xs mb-1">
            <span>Overall Reliability</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#8fe0ff]" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {overallStats.reliabilityRate}%
          </div>
          <div className="text-[11px] text-slate-300">
            {overallStats.total - overallStats.anomalies} of {overallStats.total.toLocaleString()} valid
          </div>
        </div>

        <div className="bg-[#2b235a] border border-[#54416d] rounded-lg p-3">
          <div className="flex items-center justify-between text-[#75b4e3] text-xs mb-1">
            <span>High Severity</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">
            {overallStats.high}
          </div>
          <div className="text-[11px] text-slate-300">
            Physical limits &amp; multi-rule
          </div>
        </div>

        <div className="bg-[#2b235a] border border-[#54416d] rounded-lg p-3">
          <div className="flex items-center justify-between text-[#75b4e3] text-xs mb-1">
            <span>Medium Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            {overallStats.medium}
          </div>
          <div className="text-[11px] text-slate-300">
            ML statistical deviations
          </div>
        </div>

        <div className="bg-[#2b235a] border border-[#54416d] rounded-lg p-3">
          <div className="flex items-center justify-between text-[#75b4e3] text-xs mb-1">
            <span>Zero-Anomaly Windows</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {overallStats.cleanBuckets} / {buckets.length}
          </div>
          <div className="text-[11px] text-slate-300">
            100% reliable intervals
          </div>
        </div>
      </div>

      {/* Main Recharts Composed Area */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={buckets}
            margin={{ top: 10, right: chartMode === "stacked_bars" ? 10 : 35, left: -10, bottom: 20 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const b = e.activePayload[0].payload as BucketData;
                setSelectedBucketKey((prev) => (prev === b.periodKey ? null : b.periodKey));
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} vertical={false} />

            <XAxis
              dataKey="displayLabel"
              stroke={axisStroke}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              minTickGap={25}
            />

            {/* Left YAxis: Anomaly Count */}
            {chartMode !== "reliability_line" && (
              <YAxis
                yAxisId="left"
                stroke={axisStroke}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                allowDecimals={false}
                label={{
                  value: "Anomalies",
                  angle: -90,
                  position: "insideLeft",
                  offset: 15,
                  fill: axisStroke,
                  fontSize: 10,
                }}
              />
            )}

            {/* Right YAxis: Reliability Rate (%) */}
            {(chartMode === "combined" || chartMode === "reliability_line") && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={reliabilityColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                domain={[minReliability, 100]}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: "Reliability (%)",
                  angle: 90,
                  position: "insideRight",
                  offset: 5,
                  fill: reliabilityColor,
                  fontSize: 10,
                }}
              />
            )}

            {/* 100% Baseline Reference Line */}
            {(chartMode === "combined" || chartMode === "reliability_line") && (
              <ReferenceLine
                yAxisId="right"
                y={100}
                stroke="#10b981"
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const b = payload[0].payload as BucketData;
                return (
                  <div
                    style={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                    }}
                    className="border p-3.5 rounded-xl shadow-2xl text-xs space-y-2 max-w-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#54416d] pb-1.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#8fe0ff]" />
                        <span>{b.displayLabel}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          b.reliabilityRate >= 98
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : b.reliabilityRate >= 95
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {b.reliabilityRate}% Uptime
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-mono">
                      {b.dateRange}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-200 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                        <span>High: <strong className="text-white font-mono">{b.highCount}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                        <span>Medium: <strong className="text-white font-mono">{b.mediumCount}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Normal: <strong className="text-white font-mono">{b.normalCount}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#8fe0ff]"></span>
                        <span>Total: <strong className="text-white font-mono">{b.totalCount}</strong></span>
                      </div>
                    </div>

                    {b.topTrigger && (
                      <div className="bg-[#2b235a]/80 p-2 rounded text-[11px] text-slate-200 border border-[#54416d]/80">
                        <span className="text-[#8fe0ff] font-semibold">Primary Trigger: </span>
                        {b.topTrigger}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-[#54416d]">
                      Click bar to expand incident breakdown
                    </div>
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
              formatter={(value) => <span className="text-slate-200 font-medium">{value}</span>}
            />

            {/* High Severity Bar */}
            {chartMode !== "reliability_line" && (
              <Bar
                yAxisId="left"
                dataKey="highCount"
                name="High Severity"
                stackId="anomalies"
                fill={highColor}
                radius={[0, 0, 0, 0]}
                maxBarSize={36}
              />
            )}

            {/* Medium Severity Bar */}
            {chartMode !== "reliability_line" && (
              <Bar
                yAxisId="left"
                dataKey="mediumCount"
                name="Medium Severity"
                stackId="anomalies"
                fill={mediumColor}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            )}

            {/* Reliability Rate Spline Line */}
            {(chartMode === "combined" || chartMode === "reliability_line") && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reliabilityRate"
                name="Reliability Rate (%)"
                stroke={reliabilityColor}
                strokeWidth={2.5}
                dot={{ r: 3, fill: reliabilityColor, strokeWidth: 1 }}
                activeDot={{ r: 6, fill: "#ffffff", stroke: reliabilityColor, strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Detail Box when a Bucket is Selected */}
      {selectedBucket && (
        <div
          id="selected-bucket-drilldown"
          className="bg-[#2b235a] border border-[#75b4e3]/40 rounded-xl p-4 text-xs space-y-3 transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#54416d] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8fe0ff]" />
              <span className="font-bold text-white text-sm">
                Incident Breakdown for {selectedBucket.displayLabel}
              </span>
              <span className="text-slate-300 font-mono text-xs">
                ({selectedBucket.dateRange})
              </span>
            </div>
            <button
              id="close-bucket-drilldown-btn"
              type="button"
              onClick={() => setSelectedBucketKey(null)}
              className="text-xs text-[#75b4e3] hover:text-white transition cursor-pointer self-start sm:self-auto"
            >
              Close Details ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#31255a] rounded-lg p-3 border border-[#54416d]">
              <span className="text-[#75b4e3] text-[11px] block">Period Summary</span>
              <div className="text-sm font-bold text-white mt-1">
                {selectedBucket.totalAnomalies} Anomalies / {selectedBucket.totalCount} Readings
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                {selectedBucket.reliabilityRate}% Data Fidelity
              </span>
            </div>

            <div className="bg-[#31255a] rounded-lg p-3 border border-[#54416d]">
              <span className="text-[#75b4e3] text-[11px] block">Severity Composition</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-rose-400 font-mono font-bold text-sm">
                  {selectedBucket.highCount} High
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-amber-400 font-mono font-bold text-sm">
                  {selectedBucket.mediumCount} Medium
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                {selectedBucket.normalCount} Valid observations
              </span>
            </div>

            <div className="bg-[#31255a] rounded-lg p-3 border border-[#54416d]">
              <span className="text-[#75b4e3] text-[11px] block">Dominant Sensor / Mechanism</span>
              <div className="text-sm font-semibold text-[#8fe0ff] mt-1 truncate">
                {selectedBucket.topTrigger || "Clean Operational Period"}
              </div>
              <span className="text-[11px] text-slate-300">
                {selectedBucket.topTrigger ? "Primary deviation source" : "All physical & ML bounds satisfied"}
              </span>
            </div>
          </div>

          {/* List of Anomalous Records in this bucket */}
          {selectedBucket.totalAnomalies > 0 ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-300">
                Anomalous Timestamp Events ({selectedBucket.totalAnomalies}):
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {selectedBucket.records
                  .filter((r) => r.anomaly)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectRecord?.(rec)}
                      className="bg-[#31255a] hover:bg-[#54416d] border border-[#54416d] rounded-lg px-3 py-2 flex items-center justify-between transition cursor-pointer"
                      title="Click to view detailed diagnostics"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rec.severity === "High" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                          }`}
                        ></span>
                        <span className="font-mono text-white font-medium">{rec.timestamp}</span>
                        <span className="text-[#75b4e3] truncate max-w-xs">{rec.explanation}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right shrink-0">
                        <span className="text-slate-300 font-mono">
                          {rec.temperature}°C / {rec.humidity}%
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.severity === "High"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {rec.severity}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-emerald-400 font-medium">
              ✓ No anomalous readings recorded in this window. System running at peak reliability.
            </div>
          )}
        </div>
      )}

      {/* Explanatory footer */}
      <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1">
        <span>
          Click any bar or period node to open interval drill-down and investigate individual anomalous telemetry timestamps.
        </span>
        <span className="font-mono text-[#75b4e3]">
          Formula: Reliability Index = (1 - Anomalies / Total Readings) × 100%
        </span>
      </div>
    </div>
  );
};
