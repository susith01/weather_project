import React from "react";
import { Database, AlertTriangle, CheckCircle2, ShieldAlert, Activity } from "lucide-react";
import { PipelineExecutionStats } from "../types";

interface MetricsCardsProps {
  stats: PipelineExecutionStats;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* Total Records */}
      <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-4 shadow-sm hover:border-[#75b4e3]/60 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#75b4e3]">Total Records</span>
          <Database className="w-4 h-4 text-[#8fe0ff]" />
        </div>
        <div className="mt-2 text-2xl font-bold text-white font-mono">
          {stats.totalRecords.toLocaleString()}
        </div>
        <p className="mt-1 text-[11px] text-slate-300">
          Hourly AWS station data
        </p>
      </div>

      {/* Anomalies */}
      <div className="bg-[#31255a] border border-amber-500/30 rounded-xl p-4 shadow-sm hover:border-amber-400/60 transition bg-gradient-to-br from-[#31255a] to-[#54416d]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-300">Anomalies</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-300 font-mono">
          {stats.totalAnomalies.toLocaleString()}
        </div>
        <p className="mt-1 text-[11px] text-amber-300/80 font-medium">
          Rule OR ML detected
        </p>
      </div>

      {/* Normal */}
      <div className="bg-[#31255a] border border-emerald-500/30 rounded-xl p-4 shadow-sm hover:border-emerald-400/60 transition bg-gradient-to-br from-[#31255a] to-[#54416d]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-300">Normal</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-300 font-mono">
          {stats.totalNormal.toLocaleString()}
        </div>
        <p className="mt-1 text-[11px] text-emerald-300/80 font-medium">
          Clean observations
        </p>
      </div>

      {/* High Severity */}
      <div className="bg-[#31255a] border border-rose-500/30 rounded-xl p-4 shadow-sm hover:border-rose-400/60 transition bg-gradient-to-br from-[#31255a] to-[#54416d]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-rose-300">High Severity</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-rose-400 font-mono">
          {stats.highSeverityCount.toLocaleString()}
        </div>
        <p className="mt-1 text-[11px] text-rose-300/80 font-medium">
          Critical alert flag
        </p>
      </div>

      {/* Anomaly Rate */}
      <div className="col-span-2 md:col-span-1 bg-[#31255a] border border-[#54416d] rounded-xl p-4 shadow-sm hover:border-[#8fe0ff]/60 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#75b4e3]">Anomaly Rate</span>
          <Activity className="w-4 h-4 text-[#8fe0ff]" />
        </div>
        <div className="mt-2 text-2xl font-bold text-[#8fe0ff] font-mono">
          {stats.anomalyRate.toFixed(2)}%
        </div>
        <p className="mt-1 text-[11px] text-slate-300">
          {stats.dualAnomalies} confirmed by both
        </p>
      </div>
    </div>
  );
};
