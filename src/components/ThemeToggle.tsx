import React from "react";
import { Contrast, Sparkles } from "lucide-react";
import { AppTheme } from "../types";

interface ThemeToggleProps {
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onSelectTheme }) => {
  return (
    <div
      id="theme-toggle-group"
      className="inline-flex items-center p-0.5 rounded-lg bg-[#2b235a] border border-[#54416d] text-xs shadow-sm"
      role="radiogroup"
      aria-label="Color Theme Selection"
    >
      <button
        id="theme-btn-purple"
        type="button"
        role="radio"
        aria-checked={theme === "purple"}
        onClick={() => onSelectTheme("purple")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
          theme === "purple"
            ? "bg-[#54416d] text-white font-bold shadow-sm ring-1 ring-[#8fe0ff]/50"
            : "text-slate-300 hover:text-white"
        }`}
        title="Switch to Deep Purple Theme"
      >
        <span className="w-2 h-2 rounded-full bg-[#8fe0ff] shadow-sm"></span>
        <span>Deep Purple</span>
      </button>

      <button
        id="theme-btn-midnight"
        type="button"
        role="radio"
        aria-checked={theme === "midnight"}
        onClick={() => onSelectTheme("midnight")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
          theme === "midnight"
            ? "bg-[#38bdf8] text-[#090d16] font-bold shadow-sm ring-1 ring-white/60"
            : "text-slate-300 hover:text-white"
        }`}
        title="Switch to High-Contrast Midnight Theme (WCAG AAA Accessible)"
      >
        <Contrast className="w-3.5 h-3.5" />
        <span>Midnight</span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-black/25 font-mono font-bold tracking-tight">
          AAA
        </span>
      </button>
    </div>
  );
};
