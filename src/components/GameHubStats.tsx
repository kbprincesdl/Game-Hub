import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Trophy, BarChart2, Target, Flame, RotateCcw, X, Check, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types';
import { DEFAULT_AVATARS, savePlayerProfile, DIFFICULTY_PRESETS } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface GameHubStatsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
}

export const GameHubStats: React.FC<GameHubStatsProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = savePlayerProfile({ name: trimmed, avatar });
    onUpdateProfile(updated);
    setIsEditing(false);
    soundManager.playButtonClick();
  };

  const diffConfig = DIFFICULTY_PRESETS[profile.favoriteDifficulty || 'MEDIUM'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Player Profile & Stats
                </h2>
                <p className="text-xs text-slate-400">Personal session performance history</p>
              </div>
            </div>
            <button
              id="stats-close-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card / Editor */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">{profile.name}</h3>
                  <span className="text-xs text-cyan-400 font-semibold">Game Hub Challenger</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Tag'}
              </button>
            </div>

            {isEditing && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Update Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={16}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Select Avatar
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {DEFAULT_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                          avatar === emoji ? 'bg-cyan-500/30 border border-cyan-400 scale-105' : 'bg-slate-900'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs uppercase"
                >
                  Save Profile
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Score
              </div>
              <div className="text-xl font-black text-amber-300">
                {profile.highScore.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Personal Best</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Total Hits
              </div>
              <div className="text-xl font-black text-cyan-300">
                {profile.totalHits.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Targets Tap</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Max Streak
              </div>
              <div className="text-xl font-black text-orange-300">
                {profile.maxComboEver}x
              </div>
              <div className="text-[10px] text-slate-500">Best Combo Ever</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Total Games
              </div>
              <div className="text-xl font-black text-indigo-300">
                {profile.totalGames}
              </div>
              <div className="text-[10px] text-slate-500">60s Sessions</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
