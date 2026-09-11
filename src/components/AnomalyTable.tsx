import React, { useState, useMemo } from "react";
import { WeatherProcessedRecord } from "../types";
import { Search, ChevronLeft, ChevronRight, Eye, ShieldAlert, ArrowUpDown } from "lucide-react";

interface AnomalyTableProps {
  records: WeatherProcessedRecord[];
  onSelectRecord?: (record: WeatherProcessedRecord) => void;
}

export const AnomalyTable: React.FC<AnomalyTableProps> = ({
  records,
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof WeatherProcessedRecord>("timestamp");
  const [sortAsc, setSortAsc] = useState(false); // Newest first by default
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter only anomalies
  const anomalyRecords = useMemo(() => {
    return records.filter((r) => r.anomaly);
  }, [records]);

  // Search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return anomalyRecords;
    const q = searchQuery.toLowerCase();
    return anomalyRecords.filter(
      (r) =>
        r.timestamp.toLowerCase().includes(q) ||
        r.explanation.toLowerCase().includes(q) ||
        r.severity.toLowerCase().includes(q)
    );
  }, [anomalyRecords, searchQuery]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortField, sortAsc]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRecords = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof WeatherProcessedRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-5 shadow-sm">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#8fe0ff]" />
            <span>Detected Anomalies</span>
          </h2>
          <p className="text-xs text-[#75b4e3]">
            {filtered.length} anomaly records matching criteria
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#75b4e3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="anomaly-search-input"
            type="text"
            placeholder="Search timestamp, explanation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[#2b235a] border border-[#54416d] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#8fe0ff]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#54416d] rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#2b235a] text-[#75b4e3] font-semibold border-b border-[#54416d]">
            <tr>
              <th
                onClick={() => handleSort("timestamp")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("temperature")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Temp (°C)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("humidity")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Humidity (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("pressure")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Pres (hPa)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("wind_speed")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Wind (km/h)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("anomaly_score")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>ML Score</span>
                  <ArrowUpDown className="w-3 h-3 text-[#75b4e3]" />
                </div>
              </th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Explanation</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#54416d] text-slate-200">
            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No matching anomalies found.
                </td>
              </tr>
            ) : (
              pageRecords.map((r) => {
                const isHigh = r.severity === "High";
                return (
                  <tr
                    key={`row-${r.id}-${r.timestamp}`}
                    className="hover:bg-[#2b235a]/70 transition cursor-pointer"
                    onClick={() => onSelectRecord?.(r)}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-white">
                      {r.timestamp}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono ${
                        r.rule_temperature ? "text-rose-400 font-bold" : "text-slate-200"
                      }`}
                    >
                      {r.temperature}°C
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono ${
                        r.rule_humidity ? "text-rose-400 font-bold" : "text-slate-200"
                      }`}
                    >
                      {r.humidity}%
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono ${
                        r.rule_pressure ? "text-rose-400 font-bold" : "text-slate-200"
                      }`}
                    >
                      {r.pressure}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono ${
                        r.rule_wind ? "text-rose-400 font-bold" : "text-slate-200"
                      }`}
                    >
                      {r.wind_speed}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#8fe0ff]">
                      {r.anomaly_score.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-300 font-normal">
                      {r.explanation}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord?.(r);
                        }}
                        className="p-1 rounded hover:bg-[#54416d] text-slate-300 hover:text-[#8fe0ff] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-[#75b4e3]">
        <div>
          Showing page <strong className="text-white">{currentPage}</strong> of{" "}
          <strong className="text-white">{totalPages}</strong> ({sorted.length} total anomalies)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#54416d] bg-[#2b235a] hover:bg-[#54416d] disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#54416d] bg-[#2b235a] hover:bg-[#54416d] disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
