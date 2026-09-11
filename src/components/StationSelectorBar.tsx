import React from "react";
import { AWSStationInfo, DetectionModel } from "../types";
import { IMD_AWS_STATIONS } from "../pipeline/stations";
import { MapPin, Radio, Shield, Cpu, Activity, Info, Sliders } from "lucide-react";

interface StationSelectorBarProps {
  selectedStation: AWSStationInfo;
  onSelectStation: (station: AWSStationInfo) => void;
  detectionModel: DetectionModel;
  onSelectModel: (model: DetectionModel) => void;
  anomalyRate: number;
  totalRecords: number;
  latencyMs: number;
}

export const StationSelectorBar: React.FC<StationSelectorBarProps> = ({
  selectedStation,
  onSelectStation,
  detectionModel,
  onSelectModel,
  anomalyRate,
  totalRecords,
  latencyMs,
}) => {
  return (
    <div className="bg-[#31255a]/95 border-b border-[#54416d] text-slate-200 px-4 py-2.5 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
        
        {/* Left: Station Dropdown & Geo Specs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#2b235a] px-2.5 py-1.5 rounded-md border border-[#54416d]">
            <MapPin className="w-3.5 h-3.5 text-[#8fe0ff] shrink-0" />
            <span className="text-[#75b4e3] font-medium">IMD Station:</span>
            <select
              id="station-selector-dropdown"
              value={selectedStation.id}
              onChange={(e) => {
                const found = IMD_AWS_STATIONS.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-2 text-xs"
            >
              {IMD_AWS_STATIONS.map((stn) => (
                <option key={stn.id} value={stn.id} className="bg-[#31255a] text-slate-100">
                  {stn.name} ({stn.state}) — WMO: {stn.wmoStationId}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="px-2 py-0.5 rounded bg-[#2b235a] text-[11px] border border-[#54416d] font-mono text-slate-200">
              {selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E
            </span>
            <span className="px-2 py-0.5 rounded bg-[#2b235a] text-[11px] border border-[#54416d] text-slate-200">
              Alt: {selectedStation.elevationM}m
            </span>
            <span className="inline-flex items-center gap-1 text-[#8fe0ff] text-[11px] font-semibold">
              <Radio className="w-3 h-3 animate-pulse text-[#8fe0ff]" />
              {selectedStation.status}
            </span>
          </div>
        </div>

        {/* Center & Right: Model Switcher & Real-time Telemetry Metrics */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Active Model Toggle */}
          <div className="flex items-center bg-[#2b235a] p-0.5 rounded-lg border border-[#54416d]">
            <button
              id="model-btn-hybrid"
              onClick={() => onSelectModel("hybrid")}
              title="Hybrid Model: Combines WMO/IMD Rules, Isolation Forest, and Deep Autoencoder"
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                detectionModel === "hybrid"
                  ? "bg-gradient-to-r from-[#75b4e3] to-[#8fe0ff] text-[#2b235a] shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Shield className="w-3 h-3 text-current" />
              <span>Hybrid Engine</span>
            </button>

            <button
              id="model-btn-iforest"
              onClick={() => onSelectModel("isolation_forest")}
              title="Primary Unsupervised ML: Isolation Forest (Liu et al. 2008)"
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                detectionModel === "isolation_forest"
                  ? "bg-gradient-to-r from-[#75b4e3] to-[#8fe0ff] text-[#2b235a] shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Cpu className="w-3 h-3 text-current" />
              <span>Isolation Forest</span>
            </button>

            <button
              id="model-btn-autoencoder"
              onClick={() => onSelectModel("autoencoder")}
              title="Advanced Model: Deep Autoencoder Sequence Reconstruction Loss"
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                detectionModel === "autoencoder"
                  ? "bg-gradient-to-r from-[#75b4e3] to-[#8fe0ff] text-[#2b235a] shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Activity className="w-3 h-3 text-current" />
              <span>Deep Autoencoder</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] text-slate-300 border-l border-[#54416d] pl-3">
            <span>
              Latency: <strong className="text-[#8fe0ff]">{latencyMs}ms</strong>
            </span>
            <span>
              Rate: <strong className="text-amber-300 font-semibold">{anomalyRate.toFixed(2)}%</strong>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
