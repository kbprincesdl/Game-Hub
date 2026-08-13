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

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'sample-1',
    playerName: 'CyberViper',
    avatar: '⚡',
    score: 8450,
    difficulty: 'INSANE',
    accuracy: 96,
    maxCombo: 34,
    hits: 68,
    date: 'Today',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'sample-2',
    playerName: 'AuraKnight',
    avatar: '👑',
    score: 6120,
    difficulty: 'HARD',
    accuracy: 94,
    maxCombo: 28,
    hits: 54,
    date: 'Today',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'sample-3',
    playerName: 'NovaRider',
    avatar: '🔥',
    score: 4890,
    difficulty: 'MEDIUM',
    accuracy: 91,
    maxCombo: 22,
    hits: 48,
    date: 'Yesterday',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'sample-4',
    playerName: 'PixelPulse',
    avatar: '🤖',
    score: 3500,
    difficulty: 'EASY',
    accuracy: 98,
    maxCombo: 30,
    hits: 42,
    date: '2 days ago',
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'sample-5',
    playerName: 'ZenMaster',
    avatar: '💎',
    score: 3100,
    difficulty: 'EASY',
    accuracy: 95,
    maxCombo: 24,
    hits: 38,
    date: '3 days ago',
    timestamp: Date.now() - 259200000,
  },
];

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
      if (parsed && parsed.length > 0) {
        return parsed.sort((a, b) => b.score - a.score);
      }
    }
  } catch {
    // Ignore
  }
  // Populate default if empty
  saveLeaderboard(DEFAULT_LEADERBOARD);
  return DEFAULT_LEADERBOARD;
}

export function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    const sorted = [...entries].sort((a, b) => b.score - a.score).slice(0, 50); // Keep top 50
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(sorted));
    return sorted;
  } catch {
    return entries;
  }
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
  const rank = updatedBoard.findIndex((e) => e.id === fullEntry.id) + 1;

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

  return { updatedBoard, rank, isNewHighScore };
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
    let urlString = window.location.href;
    // Automatically convert development preview domain (ais-dev-) to public share domain (ais-pre-)
    // to prevent 403 Forbidden authentication errors when opened in standard browser windows
    if (urlString.includes('ais-dev-')) {
      urlString = urlString.replace('ais-dev-', 'ais-pre-');
    }
    const url = new URL(urlString);
    url.searchParams.set('room', roomCode.toUpperCase());
    return url.toString();
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
