import React from "react";
import { WeatherProcessedRecord } from "../types";
import { X, HelpCircle, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

interface ShapWaterfallModalProps {
  record: WeatherProcessedRecord | null;
  onClose: () => void;
}

export const ShapWaterfallModal: React.FC<ShapWaterfallModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const attributions = record.shap_attributions || [];
  const topDrivers = attributions.filter((a) => a.direction === "anomaly");
  const baselineContribution = -0.25; // standard nominal baseline center

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2b235a] border border-[#54416d] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#54416d] flex items-center justify-between bg-[#2b235a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#31255a] border border-[#75b4e3]/30 flex items-center justify-center text-[#8fe0ff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  SHAP Interpretability & Feature Attribution
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#31255a] text-[#8fe0ff] border border-[#75b4e3]/40">
                  Shapley Additive exPlanations
                </span>
              </div>
              <p className="text-xs text-[#75b4e3]">
                Transparent breakdown of marginal feature impacts (ML Interpretability Core)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#54416d] transition border border-[#54416d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          
          {/* Record Summary Banner */}
          <div className="p-4 rounded-xl bg-[#31255a] border border-[#54416d] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[#75b4e3] block text-[11px]">Observation Timestamp</span>
              <strong className="text-white font-mono text-sm">{record.timestamp}</strong>
            </div>
            <div>
              <span className="text-[#75b4e3] block text-[11px]">Hybrid Decision</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-xs ${
                  record.anomaly
                    ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                    : "bg-[#2b235a] text-[#8fe0ff] border border-[#75b4e3]/40"
                }`}
              >
                {record.anomaly ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                {record.anomaly ? `ANOMALY (${record.severity})` : "NOMINAL OBSERVATION"}
              </span>
            </div>
            <div>
              <span className="text-[#75b4e3] block text-[11px]">Isolation Forest Score</span>
              <strong className={`font-mono text-sm ${record.anomaly_score > 0 ? "text-rose-400" : "text-[#8fe0ff]"}`}>
                {record.anomaly_score > 0 ? `+${record.anomaly_score}` : record.anomaly_score}
              </strong>
            </div>
            <div>
              <span className="text-[#75b4e3] block text-[11px]">Autoencoder Loss (MSE)</span>
              <strong className="font-mono text-sm text-[#8fe0ff]">
                {record.autoencoder_loss}
              </strong>
            </div>
          </div>

          {/* Natural Language Diagnosis */}
          <div className="bg-[#31255a]/70 rounded-xl p-4 border border-[#54416d]">
            <h4 className="text-white font-semibold mb-1 flex items-center gap-1.5 text-xs">
              <span>🩺</span> Automated Diagnostic Explanation:
            </h4>
            <p className="text-slate-200 text-xs leading-relaxed italic">
              "{record.explanation}"
            </p>
          </div>

          {/* SHAP Waterfall Attribution Bars */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-xs flex items-center gap-1.5">
                <span>📊</span> Feature Marginal Contribution (Waterfall):
              </h4>
              <span className="text-[#75b4e3] text-[11px]">
                Red = Pushes toward Anomaly | Sky Blue = Pulls toward Normal
              </span>
            </div>

            <div className="space-y-2.5 bg-[#31255a] p-4 rounded-xl border border-[#54416d]">
              {attributions.slice(0, 7).map((attr, idx) => {
                const isAnomalyDriver = attr.attribution > 0;
                const percentWidth = Math.min(100, Math.abs(attr.attribution) * 120);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {isAnomalyDriver ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#8fe0ff]" />
                        )}
                        <span className="font-medium text-white">{attr.displayName}</span>
                        <span className="text-[#75b4e3] font-mono text-[11px]">
                          (val: {typeof attr.value === "number" ? attr.value.toFixed(1) : attr.value})
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isAnomalyDriver ? "text-rose-400" : "text-[#8fe0ff]"
                        }`}
                      >
                        {isAnomalyDriver ? `+${attr.attribution.toFixed(3)}` : attr.attribution.toFixed(3)}
                      </span>
                    </div>

                    <div className="w-full bg-[#2b235a] rounded-full h-2 overflow-hidden flex border border-[#54416d]">
                      {isAnomalyDriver ? (
                        <div
                          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentWidth}%` }}
                        />
                      ) : (
                        <div
                          className="bg-gradient-to-r from-[#75b4e3] to-[#8fe0ff] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Research Context from Presentation Slide 4 */}
          <div className="bg-[#31255a]/60 rounded-xl p-3.5 border border-[#54416d] text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-white">Why Interpretability Matters (Slide 2 & 4):</strong> Weather forecasters and disaster managers cannot rely on opaque black-box models. SHAP feature attributions calculate the Shapley game-theoretic value of each sensor variable, proving whether an anomaly was caused by sensor failure (sudden jump) or severe meteorological distress (cyclonic pressure drop).
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#54416d] bg-[#2b235a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#31255a] hover:bg-[#54416d] text-white text-xs font-semibold border border-[#54416d] transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
