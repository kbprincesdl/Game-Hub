import { DifficultyConfig, DifficultyLevel, LeaderboardEntry, PlayerProfile } from '../types';

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: {
    id: 'EASY',
    name: 'Easy',
    spawnInterval: 1000,
    targetLifespan: 2600,
    multiplier: 1.0,
    hasHazards: false,
    hasMovingTargets: false,
    hasFakeTargets: false,
    gridCols: 4,
    description: 'Relaxed speed, large static targets. Perfect for warm-ups.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    bgGlow: 'from-emerald-600/10 to-teal-900/20',
  },
  MEDIUM: {
    id: 'MEDIUM',
    name: 'Medium',
    spawnInterval: 750,
    targetLifespan: 1900,
    multiplier: 1.5,
    hasHazards: true,
    hasMovingTargets: true,
    hasFakeTargets: false,
    gridCols: 4,
    description: 'Faster spawns with drifting targets & occasional bomb hazards.',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    bgGlow: 'from-cyan-600/10 to-blue-900/20',
  },
  HARD: {
    id: 'HARD',
    name: 'Hard',
    spawnInterval: 520,
    targetLifespan: 1300,
    multiplier: 2.0,
    hasHazards: true,
    hasMovingTargets: true,
    hasFakeTargets: true,
    gridCols: 5,
    description: 'Shrinking hitboxes, fast moving nodes & golden powerups.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    bgGlow: 'from-amber-600/10 to-orange-900/20',
  },
  INSANE: {
    id: 'INSANE',
    name: 'Insane',
    spawnInterval: 360,
    targetLifespan: 950,
    multiplier: 3.0,
    hasHazards: true,
    hasMovingTargets: true,
    hasFakeTargets: true,
    gridCols: 5,
    description: 'Hyper speed, fake decoy traps, teleporting powerups & 3x score boost!',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    bgGlow: 'from-rose-600/10 to-purple-900/20',
  },
};

export const DEFAULT_AVATARS = [
  '⚡', '🔥', '🎯', '🚀', '👑', '💎', '👾', '🦊', '🐯', '🤖', '🐲', '💥'
];

const STORAGE_KEYS = {
  PROFILE: 'gamehub_player_profile',
  LEADERBOARD: 'gamehub_live_leaderboard',
  SETTINGS: 'gamehub_settings',
};

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [];

// Helper to filter out legacy sample dummy bots
export const isSampleBot = (entry: LeaderboardEntry): boolean => {
  if (!entry) return true;
  if (entry.id && entry.id.startsWith('sample-')) return true;
  const dummyNames = ['cyberviper', 'auraknight', 'novarider', 'pixelpulse', 'zenmaster'];
  if (dummyNames.includes((entry.playerName || '').trim().toLowerCase())) return true;
  return false;
};

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Return default
  }
  return {
    name: 'Player 1',
    avatar: '⚡',
    totalGames: 0,
    highScore: 0,
    favoriteDifficulty: 'MEDIUM',
    totalHits: 0,
    totalMisses: 0,
    maxComboEver: 0,
  };
}

export function savePlayerProfile(profile: Partial<PlayerProfile>): PlayerProfile {
  const current = getPlayerProfile();
  const updated: PlayerProfile = { ...current, ...profile };
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  } catch {
    // Ignore error
  }
  return updated;
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      const parsed: LeaderboardEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out all legacy dummy bots
        const cleaned = parsed.filter((e) => !isSampleBot(e)).sort((a, b) => b.score - a.score);
        return cleaned;
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

export function saveLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  try {
    // De-duplicate by ID or (playerName + score + timestamp), and filter out dummy bots
    const seen = new Set<string>();
    const unique: LeaderboardEntry[] = [];
    for (const item of entries) {
      if (isSampleBot(item)) continue;
      const key = item.id || `${item.playerName}-${item.score}-${item.difficulty}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    const sorted = unique.sort((a, b) => b.score - a.score).slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(sorted));
    return sorted;
  } catch {
    return entries.filter((e) => !isSampleBot(e));
  }
}

export interface PlayerBestRecord extends LeaderboardEntry {
  matchCount: number;
}

/**
 * Groups all leaderboard entries by player name and retains ONLY each player's highest/best score.
 * Shows each unique player exactly once!
 */
export function getUniquePlayerLeaderboard(entries: LeaderboardEntry[]): PlayerBestRecord[] {
  const map = new Map<string, PlayerBestRecord>();

  for (const entry of entries) {
    if (isSampleBot(entry)) continue;
    const cleanName = (entry.playerName || '').trim();
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...entry,
        playerName: cleanName,
        matchCount: 1,
      });
    } else {
      existing.matchCount += 1;
      // Keep best (highest) score
      if (entry.score > existing.score) {
        map.set(key, {
          ...entry,
          playerName: cleanName,
          matchCount: existing.matchCount,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

export async function fetchScoresFromServer(roomCode?: string): Promise<LeaderboardEntry[]> {
  try {
    const query = roomCode ? `?room=${encodeURIComponent(roomCode)}` : '';
    const res = await fetch(`/api/scores${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.allScores || data.scores)) {
        const remoteScores: LeaderboardEntry[] = data.allScores || data.scores;
        // Merge with local storage
        const currentLocal = getLeaderboard();
        const merged = saveLeaderboard([...remoteScores, ...currentLocal]);
        return merged;
      }
    }
  } catch (err) {
    // Fallback to local
    console.debug('Could not reach score server, using local store', err);
  }
  return getLeaderboard();
}

export async function submitScoreToServer(newEntry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<{
  updatedBoard: LeaderboardEntry[];
  rank: number;
  isNewHighScore: boolean;
}> {
  // 1. Immediately save locally for instantaneous response & offline capability
  const localResult = addScoreToLeaderboard(newEntry);

  // 2. Submit to server in background
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.scores)) {
        const merged = saveLeaderboard(data.scores);
        const uniqueRankings = getUniquePlayerLeaderboard(merged);
        const playerRank = uniqueRankings.findIndex(
          (e) => e.playerName.toLowerCase() === newEntry.playerName.toLowerCase()
        ) + 1;
        return {
          updatedBoard: merged,
          rank: playerRank > 0 ? playerRank : localResult.rank,
          isNewHighScore: localResult.isNewHighScore,
        };
      }
    }
  } catch (err) {
    console.debug('Failed to sync score to server, kept local', err);
  }

  return localResult;
}

export function addScoreToLeaderboard(newEntry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): {
  updatedBoard: LeaderboardEntry[];
  rank: number;
  isNewHighScore: boolean;
} {
  const currentBoard = getLeaderboard();
  const fullEntry: LeaderboardEntry = {
    ...newEntry,
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
  };

  const updatedBoard = saveLeaderboard([fullEntry, ...currentBoard]);
  const uniqueRankings = getUniquePlayerLeaderboard(updatedBoard);
  const rank = uniqueRankings.findIndex(
    (e) => e.playerName.toLowerCase() === newEntry.playerName.toLowerCase()
  ) + 1;

  // Check if this player beat their previous high score
  const profile = getPlayerProfile();
  const isNewHighScore = newEntry.score > profile.highScore;

  if (isNewHighScore || profile.totalGames === 0) {
    savePlayerProfile({
      highScore: Math.max(profile.highScore, newEntry.score),
      maxComboEver: Math.max(profile.maxComboEver, newEntry.maxCombo),
    });
  }

  // Update cumulative stats
  savePlayerProfile({
    totalGames: profile.totalGames + 1,
    totalHits: profile.totalHits + newEntry.hits,
    favoriteDifficulty: newEntry.difficulty,
  });

  return { updatedBoard, rank: rank > 0 ? rank : 1, isNewHighScore };
}

export async function resetLeaderboardRemote(): Promise<LeaderboardEntry[]> {
  localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  try {
    const res = await fetch('/api/scores/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.scores)) {
        return saveLeaderboard(data.scores);
      }
    }
  } catch {
    // Ignore
  }
  return resetLeaderboard();
}

export function resetLeaderboard(): LeaderboardEntry[] {
  localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  return getLeaderboard();
}

export function getRoomCodeFromURL(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room && room.trim()) {
      return room.trim().toUpperCase();
    }
    if (window.location.hash.includes('room=')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
      const hashRoom = hashParams.get('room');
      if (hashRoom && hashRoom.trim()) {
        return hashRoom.trim().toUpperCase();
      }
    }
  } catch {
    // Ignore
  }
  return 'PUBLIC-ROOM';
}

export function getShareableRoomURL(roomCode: string): string {
  try {
    const cleanCode = roomCode.toUpperCase();
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    return `${baseUrl}#room=${encodeURIComponent(cleanCode)}`;
  } catch {
    return window.location.href;
  }
}

export function setRoomCodeInURL(roomCode: string) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode.toUpperCase());
    window.history.pushState({}, '', url.toString());
  } catch {
    // Ignore
  }
}

// BroadcastChannel for instant cross-tab / multi-window synchronization
export class RoomBroadcast {
  private channel: BroadcastChannel | null = null;

  constructor(roomCode: string, onMessage: (data: unknown) => void) {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`gamehub_room_${roomCode}`);
      this.channel.onmessage = (event) => {
        onMessage(event.data);
      };
    }
  }

  public broadcast(payload: unknown) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
  }

  public close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}
