import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Search, X, RotateCcw, Flame, Target, Filter, UserCheck, Download, FileSpreadsheet } from 'lucide-react';
import { LeaderboardEntry, DifficultyLevel } from '../types';
import { DIFFICULTY_PRESETS, resetLeaderboard } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  onRefreshEntries: (newEntries: LeaderboardEntry[]) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentPlayerName,
  onRefreshEntries,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) => {
    const matchesDifficulty = filterDifficulty === 'ALL' || e.difficulty === filterDifficulty;
    const matchesSearch = e.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const handleReset = () => {
    if (window.confirm('Reset local high scores to defaults?')) {
      const refreshed = resetLeaderboard();
      onRefreshEntries(refreshed);
      soundManager.playButtonClick();
    }
  };

  const handleExportCSV = () => {
    soundManager.playButtonClick();
    if (filteredEntries.length === 0) return;

    const headers = ['Rank', 'Player Name', 'Avatar', 'Score', 'Accuracy (%)', 'Max Combo', 'Difficulty', 'Date', 'Room Code'];
    const rows = filteredEntries.map((entry, index) => [
      index + 1,
      `"${(entry.playerName || '').replace(/"/g, '""')}"`,
      `"${entry.avatar || ''}"`,
      entry.score,
      entry.accuracy,
      entry.maxCombo,
      entry.difficulty,
      `"${entry.date}"`,
      `"${entry.roomCode || 'GLOBAL'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GameHub_Scores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Game Hub Leaderboard
                </h2>
                <p className="text-xs text-slate-400">
                  Top 60s Blitz scores saved in Local Storage
                </p>
              </div>
            </div>

            <button
              id="leaderboard-close-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters & Search */}
          <div className="py-4 space-y-3 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Difficulty Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterDifficulty('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterDifficulty === 'ALL'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Modes
                </button>
                {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterDifficulty(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterDifficulty === level
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {DIFFICULTY_PRESETS[level].name}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Scores Table */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No high score entries found for this filter.
              </div>
            ) : (
              filteredEntries.map((entry, idx) => {
                const isCurrentPlayer = entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();
                const rank = idx + 1;

                let rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                    #{rank}
                  </span>
                );

                if (rank === 1) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center justify-center shadow-md shadow-amber-500/20">
                      👑 1
                    </div>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200 text-xs font-black flex items-center justify-center">
                      🥈 2
                    </div>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 text-xs font-black flex items-center justify-center">
                      🥉 3
                    </div>
                  );
                }

                const diffConfig = DIFFICULTY_PRESETS[entry.difficulty];

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                      isCurrentPlayer
                        ? 'bg-cyan-500/10 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Rank & Player Name */}
                    <div className="flex items-center gap-3">
                      {rankBadge}
                      <span className="text-xl">{entry.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isCurrentPlayer ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {entry.playerName}
                          </span>
                          {isCurrentPlayer && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${diffConfig?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {entry.difficulty}
                          </span>
                          <span>Acc: {entry.accuracy}%</span>
                          <span>• {entry.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Combo */}
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-amber-400 tracking-tight">
                        {entry.score.toLocaleString()} <span className="text-xs text-amber-500 font-bold">pts</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Max Streak: <span className="text-slate-200 font-bold">{entry.maxCombo}x</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all"
                title="Download all high scores as a CSV file for Google Sheets / Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV (Sheets)</span>
              </button>
              <span>Total Records: {filteredEntries.length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
