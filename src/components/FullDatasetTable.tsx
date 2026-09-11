import React, { useState, useMemo } from "react";
import { WeatherProcessedRecord } from "../types";
import { Search, ChevronLeft, ChevronRight, FileDown, Filter } from "lucide-react";
import { exportToCSV } from "../pipeline/engine";

interface FullDatasetTableProps {
  records: WeatherProcessedRecord[];
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
}

export const FullDatasetTable: React.FC<FullDatasetTableProps> = ({
  records,
  onSelectRecord,
}) => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [stageFilter, setStageFilter] = useState<"all" | "anomalies_only" | "clean_only">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return records.filter((r) => {
      // Severity check
      if (severityFilter !== "All" && r.severity !== severityFilter) {
        return false;
      }
      // Stage / category check
      if (stageFilter === "anomalies_only" && !r.anomaly) {
        return false;
      }
      if (stageFilter === "clean_only" && r.anomaly) {
        return false;
      }
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.timestamp.toLowerCase().includes(q) ||
          r.explanation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, severityFilter, stageFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(filtered);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `anomaly_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Tooling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Complete Weather Observation Dataset
          </h2>
          <p className="text-xs text-slate-400">
            Viewing {filtered.length} of {records.length} records (Streamlit st.dataframe expander)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Severities</option>
            <option value="Normal">Normal Only</option>
            <option value="Medium">Medium Only</option>
            <option value="High">High Only</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-[500px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700 sticky top-0 z-10 backdrop-blur">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Temp (°C)</th>
              <th className="py-2.5 px-3">Humidity (%)</th>
              <th className="py-2.5 px-3">Pres (hPa)</th>
              <th className="py-2.5 px-3">Wind (km/h)</th>
              <th className="py-2.5 px-3">Temp Δ</th>
              <th className="py-2.5 px-3">5h Rolling Mean</th>
              <th className="py-2.5 px-3">ML Score</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Diagnosis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 text-xs">
                  No records matching criteria.
                </td>
              </tr>
            ) : (
              pageRecords.map((r, i) => {
                const isHigh = r.severity === "High";
                const isMed = r.severity === "Medium";
                return (
                  <tr
                    key={`full-row-${r.id}-${r.timestamp}`}
                    className={`hover:bg-slate-800/60 transition cursor-pointer ${
                      r.anomaly ? (isHigh ? "bg-rose-950/20" : "bg-amber-950/15") : ""
                    }`}
                    onClick={() => onSelectRecord?.(r)}
                  >
                    <td className="py-2 px-3 text-slate-500 font-mono">
                      {(currentPage - 1) * pageSize + i + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-200">
                      {r.timestamp}
                    </td>
                    <td className="py-2 px-3 font-mono">{r.temperature}°C</td>
                    <td className="py-2 px-3 font-mono">{r.humidity}%</td>
                    <td className="py-2 px-3 font-mono">{r.pressure}</td>
                    <td className="py-2 px-3 font-mono">{r.wind_speed}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {r.temp_change > 0 ? `+${r.temp_change}` : r.temp_change}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {r.temp_rolling_mean}
                    </td>
                    <td className="py-2 px-3 font-mono text-cyan-300">
                      {r.anomaly_score.toFixed(3)}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : isMed
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 max-w-xs truncate text-slate-400">
                      {r.explanation}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing records <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
          <strong className="text-slate-200">
            {Math.min(currentPage * pageSize, filtered.length)}
          </strong>{" "}
          of <strong className="text-slate-200">{filtered.length}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-300 px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
