import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Trophy, HelpCircle, Zap, Shield, Sparkles, Flame, Target, Check, RotateCcw } from 'lucide-react';
import { DifficultyLevel, PlayerProfile } from '../types';
import { DEFAULT_AVATARS, DIFFICULTY_PRESETS, savePlayerProfile } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface NameInputScreenProps {
  profile: PlayerProfile;
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onStartGame: (name: string, avatar: string) => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial: () => void;
}

export const NameInputScreen: React.FC<NameInputScreenProps> = ({
  profile,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenLeaderboard,
  onOpenTutorial,
}) => {
  const [name, setName] = useState(profile.name || 'Player 1');
  const [avatar, setAvatar] = useState(profile.avatar || '⚡');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter a player name to start!');
      return;
    }
    if (trimmed.length > 16) {
      setNameError('Name must be 16 characters or less');
      return;
    }
    setNameError('');
    savePlayerProfile({ name: trimmed, avatar });
    soundManager.playGameStart();
    onStartGame(trimmed, avatar);
  };

  const currentDiffConfig = DIFFICULTY_PRESETS[selectedDifficulty];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Background Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header */}
        <div className="text-center space-y-3 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider uppercase shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            Welcome to Game Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight">
            60-Second Reaction Blitz
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Beat the clock, tap glowing energy targets, execute high-combo streaks, and claim top ranks on the Live Leaderboard!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Section 1: Player Personalization */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wide">
                <Target className="w-4 h-4" />
                <span>STEP 1: PERSONAL PROFILE</span>
              </div>
              {profile.highScore > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Trophy className="w-3.5 h-3.5" />
                  Personal Best: {profile.highScore.toLocaleString()} pts
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              {/* Name Input */}
              <div className="sm:col-span-7 space-y-2">
                <label id="player-name-label" htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Player Name
                </label>
                <input
                  id="player-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter your hero tag..."
                  maxLength={16}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-xl text-slate-100 font-bold tracking-wide placeholder-slate-500 transition-all outline-none"
                />
                {nameError && <p className="text-rose-400 text-xs font-semibold">{nameError}</p>}
              </div>

              {/* Avatar Picker */}
              <div className="sm:col-span-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Avatar Emblem
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {DEFAULT_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setAvatar(emoji);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        avatar === emoji
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 scale-105 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900 border border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Difficulty Level Customization */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wide">
                <Zap className="w-4 h-4" />
                <span>STEP 2: CUSTOMIZE DIFFICULTY LEVEL</span>
              </div>
              <span className="text-xs text-slate-400">
                Multipliers boost your final score!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((level) => {
                const conf = DIFFICULTY_PRESETS[level];
                const isSelected = selectedDifficulty === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onSelectDifficulty(level);
                    }}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-full ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${conf.badgeColor}`}>
                          {conf.name}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          {conf.multiplier}x Pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        {conf.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Spawn: {(conf.spawnInterval / 1000).toFixed(1)}s</span>
                      {conf.hasHazards && <span className="text-rose-400 font-bold">💣 Hazards</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenTutorial}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                How to Play
              </button>
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard
              </button>
            </div>

            <button
              id="start-60s-game-btn"
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white font-extrabold text-base tracking-wider uppercase shadow-xl shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              Start 60s Game
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
