import React, { useState } from "react";
import { AWSStationInfo } from "../types";
import { IMD_AWS_STATIONS } from "../pipeline/stations";
import { MapPin, Radio, Shield, Search, Filter, Cpu, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

interface IMDStationsViewProps {
  selectedStation: AWSStationInfo;
  onSelectStation: (station: AWSStationInfo) => void;
  onSwitchToDashboard: () => void;
}

export const IMDStationsView: React.FC<IMDStationsViewProps> = ({
  selectedStation,
  onSelectStation,
  onSwitchToDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("All");

  const regions = ["All", "North", "South", "East", "West", "Northeast", "Himalayan"];

  const filteredStations = IMD_AWS_STATIONS.filter((stn) => {
    const matchesSearch =
      stn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stn.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stn.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stn.wmoStationId.includes(searchTerm);

    const matchesRegion = regionFilter === "All" || stn.region === regionFilter;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                AWS Architecture
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Scalable Network Coverage
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>🇮🇳</span> IMD Automatic Weather Station Network
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Designed to scale from <strong>50 pilot stations up to 250+ automatic weather stations</strong> across diverse agro-climatic and disaster-prone zones of India (Himalayan, Coastal, Desert, Tropical Rainforest).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Target Network Scale</span>
              <strong className="text-cyan-300 text-lg font-bold">250+ AWS</strong>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-400 block text-[10px]">Active Pilot Stations</span>
              <strong className="text-emerald-400 text-lg font-bold">10 Tested</strong>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station, state, or WMO ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  regionFilter === reg
                    ? "bg-cyan-600 text-white font-semibold shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map((station) => {
          const isSelected = selectedStation.id === station.id;

          return (
            <div
              key={station.id}
              className={`rounded-xl border p-5 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                  : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
              }`}
              onClick={() => onSelectStation(station)}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold block">
                      WMO #{station.wmoStationId} • {station.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{station.name}</h3>
                    <p className="text-xs text-slate-400">{station.state} ({station.region} Zone)</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      station.status === "Online"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    {station.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-slate-950/60 rounded-lg text-[11px] border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Coordinates:</span>
                    <strong className="text-slate-300 font-mono">
                      {station.latitude.toFixed(2)}°N, {station.longitude.toFixed(2)}°E
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Elevation:</span>
                    <strong className="text-slate-300">{station.elevationM} meters</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Baseline Temp:</span>
                    <strong className="text-slate-300">{station.baselineTemp}°C</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nominal RH:</span>
                    <strong className="text-slate-300">{station.baselineHumidity}%</strong>
                  </div>
                </div>

                {/* Active Sensors */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                    Configured Sensors:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {station.activeSensors.map((sensor, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60"
                      >
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {isSelected ? (
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Currently Monitoring
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 group-hover:text-slate-200">
                    Click to monitor station
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStation(station);
                    onSwitchToDashboard();
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  <span>Launch Live Stream</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
