import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Star, ShieldAlert, Clock, Zap, Ghost, X, Flame, Award, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
                GAME TUTORIAL
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                How To Play 60s Blitz
              </h2>
            </div>
            <button
              id="tutorial-close-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tutorial Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            {/* Core Goal */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Objective</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  You have exactly <span className="text-cyan-300 font-bold">60 Seconds</span> to tap glowing energy targets as fast as possible. Build long combo streaks to maximize your score!
                </p>
              </div>
            </div>

            {/* Target Legend */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Target Node Legend
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                    <Target className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Standard Node</div>
                    <div className="text-[11px] text-cyan-400 font-semibold">+100 Pts • Extends Streak</div>
                  </div>
                </div>

                {/* Golden */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border-2 border-yellow-300 flex items-center justify-center text-yellow-300 shrink-0">
                    <Star className="w-5 h-5 fill-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Golden Star</div>
                    <div className="text-[11px] text-amber-400 font-semibold">+250 Pts • Double Combo</div>
                  </div>
                </div>

                {/* Hazard */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Hazard Bomb</div>
                    <div className="text-[11px] text-rose-400 font-semibold">-150 Pts • Breaks Streak!</div>
                  </div>
                </div>

                {/* Time Bonus */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Time Clock</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">+3 Seconds to Timer!</div>
                  </div>
                </div>

                {/* Multiplier */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shrink-0">
                    <Zap className="w-5 h-5 fill-fuchsia-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Multiplier Bolt</div>
                    <div className="text-[11px] text-fuchsia-400 font-semibold">2x Score Boost (8s)</div>
                  </div>
                </div>

                {/* Decoy */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
                    <Ghost className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Decoy Ghost</div>
                    <div className="text-[11px] text-purple-400 font-semibold">Flickers & Shifts!</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Pro Gamer Tips</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Final 10-Second Countdown:</strong> The circular timer ring turns red and pulses as tense audio ticks speed up!</li>
                <li><strong className="text-white">Combo Multipliers:</strong> Each consecutive hit increases audio pitch and score multipliers up to 10x!</li>
                <li><strong className="text-white">Difficulty Bonus:</strong> Hard & Insane modes feature moving targets and yield up to 3.0x score multipliers!</li>
              </ul>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-800">
            <button
              id="tutorial-confirm-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Understood! Let's Blitz
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
