import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Target, Flame, Zap, Award, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { DifficultyLevel, LeaderboardEntry } from '../types';
import { DIFFICULTY_PRESETS } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  hits: number;
  misses: number;
  maxCombo: number;
  difficulty: DifficultyLevel;
  playerName: string;
  avatar: string;
  rank: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  hits,
  misses,
  maxCombo,
  difficulty,
  playerName,
  avatar,
  rank,
  isNewHighScore,
  onPlayAgain,
  onChangeDifficulty,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playGameOver();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAttempts = hits + misses;
  const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
  const diffConfig = DIFFICULTY_PRESETS[difficulty];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center space-y-6"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* New High Score Badge */}
          {isNewHighScore && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase animate-bounce">
              <Trophy className="w-4 h-4 text-amber-400" />
              NEW PERSONAL HIGH SCORE!
            </div>
          )}

          {/* Player Badge */}
          <div className="space-y-2">
            <div className="text-4xl">{avatar}</div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {playerName}'s Blitz Complete!
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full border font-bold uppercase ${diffConfig.badgeColor}`}>
                {diffConfig.name} ({diffConfig.multiplier}x)
              </span>
              <span className="text-slate-400 font-semibold">• Local Rank #{rank}</span>
            </div>
          </div>

          {/* Score Counter */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Final Score
            </div>
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight">
              {score.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Base points multiplied by {diffConfig.multiplier}x mode difficulty
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Accuracy
              </div>
              <div className="text-lg font-black text-slate-100">{accuracy}%</div>
              <div className="text-[10px] text-slate-500">{hits} Hits / {misses} Miss</div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Max Streak
              </div>
              <div className="text-lg font-black text-amber-400">{maxCombo}x</div>
              <div className="text-[10px] text-slate-500">Best Combo</div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> Rank
              </div>
              <div className="text-lg font-black text-indigo-300">#{rank}</div>
              <div className="text-[10px] text-slate-500">Leaderboard</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="gameover-play-again-btn"
              onClick={() => {
                soundManager.playGameStart();
                onPlayAgain();
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white font-extrabold text-base tracking-wider uppercase shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Play Again (60s)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onChangeDifficulty}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-4 h-4 text-cyan-400" /> Change Difficulty
              </button>
              <button
                onClick={onOpenLeaderboard}
                className="py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-400" /> View Scoreboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
