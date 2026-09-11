import React, { useState } from "react";
import {
  FileText,
  Filter,
  CheckCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowDown,
  LayoutDashboard,
  Check,
  ChevronRight,
  Code2,
} from "lucide-react";
import { PipelineExecutionStats } from "../types";

interface PipelineFlowViewProps {
  stats: PipelineExecutionStats;
  onOpenCode: (filename: string) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
}

export const PipelineFlowView: React.FC<PipelineFlowViewProps> = ({
  stats,
  onOpenCode,
  onRunPipeline,
  isRunning,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: "Data Ingestion & Cleaning",
      script: "data_cleaning.py",
      outputFile: "cleaned_weather.csv",
      icon: Filter,
      color: "from-blue-500 to-cyan-500",
      description:
        "Ingests weather_2021_2025.csv, normalizes column names, replaces invalid flags ('-999', 'NA', null), imputes missing numeric values with running median, removes duplicate timestamps, and enforces chronological sorting.",
      highlights: [
        "Replaces -999, -9999, NA markers with median",
        "Cleans and lowercases column headers",
        "Eliminates duplicate station transmission bursts",
        "Chronological time-series verification",
      ],
      metric: `${stats.totalRecords.toLocaleString()} cleaned rows`,
    },
    {
      step: 2,
      title: "Physical Bounds Validation",
      script: "validation.py",
      outputFile: "validated_weather.csv",
      icon: CheckCircle,
      color: "from-cyan-500 to-teal-500",
      description:
        "Verifies physical meteorological limits: temperature (-60°C to +60°C), relative humidity (0% to 100%), barometric pressure (800 hPa to 1100 hPa), and wind speed (0 km/h to 100 km/h). Computes validation_error_count.",
      highlights: [
        "Temp: -60°C ≤ T ≤ +60°C bounds check",
        "RH: 0% ≤ RH ≤ 100% bounds check",
        "Pressure: 800 hPa ≤ P ≤ 1100 hPa",
        "Wind speed: 0 km/h ≤ W ≤ 100 km/h",
      ],
      metric: "4 Physical checks",
    },
    {
      step: 3,
      title: "Feature Engineering",
      script: "feature_engineering.py",
      outputFile: "features_weather.csv",
      icon: Layers,
      color: "from-teal-500 to-emerald-500",
      description:
        "Extracts 1-step lag differentials (temp_change, humidity_change, pressure_change, wind_change), computes 5-period rolling mean and standard deviation, extracts diurnal hour/day/month features, and calculates temp_humidity_ratio.",
      highlights: [
        "1-hour diff() differentials on all metrics",
        "5-period rolling mean & rolling std",
        "Diurnal hour & seasonal month cyclics",
        "Temperature-humidity cross-ratio feature",
      ],
      metric: "+12 Engineered features",
    },
    {
      step: 4,
      title: "Statistical & Domain Rules",
      script: "rules.py",
      outputFile: "Hybrid branch",
      icon: Cpu,
      color: "from-amber-500 to-orange-500",
      description:
        "Applies strict domain checks plus a 99th percentile rapid jump rule across temperature, humidity, pressure, and wind deltas. Aggregates into rule_count and rule_anomaly.",
      highlights: [
        "99th percentile sudden jump delta trigger",
        "Sensory spikes and physical violation counters",
        "Deterministic explainability without black box",
      ],
      metric: `${stats.ruleOnlyAnomalies + stats.dualAnomalies} Rule triggers`,
    },
    {
      step: 5,
      title: "Isolation Forest ML Model",
      script: "anomaly_model.py",
      outputFile: "isolation_forest.pkl",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
      description:
        "Trains an unsupervised Isolation Forest with 200 estimators and 1% contamination rate over standard-scaled multi-variable feature vectors. Computes anomaly_score and flags ml_anomaly.",
      highlights: [
        "StandardScaler feature normalization",
        "Unsupervised ensemble of isolation decision trees",
        "Multivariate clash detection (e.g. 38°C with 98% RH)",
        "Continuous anomaly_score ranking",
      ],
      metric: `${stats.mlOnlyAnomalies + stats.dualAnomalies} ML anomalies`,
    },
    {
      step: 6,
      title: "Hybrid Decision & Severity",
      script: "pipeline.py",
      outputFile: "anomaly_results.csv",
      icon: FileText,
      color: "from-rose-500 to-pink-500",
      description:
        "Merges Rule-based and ML-based classifications with boolean OR. Classifies severity into High (rule_count ≥ 2 or ML score > 0.15), Medium (single rule or ML anomaly), and Normal.",
      highlights: [
        "Hybrid OR combination (No single point of failure)",
        "Severity tiering: High / Medium / Normal",
        "Explanations generated via explanation.py",
      ],
      metric: `${stats.totalAnomalies} Flagged (${stats.anomalyRate.toFixed(2)}%)`,
    },
    {
      step: 7,
      title: "Dashboard UI & Real-Time Analytics",
      script: "app.py",
      outputFile: "Streamlit UI (Port 8501)",
      icon: LayoutDashboard,
      color: "from-cyan-600 to-blue-600",
      description:
        "Interactive dashboard visualizing severity distributions, temperature trends, scatter timeline of anomaly scores, and detailed inspection table with human-readable natural language explanations.",
      highlights: [
        "Interactive Plotly & Recharts scatter timeline",
        "Severity distribution bar charts",
        "Natural language human-readable explanations",
        "Exportable anomaly_results.csv reports",
      ],
      metric: "Live Dashboard View",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
                System Architecture
              </span>
              <span className="text-xs text-slate-400">10-Step Sequential Pipeline</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              WeatherGuard End-to-End Processing Architecture
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              From raw weather station sensor streams to physical bounds validation, statistical rolling features, domain rules, unsupervised Isolation Forest ML, and human-readable natural language diagnostic explanations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {isRunning ? "Executing Pipeline..." : "Re-execute Full Pipeline"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step list & pipeline graph */}
        <div className="lg:col-span-7 space-y-3">
          {steps.map((s, idx) => {
            const isSelected = selectedStep === s.step;
            const Icon = s.icon;
            return (
              <div key={`step-${s.step}`}>
                <div
                  onClick={() => setSelectedStep(s.step)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400">Step {s.step}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="font-mono text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {s.script}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 mt-0.5">{s.title}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60 block">
                        {s.metric}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        ➔ {s.outputFile}
                      </span>
                    </div>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-1.5">
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Deep Step Diagnostic Inspector */}
        <div className="lg:col-span-5">
          {(() => {
            const cur = steps.find((s) => s.step === selectedStep) || steps[0];
            const Icon = cur.icon;
            return (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm sticky top-24 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cur.color} flex items-center justify-center text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        Step {cur.step} Inspector
                      </span>
                      <h3 className="text-sm font-bold text-slate-200">{cur.title}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCode(cur.script)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 transition"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>View {cur.script}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">Functional Responsibility:</h4>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                    {cur.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Key Pipeline Transformations:</h4>
                  <ul className="space-y-2">
                    {cur.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Output Artifact:</span>
                  <span className="font-mono text-cyan-300 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {cur.outputFile}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
