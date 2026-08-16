import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Search, X, RotateCcw, FileSpreadsheet, RefreshCw, Users, Globe, Crown, Swords, Sparkles, UserCheck } from 'lucide-react';
import { LeaderboardEntry, DifficultyLevel } from '../types';
import {
  DIFFICULTY_PRESETS,
  resetLeaderboardRemote,
  fetchScoresFromServer,
  getUniquePlayerLeaderboard,
  PlayerBestRecord,
  isSampleBot,
} from '../utils/storage';
import { soundManager } from '../utils/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  currentRoomCode: string;
  onRefreshEntries: (newEntries: LeaderboardEntry[]) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentPlayerName,
  currentRoomCode,
  onRefreshEntries,
}) => {
  const [scope, setScope] = useState<'ROOM' | 'GLOBAL'>('ROOM');
  const [viewMode, setViewMode] = useState<'BEST_PER_PLAYER' | 'ALL_ROUNDS'>('BEST_PER_PLAYER');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync latest scores from server when modal opens
  useEffect(() => {
    if (isOpen) {
      handleManualRefresh();
    }
  }, [isOpen, currentRoomCode]);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    soundManager.playButtonClick();
    try {
      const refreshed = await fetchScoresFromServer(currentRoomCode);
      onRefreshEntries(refreshed);
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Filter out any legacy dummy sample bots
  const cleanEntries = entries.filter((e) => !isSampleBot(e));

  // Filter by Room vs Global scope
  const scopedEntries = cleanEntries.filter((e) => {
    if (scope === 'ROOM') {
      return e.roomCode && e.roomCode.toUpperCase() === currentRoomCode.toUpperCase();
    }
    return true; // Global includes all rooms
  });

  // Calculate unique player best records
  const uniquePlayersList: PlayerBestRecord[] = getUniquePlayerLeaderboard(scopedEntries);

  // Get current active display list based on view mode (Unique Players vs Raw Match Logs)
  const displayItems = viewMode === 'BEST_PER_PLAYER' ? uniquePlayersList : scopedEntries;

  // Filter by Difficulty and Search Query
  const filteredEntries = displayItems.filter((e) => {
    const matchesDifficulty = filterDifficulty === 'ALL' || e.difficulty === filterDifficulty;
    const matchesSearch = e.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  // Unique players in the room
  const totalUniquePlayers = uniquePlayersList.length;

  const handleReset = async () => {
    if (window.confirm('Wipe and clear all leaderboard scores completely?')) {
      soundManager.playButtonClick();
      const refreshed = await resetLeaderboardRemote();
      onRefreshEntries(refreshed);
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
    link.setAttribute('download', `GameHub_${scope}_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If exactly 2 players in the room, compute head-to-head comparison
  const isTwoPlayerBattle = scope === 'ROOM' && uniquePlayersList.length === 2 && viewMode === 'BEST_PER_PLAYER';
  const player1 = uniquePlayersList[0];
  const player2 = uniquePlayersList[1];
  const scoreDiff = player1 && player2 ? Math.abs(player1.score - player2.score) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Live Scoreboard
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Sync
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {totalUniquePlayers === 2
                    ? '2-Player Head-to-Head Battle'
                    : totalUniquePlayers > 0
                    ? `${totalUniquePlayers} Real Competitors Ranked`
                    : 'Real player rankings (No default bots)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                title="Sync and refresh scores from server"
                className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-all ${
                  isRefreshing ? 'animate-spin' : 'hover:scale-105 active:scale-95'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
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
          </div>

          {/* Scope Selector: Room vs Global */}
          <div className="pt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => {
                  setScope('ROOM');
                  soundManager.playButtonClick();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scope === 'ROOM'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Room: <span className="font-mono text-cyan-200">{currentRoomCode}</span>
                {totalUniquePlayers > 0 && (
                  <span className="ml-1 text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full text-cyan-100 font-bold">
                    {totalUniquePlayers} {totalUniquePlayers === 1 ? 'Player' : 'Players'}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setScope('GLOBAL');
                  soundManager.playButtonClick();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scope === 'GLOBAL'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Global Hall of Fame
              </button>
            </div>

            {/* View Mode Switch: Best Score Per Player vs Match History */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto text-xs">
              <button
                onClick={() => {
                  setViewMode('BEST_PER_PLAYER');
                  soundManager.playButtonClick();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'BEST_PER_PLAYER'
                    ? 'bg-slate-700 text-cyan-300 shadow'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                title="Shows each unique player once with their highest score"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Unique Players (Best)
              </button>
              <button
                onClick={() => {
                  setViewMode('ALL_ROUNDS');
                  soundManager.playButtonClick();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'ALL_ROUNDS'
                    ? 'bg-slate-700 text-amber-300 shadow'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                title="Shows all rounds history"
              >
                Match History ({scopedEntries.length})
              </button>
            </div>
          </div>

          {/* 2-Player Head-to-Head Matchup Banner */}
          {isTwoPlayerBattle && player1 && player2 && (
            <div className="mb-2 p-3 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-fuchsia-950/50 border border-cyan-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{player1.avatar}</span>
                <div>
                  <div className="font-extrabold text-white flex items-center gap-1">
                    {player1.playerName}
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                      LEADER 👑
                    </span>
                  </div>
                  <div className="text-cyan-300 font-mono font-bold">{player1.score.toLocaleString()} pts</div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-[10px]">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {scoreDiff === 0 ? 'Tied Score!' : `+${scoreDiff.toLocaleString()} pts lead`}
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="font-extrabold text-white">{player2.playerName}</div>
                  <div className="text-rose-300 font-mono font-bold">{player2.score.toLocaleString()} pts</div>
                </div>
                <span className="text-xl">{player2.avatar}</span>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="py-2 space-y-2 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              {/* Difficulty Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterDifficulty('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterDifficulty === 'ALL'
                      ? 'bg-slate-200 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  All Modes
                </button>
                {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterDifficulty(level)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterDifficulty === level
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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
                  placeholder="Filter player name..."
                  className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Scores Table */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-slate-300 text-sm font-bold">
                  {scope === 'ROOM'
                    ? `No scores submitted yet for Room "${currentRoomCode}".`
                    : 'No scores recorded yet.'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {scope === 'ROOM'
                    ? 'Play a 60-second round or share your room link. Both players will appear here ranked by their best score!'
                    : 'Complete a match to claim your spot on the scoreboard!'}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry, idx) => {
                const isCurrentPlayer = entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();
                const rank = idx + 1;
                const matchCount = (entry as PlayerBestRecord).matchCount;

                let rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                    #{rank}
                  </span>
                );

                if (rank === 1) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center justify-center shadow-md shadow-amber-500/20">
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
                    key={entry.id || `${entry.playerName}-${idx}`}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                      isCurrentPlayer
                        ? 'bg-cyan-500/10 border-cyan-400/60 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Rank, Avatar & Player Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {rankBadge}
                      <span className="text-xl shrink-0">{entry.avatar || '⚡'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm truncate ${isCurrentPlayer ? 'text-cyan-300' : 'text-slate-100'}`}>
                            {entry.playerName}
                          </span>
                          {isCurrentPlayer && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full shrink-0">
                              You
                            </span>
                          )}
                          {viewMode === 'BEST_PER_PLAYER' && matchCount !== undefined && matchCount > 1 && (
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-800/90 px-1.5 py-0.2 rounded-full border border-slate-700">
                              {matchCount} rounds
                            </span>
                          )}
                          {entry.roomCode && scope === 'GLOBAL' && (
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 shrink-0">
                              {entry.roomCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${diffConfig?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {entry.difficulty}
                          </span>
                          <span>Acc: <strong className="text-slate-300">{entry.accuracy}%</strong></span>
                          <span>Hits: <strong className="text-slate-300">{entry.hits}</strong></span>
                          <span>• {entry.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Combo Points */}
                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-black text-amber-300 tracking-tight">
                        {entry.score.toLocaleString()} <span className="text-xs text-amber-500 font-bold">pts</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Streak: <span className="text-cyan-300 font-bold">{entry.maxCombo}x</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
              title="Clear all saved scores"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Scores
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all cursor-pointer"
                title="Download displayed scores as a CSV file"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <span className="font-semibold text-slate-300">
                {viewMode === 'BEST_PER_PLAYER' ? `${filteredEntries.length} Unique Players` : `${filteredEntries.length} Total Matches`}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
