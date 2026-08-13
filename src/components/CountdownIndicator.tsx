import React from 'react';
import { motion } from 'motion/react';
import { Clock, Zap, Flame, AlertTriangle, RotateCcw } from 'lucide-react';

interface CountdownIndicatorProps {
  timeRemaining: number; // in seconds (e.g., 58.4)
  totalTime?: number; // 60
  combo: number;
  multiplier: number;
  isMultiplierActive?: boolean;
  onQuickReplay?: () => void;
}

export const CountdownIndicator: React.FC<CountdownIndicatorProps> = ({
  timeRemaining,
  totalTime = 60,
  combo,
  multiplier,
  isMultiplierActive = false,
  onQuickReplay,
}) => {
  const roundedTime = Math.max(0, timeRemaining);
  const percent = Math.max(0, Math.min(100, (roundedTime / totalTime) * 100));

  // Circular calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const isUrgent = roundedTime <= 10 && roundedTime > 0;
  const isWarning = roundedTime <= 25 && roundedTime > 10;

  let ringColorClass = 'stroke-cyan-400';
  let textColorClass = 'text-cyan-300';
  let glowColorClass = 'shadow-cyan-500/20';

  if (isUrgent) {
    ringColorClass = 'stroke-rose-500';
    textColorClass = 'text-rose-400';
    glowColorClass = 'shadow-rose-500/50';
  } else if (isWarning) {
    ringColorClass = 'stroke-amber-400';
    textColorClass = 'text-amber-300';
    glowColorClass = 'shadow-amber-500/30';
  }

  return (
    <div className="flex items-center justify-between gap-3 w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl">
      {/* Time Circular Progress Widget */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full transition-all ${isUrgent ? 'animate-pulse scale-105' : ''}`}>
          {/* Urgent Glow Aura */}
          {isUrgent && (
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md animate-ping pointer-events-none" />
          )}

          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 108 108">
            {/* Background Track */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              className="stroke-slate-800 fill-none"
              strokeWidth="8"
            />
            {/* Dynamic Progress Ring */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              className={`fill-none transition-all duration-100 ease-linear ${ringColorClass}`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Central Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-base sm:text-xl font-black tracking-tighter ${textColorClass}`}>
              {roundedTime.toFixed(1)}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 -mt-1">
              SEC
            </span>
          </div>
        </div>

        {/* Time Text & Status */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-300">
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
            <span>Time Remaining</span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{Math.ceil(roundedTime)}s</span>
            {isUrgent && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full animate-bounce">
                <AlertTriangle className="w-3 h-3" /> INTENSE!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multiplier & Combo Gauges & Replay Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Replay / Reset Timer Button */}
        {onQuickReplay && (
          <button
            id="countdown-reset-timer-btn"
            onClick={onQuickReplay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Reset timer to 60s & restart game state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Combo Gauge */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak Combo</span>
          <div className="flex items-center gap-1 text-lg sm:text-2xl font-black text-amber-400">
            <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${combo >= 5 ? 'text-orange-500 animate-bounce' : 'text-amber-400'}`} />
            <span>{combo}x</span>
          </div>
        </div>

        {/* Multiplier Badge */}
        <div className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
          isMultiplierActive
            ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300 animate-pulse shadow-lg shadow-fuchsia-500/20'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Score Boost</span>
          <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            {multiplier.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
};
