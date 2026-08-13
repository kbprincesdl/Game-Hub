import React, { useState } from 'react';
import { Trophy, HelpCircle, Volume2, VolumeX, User, Zap, BarChart2, Share2, RotateCcw, Check, Users } from 'lucide-react';
import { PlayerProfile, DifficultyLevel, GameStatus } from '../types';
import { soundManager } from '../utils/sound';
import { DIFFICULTY_PRESETS } from '../utils/storage';

interface NavbarProps {
  player: PlayerProfile;
  isMuted: boolean;
  onToggleMuted: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial: () => void;
  onOpenProfile: () => void;
  onOpenStats: () => void;
  activeDifficulty?: DifficultyLevel;
  roomCode: string;
  gameStatus: GameStatus;
  onQuickReplay: () => void;
  onShareRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  player,
  isMuted,
  onToggleMuted,
  onOpenLeaderboard,
  onOpenTutorial,
  onOpenProfile,
  onOpenStats,
  activeDifficulty,
  roomCode,
  gameStatus,
  onQuickReplay,
  onShareRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const difficultyConfig = activeDifficulty ? DIFFICULTY_PRESETS[activeDifficulty] : null;

  const handleCopyLink = () => {
    soundManager.playButtonClick();
    onShareRoom();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800 text-slate-100 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Hub Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenProfile}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
              GH
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                GAME HUB
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                60s BLITZ
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Beat the clock & claim top spots!
            </p>
          </div>
        </div>

        {/* Center Room Share & Quick Replay Actions */}
        <div className="flex items-center gap-2">
          {/* Room URL Share Badge */}
          <button
            id="navbar-share-room-btn"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shadow-sm"
            title="Share URL to play with friends in same room!"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Room:</span>
            <span className="font-mono text-cyan-300 uppercase">{roomCode}</span>
            {copied ? (
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Check className="w-3 h-3 stroke-[3]" /> Copied Link!
              </span>
            ) : (
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>

          {/* Quick Replay / Reset Button when game is playing */}
          {(gameStatus === 'PLAYING' || gameStatus === 'READY') && (
            <button
              id="navbar-quick-replay-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onQuickReplay();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all animate-pulse"
              title="Restart game immediately & reset timer to 60s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Timer</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Player Badge */}
          <button
            id="navbar-player-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all text-xs font-medium group"
            title="Edit Profile & Avatar"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{player.avatar}</span>
            <span className="max-w-[90px] truncate text-slate-200 font-semibold">{player.name}</span>
            <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
          </button>

          {/* Stats Button */}
          <button
            id="navbar-stats-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenStats();
            }}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
            title="My Stats"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Leaderboard Button */}
          <button
            id="navbar-leaderboard-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm shadow-amber-500/10"
            title="Live Scoreboard"
          >
            <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Scores</span>
          </button>

          {/* Tutorial Button */}
          <button
            id="navbar-tutorial-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenTutorial();
            }}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mute/Unmute Audio Toggle */}
          <button
            id="navbar-sound-btn"
            onClick={onToggleMuted}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
