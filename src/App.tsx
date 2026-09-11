import React, { useState, useMemo, useEffect } from "react";
import {
  WeatherRawRecord,
  WeatherProcessedRecord,
  PipelineExecutionStats,
  Severity,
  DetectionModel,
  AWSStationInfo,
  AppTheme,
} from "./types";
import { generateSyntheticWeatherData } from "./pipeline/generator";
import { executeWeatherGuardPipeline, exportToCSV } from "./pipeline/engine";
import { IMD_AWS_STATIONS } from "./pipeline/stations";

import { Header, AppTab } from "./components/Header";
import { StationSelectorBar } from "./components/StationSelectorBar";
import { MetricsCards } from "./components/MetricsCards";
import { SeverityChart } from "./components/SeverityChart";
import { AnomalyFrequencyChart } from "./components/AnomalyFrequencyChart";
import { TemperatureTrendChart } from "./components/TemperatureTrendChart";
import { AnomalyTimelineChart } from "./components/AnomalyTimelineChart";
import { AnomalyTable } from "./components/AnomalyTable";
import { PipelineFlowView } from "./components/PipelineFlowView";
import { FullDatasetTable } from "./components/FullDatasetTable";
import { CodeViewerModal } from "./components/CodeViewerModal";
import { AnomalySimulatorModal } from "./components/AnomalySimulatorModal";
import { RecordDetailDrawer } from "./components/RecordDetailDrawer";
import { ShapWaterfallModal } from "./components/ShapWaterfallModal";
import { IMDStationsView } from "./components/IMDStationsView";
import { WMOStandardsView } from "./components/WMOStandardsView";
import { PlotlyWeatherChart } from "./components/PlotlyWeatherChart";

import { SlidersHorizontal, ChevronDown, ChevronUp, Database, Sparkles, Cpu, Activity, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>("All");
  const [selectedRecord, setSelectedRecord] = useState<WeatherProcessedRecord | null>(null);
  const [shapModalRecord, setShapModalRecord] = useState<WeatherProcessedRecord | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>("data_cleaning.py");
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [currentStepLog, setCurrentStepLog] = useState<string>("");
  const [showFullDatasetExpander, setShowFullDatasetExpander] = useState<boolean>(false);

  // Theme state: "purple" (default) or "midnight" (high-contrast WCAG AAA)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem("weatherguard_theme");
      if (saved === "midnight" || saved === "purple") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "purple";
  });

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("weatherguard_theme", newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Active IMD Station & Detection Model
  const [selectedStation, setSelectedStation] = useState<AWSStationInfo>(IMD_AWS_STATIONS[0]);
  const [detectionModel, setDetectionModel] = useState<DetectionModel>("hybrid");

  // Raw dataset
  const [rawDataset, setRawDataset] = useState<WeatherRawRecord[]>(() => {
    return generateSyntheticWeatherData(3651);
  });

  // Pipeline execution results
  const [pipelineOutput, setPipelineOutput] = useState<{
    processed: WeatherProcessedRecord[];
    stats: PipelineExecutionStats;
  }>(() => {
    const initialRaw = generateSyntheticWeatherData(3651);
    return executeWeatherGuardPipeline(initialRaw, undefined, "hybrid");
  });

  const { processed, stats } = pipelineOutput;

  // Filter records by severity
  const filteredRecords = useMemo(() => {
    if (selectedSeverity === "All") {
      return processed;
    }
    return processed.filter((r) => r.severity === selectedSeverity);
  }, [processed, selectedSeverity]);

  // Re-run pipeline with step-by-step feedback
  const handleRunPipeline = (overrideModel?: DetectionModel) => {
    const modelToUse = overrideModel || detectionModel;
    setIsRunningPipeline(true);
    setCurrentStepLog("Starting WeatherGuard Pipeline...");

    setTimeout(() => {
      const result = executeWeatherGuardPipeline(
        rawDataset,
        (step, stepName) => {
          setCurrentStepLog(stepName);
        },
        modelToUse
      );
      setPipelineOutput(result);
      setIsRunningPipeline(false);
      setCurrentStepLog("Pipeline execution finished successfully.");
    }, 350);
  };

  // Switch Model
  const handleModelChange = (newModel: DetectionModel) => {
    setDetectionModel(newModel);
    handleRunPipeline(newModel);
  };

  // Switch Station
  const handleStationChange = (stn: AWSStationInfo) => {
    setSelectedStation(stn);
    // Regenerate data reflecting station baseline
    const newRaw = generateSyntheticWeatherData(3651);
    setRawDataset(newRaw);
    const result = executeWeatherGuardPipeline(newRaw, undefined, detectionModel);
    setPipelineOutput(result);
  };

  // Export results CSV
  const handleExportResults = () => {
    const csvContent = exportToCSV(filteredRecords);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WeatherGuard_${selectedStation.code}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Injected anomaly record
  const handleInjectRecord = (newRaw: WeatherRawRecord) => {
    const updatedRaw = [...rawDataset, newRaw];
    setRawDataset(updatedRaw);
    const result = executeWeatherGuardPipeline(updatedRaw, undefined, detectionModel);
    setPipelineOutput(result);
    // Auto select new record to inspect immediately
    const lastProcessed = result.processed[result.processed.length - 1];
    setSelectedRecord(lastProcessed);
  };

  const handleOpenCodeForStep = (filename: string) => {
    setSelectedCodeFile(filename);
    setActiveTab("code");
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-[#2b235a] text-slate-100 font-sans antialiased selection:bg-[#8fe0ff] selection:text-[#2b235a]"
    >
      
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunPipeline={() => handleRunPipeline()}
        onExportResults={handleExportResults}
        isRunning={isRunningPipeline}
        anomalyRate={stats.anomalyRate}
        selectedStationName={selectedStation.name}
        theme={theme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Sub-bar: Station Selector & Dual Model Switcher */}
      <StationSelectorBar
        selectedStation={selectedStation}
        onSelectStation={handleStationChange}
        detectionModel={detectionModel}
        onSelectModel={handleModelChange}
        anomalyRate={stats.anomalyRate}
        totalRecords={stats.totalRecords}
        latencyMs={stats.avgInferenceLatencyMs || 28}
      />

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Step log ticker if running */}
        {isRunningPipeline && (
          <div className="bg-[#31255a] border border-[#8fe0ff]/40 text-[#8fe0ff] text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
            <span className="font-mono">{currentStepLog}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#54416d] text-[#8fe0ff] px-2 py-0.5 rounded border border-[#75b4e3]/30">
              Executing Detection Pipeline
            </span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DASHBOARD VIEW (Streamlit & Plotly)            */}
        {/* ---------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Filter Header Bar */}
            <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <SlidersHorizontal className="w-4 h-4 text-[#8fe0ff]" />
                <span>Streamlit Sidebar Filter:</span>
                <span className="text-slate-300 font-normal">
                  Showing {filteredRecords.length.toLocaleString()} matching records
                </span>
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="severity-select" className="text-xs text-slate-300 font-medium">
                  Severity:
                </label>
                <div className="inline-flex rounded-lg p-0.5 bg-[#2b235a] border border-[#54416d] text-xs font-medium">
                  {(["All", "Normal", "Medium", "High"] as Severity[]).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-3 py-1 rounded-md transition ${
                        selectedSeverity === sev
                          ? sev === "High"
                            ? "bg-rose-600 text-white shadow-sm font-semibold"
                            : sev === "Medium"
                            ? "bg-amber-600 text-white shadow-sm font-semibold"
                            : sev === "Normal"
                            ? "bg-emerald-600 text-white shadow-sm font-semibold"
                            : "bg-[#75b4e3] text-[#2b235a] shadow-sm font-bold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics cards (Total, Anomalies, Normal, High Severity, Anomaly Rate) */}
            <MetricsCards stats={stats} />

            {/* Dual Model KPI Breakdown Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#54416d] border border-[#75b4e3]/40 flex items-center justify-center text-[#8fe0ff] shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[#75b4e3] text-xs block font-medium">Isolation Forest Model</span>
                  <strong className="text-white font-mono text-base font-bold">
                    {stats.mlOnlyAnomalies + stats.dualAnomalies} Flagged
                  </strong>
                  <span className="text-[11px] text-slate-300 block">Unsupervised hyperplanes</span>
                </div>
              </div>

              <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#54416d] border border-[#8fe0ff]/40 flex items-center justify-center text-[#8fe0ff] shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[#8fe0ff] text-xs block font-medium">Deep Autoencoder (MSE)</span>
                  <strong className="text-white font-mono text-base font-bold">
                    {stats.autoencoderAnomalies} Flagged
                  </strong>
                  <span className="text-[11px] text-slate-300 block">Sequence reconstruction loss</span>
                </div>
              </div>

              <div className="bg-[#31255a] border border-[#54416d] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#54416d] border border-[#75b4e3]/40 flex items-center justify-center text-[#75b4e3] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[#75b4e3] text-xs block font-medium">WMO-No. 8 & IMD Rules</span>
                  <strong className="text-white font-mono text-base font-bold">
                    {stats.ruleOnlyAnomalies + stats.dualAnomalies} Flagged
                  </strong>
                  <span className="text-[11px] text-slate-300 block">Physical bounds & 99th jump</span>
                </div>
              </div>
            </div>

            {/* Plotly Interactive Multi-Sensor & Loss Waveform */}
            <PlotlyWeatherChart
              records={filteredRecords}
              theme={theme}
              onSelectRecord={(rec) => {
                setSelectedRecord(rec);
                setShapModalRecord(rec);
              }}
            />

            {/* Severity distribution bar chart */}
            <SeverityChart records={processed} theme={theme} />

            {/* Anomaly frequency and system reliability over time */}
            <AnomalyFrequencyChart
              records={filteredRecords}
              theme={theme}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />

            {/* Temperature trend line chart */}
            <TemperatureTrendChart
              records={filteredRecords}
              theme={theme}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />

            {/* Anomaly timeline scatter plot */}
            <AnomalyTimelineChart
              records={filteredRecords}
              theme={theme}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />

            {/* Detected anomalies table */}
            <AnomalyTable
              records={filteredRecords}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />

            {/* Full dataset expander */}
            <div className="bg-[#31255a] border border-[#54416d] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowFullDatasetExpander(!showFullDatasetExpander)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#54416d]/30 transition"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#8fe0ff]" />
                  <span className="text-sm font-semibold text-white">
                    View Complete Dataset (3,651 Records)
                  </span>
                  <span className="text-xs text-[#75b4e3] font-mono">
                    (Streamlit st.expander)
                  </span>
                </div>
                {showFullDatasetExpander ? (
                  <ChevronUp className="w-4 h-4 text-[#8fe0ff]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8fe0ff]" />
                )}
              </button>

              {showFullDatasetExpander && (
                <div className="p-5 border-t border-[#54416d] bg-[#2b235a]">
                  <FullDatasetTable
                    records={filteredRecords}
                    onSelectRecord={(rec) => setSelectedRecord(rec)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: IMD STATIONS NETWORK (50 - 250+ AWS)          */}
        {/* ---------------------------------------------------- */}
        {activeTab === "stations" && (
          <IMDStationsView
            selectedStation={selectedStation}
            onSelectStation={handleStationChange}
            onSwitchToDashboard={() => setActiveTab("dashboard")}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: WMO-NO. 8 & IMD STANDARDS                     */}
        {/* ---------------------------------------------------- */}
        {activeTab === "wmo" && <WMOStandardsView />}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: ARCHITECTURAL PIPELINE FLOW VIEW              */}
        {/* ---------------------------------------------------- */}
        {activeTab === "pipeline" && (
          <PipelineFlowView
            stats={stats}
            onOpenCode={handleOpenCodeForStep}
            onRunPipeline={() => handleRunPipeline()}
            isRunning={isRunningPipeline}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: FULL DATASET BROWSER VIEW                     */}
        {/* ---------------------------------------------------- */}
        {activeTab === "dataset" && (
          <FullDatasetTable
            records={processed}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CODE & PYTHON SCRIPTS VIEWER                  */}
        {/* ---------------------------------------------------- */}
        {activeTab === "code" && (
          <CodeViewerModal initialFile={selectedCodeFile} />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: LIVE ANOMALY INJECTOR & TEST LAB              */}
        {/* ---------------------------------------------------- */}
        {activeTab === "simulator" && (
          <AnomalySimulatorModal
            onInjectRecord={handleInjectRecord}
            recentRecords={processed}
          />
        )}
      </main>

      {/* Record detail inspector drawer */}
      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onOpenShap={(rec) => setShapModalRecord(rec)}
      />

      {/* SHAP Feature Attribution Waterfall Modal */}
      <ShapWaterfallModal
        record={shapModalRecord}
        onClose={() => setShapModalRecord(null)}
      />
    </div>
  );
}
