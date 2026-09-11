import React from "react";
import { CloudLightning, Play, RefreshCw, FileSpreadsheet, Code2, ShieldAlert, Sparkles } from "lucide-react";
import { AppTheme } from "../types";
import { ThemeToggle } from "./ThemeToggle";

export type AppTab = "dashboard" | "stations" | "wmo" | "pipeline" | "dataset" | "code" | "simulator";

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onRunPipeline: () => void;
  onExportResults: () => void;
  isRunning: boolean;
  anomalyRate: number;
  selectedStationName: string;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  onExportResults,
  isRunning,
  anomalyRate,
  selectedStationName,
  theme,
  onSelectTheme,
}) => {
  return (
    <header className="bg-[#31255a] border-b border-[#54416d] text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#54416d] via-[#75b4e3] to-[#8fe0ff] flex items-center justify-center shadow-lg shadow-[#8fe0ff]/15 text-[#2b235a] shrink-0">
              <CloudLightning className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>🌦️</span> WeatherGuard
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#2b235a] text-[#8fe0ff] border border-[#75b4e3]/40">
                  AWS Anomaly Detection
                </span>
              </div>
              <p className="text-xs text-[#75b4e3] font-medium">
                AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations (Disaster Management & Smart Automation)
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Theme Toggle Button */}
            <ThemeToggle theme={theme} onSelectTheme={onSelectTheme} />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2b235a] border border-[#54416d] text-xs">
              <div className="w-2 h-2 rounded-full bg-[#8fe0ff] animate-pulse"></div>
              <span className="text-slate-200 truncate max-w-[140px] font-medium">{selectedStationName}</span>
              <span className="text-[#54416d]">|</span>
              <span className="text-slate-300">Anomaly Rate:</span>
              <span className="font-semibold text-[#8fe0ff]">{anomalyRate.toFixed(2)}%</span>
            </div>

            <button
              id="export-csv-btn"
              onClick={onExportResults}
              title="Export anomaly_results.csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b235a] hover:bg-[#54416d] text-slate-200 text-xs font-medium border border-[#54416d] transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#75b4e3]" />
              <span>Export CSV</span>
            </button>

            <button
              id="run-pipeline-btn"
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${
                isRunning
                  ? "bg-[#54416d] text-slate-300 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#75b4e3] to-[#8fe0ff] hover:from-[#8fe0ff] hover:to-[#75b4e3] text-[#2b235a] shadow-[#8fe0ff]/20 active:scale-95"
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inferring...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-[#54416d] pt-1 -mb-px overflow-x-auto text-xs">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <span>📊</span> Dashboard UI (Plotly & Streamlit)
          </button>

          <button
            id="tab-stations"
            onClick={() => setActiveTab("stations")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "stations"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <span>🇮🇳</span> IMD Stations Network (50-250+ AWS)
          </button>

          <button
            id="tab-wmo"
            onClick={() => setActiveTab("wmo")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "wmo"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <span>📜</span> WMO-No. 8 & IMD Standards
          </button>

          <button
            id="tab-pipeline"
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "pipeline"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#75b4e3]" />
            <span>Architecture & Pipeline Flow</span>
          </button>

          <button
            id="tab-dataset"
            onClick={() => setActiveTab("dataset")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "dataset"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#75b4e3]" />
            <span>Full Dataset (3,651 Records)</span>
          </button>

          <button
            id="tab-code"
            onClick={() => setActiveTab("code")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "code"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#8fe0ff]" />
            <span>FastAPI, PyTorch & Docker</span>
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "border-[#8fe0ff] text-[#8fe0ff] font-bold"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8fe0ff]" />
            <span>Edge-Case Anomaly Injector</span>
          </button>
        </div>
      </div>
    </header>
  );
};
