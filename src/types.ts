export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  spawnInterval: number; // in milliseconds
  targetLifespan: number; // in milliseconds
  multiplier: number;
  hasHazards: boolean;
  hasMovingTargets: boolean;
  hasFakeTargets: boolean;
  gridCols: number;
  description: string;
  badgeColor: string;
  bgGlow: string;
}

export type TargetType = 'STANDARD' | 'GOLDEN' | 'HAZARD' | 'TIME_BONUS' | 'MULTIPLIER' | 'DECOY';

export interface TargetNode {
  id: string;
  x: number; // percentage 10 - 85
  y: number; // percentage 10 - 85
  type: TargetType;
  createdAt: number;
  expiresAt: number;
  size: number; // in px
  points: number;
  dx?: number;
  dy?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  difficulty: DifficultyLevel;
  accuracy: number;
  maxCombo: number;
  hits: number;
  date: string;
  timestamp: number;
  roomCode?: string;
}

export interface RoomParticipant {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  difficulty: DifficultyLevel;
  status: 'PLAYING' | 'WAITING' | 'FINISHED';
  timeRemaining?: number;
  updatedAt: number;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  totalGames: number;
  highScore: number;
  favoriteDifficulty: DifficultyLevel;
  totalHits: number;
  totalMisses: number;
  maxComboEver: number;
}

export interface GameStats {
  score: number;
  hits: number;
  misses: number;
  combo: number;
  maxCombo: number;
  timeRemaining: number;
  activeMultiplier: number;
  multiplierExpiresAt: number;
}

export type GameStatus = 'NAME_INPUT' | 'TUTORIAL' | 'READY' | 'PLAYING' | 'GAME_OVER';
