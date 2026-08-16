import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { NameInputScreen } from './components/NameInputScreen';
import { CountdownIndicator } from './components/CountdownIndicator';
import { GameBoard } from './components/GameBoard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TutorialModal } from './components/TutorialModal';
import { GameOverModal } from './components/GameOverModal';
import { GameHubStats } from './components/GameHubStats';
import { RoomModal } from './components/RoomModal';
import {
  DifficultyLevel,
  GameStatus,
  LeaderboardEntry,
  PlayerProfile,
  TargetNode,
  FloatingText,
  Particle,
  TargetType,
} from './types';
import {
  getPlayerProfile,
  getLeaderboard,
  submitScoreToServer,
  fetchScoresFromServer,
  DIFFICULTY_PRESETS,
  savePlayerProfile,
  getRoomCodeFromURL,
  setRoomCodeInURL,
  RoomBroadcast,
} from './utils/storage';
import { soundManager } from './utils/sound';
import { Trophy, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Persistence & User State
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(getLeaderboard());
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(profile.favoriteDifficulty || 'MEDIUM');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Room & Multiplayer State
  const [roomCode, setRoomCode] = useState<string>(() => {
    const code = getRoomCodeFromURL();
    setRoomCodeInURL(code);
    return code;
  });
  const roomBroadcasterRef = useRef<RoomBroadcast | null>(null);
  const [liveToast, setLiveToast] = useState<{ id: string; message: string; subtext?: string } | null>(null);

  // Game Lifecycle State
  const [status, setStatus] = useState<GameStatus>('NAME_INPUT');
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [readyCountdown, setReadyCountdown] = useState<number>(3);

  // Active Game Metrics
  const [score, setScore] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isMultiplierActive, setIsMultiplierActive] = useState<boolean>(false);
  const multiplierEndTimeRef = useRef<number>(0);

  // Board Nodes & FX
  const [targets, setTargets] = useState<TargetNode[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Modals State
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);

  // Final Results
  const [lastRank, setLastRank] = useState<number>(1);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Initial and periodic sync from backend server for cross-device multiplayer
  const syncScores = useCallback(async () => {
    try {
      const refreshed = await fetchScoresFromServer(roomCode);
      setLeaderboard(refreshed);
    } catch {
      // Ignore
    }
  }, [roomCode]);

  useEffect(() => {
    // Initial fetch
    syncScores();

    // Periodic polling every 4 seconds to catch opponents finishing matches on different devices
    const interval = setInterval(syncScores, 4000);
    return () => clearInterval(interval);
  }, [syncScores]);

  // Initialize Room Broadcasting for local Cross-Tab synchronization
  useEffect(() => {
    const broadcaster = new RoomBroadcast(roomCode, (data: unknown) => {
      const payload = data as { type?: string; entry?: LeaderboardEntry; playerName?: string; score?: number };
      if (payload && payload.type === 'NEW_SCORE_ENTRY') {
        syncScores();
        if (payload.playerName && payload.score !== undefined) {
          showLiveToast(`🎉 ${payload.playerName} scored ${payload.score.toLocaleString()} pts!`, `Room: ${roomCode}`);
        }
      }
    });
    roomBroadcasterRef.current = broadcaster;
    return () => broadcaster.close();
  }, [roomCode, syncScores]);

  const showLiveToast = (message: string, subtext?: string) => {
    const id = `toast-${Date.now()}`;
    setLiveToast({ id, message, subtext });
    setTimeout(() => {
      setLiveToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  };

  // Audio Mute Handler
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Quick Replay / Reset Timer Handler
  const handleQuickReplay = useCallback(() => {
    soundManager.playButtonClick();
    setScore(0);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeRemaining(60);
    setTargets([]);
    setFloatingTexts([]);
    setParticles([]);
    setIsMultiplierActive(false);
    setStatus('READY');
    setReadyCountdown(3);
  }, []);

  // Share URL Room Invite Handler
  const handleShareRoom = () => {
    soundManager.playButtonClick();
    setIsRoomModalOpen(true);
  };

  // Trigger Ready Countdown before Game
  const handleStartGame = (name: string, avatar: string) => {
    const updatedProfile = savePlayerProfile({ name, avatar, favoriteDifficulty: difficulty });
    setProfile(updatedProfile);
    setStatus('READY');
    setReadyCountdown(3);
  };

  // Ready Countdown Timer Effect (3, 2, 1, START!)
  useEffect(() => {
    if (status !== 'READY') return;

    if (readyCountdown > 0) {
      soundManager.playTick(false);
      const timer = setTimeout(() => setReadyCountdown((c) => c - 1), 900);
      return () => clearTimeout(timer);
    } else {
      // Start 60s Game
      setScore(0);
      setHits(0);
      setMisses(0);
      setCombo(0);
      setMaxCombo(0);
      setTimeRemaining(60);
      setTargets([]);
      setFloatingTexts([]);
      setParticles([]);
      setIsMultiplierActive(false);
      setStatus('PLAYING');
      soundManager.playGameStart();
    }
  }, [status, readyCountdown]);

  // Main 60s Game Timer Loop
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const nextTime = Math.max(0, prevTime - 0.1);

        // Final 10 seconds tick alert
        if (nextTime <= 10 && Math.floor(prevTime) !== Math.floor(nextTime)) {
          soundManager.playTick(true);
        }

        // Multiplier expiration check
        if (Date.now() > multiplierEndTimeRef.current && isMultiplierActive) {
          setIsMultiplierActive(false);
        }

        // Timer Expired -> Game Over!
        if (nextTime <= 0) {
          clearInterval(interval);
          handleEndGame();
          return 0;
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status, isMultiplierActive]);

  // Target Spawner Loop
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const diffConfig = DIFFICULTY_PRESETS[difficulty];

    const spawnTarget = () => {
      setTargets((prevTargets) => {
        // Max concurrent targets on screen
        const maxConcurrent = difficulty === 'INSANE' ? 6 : difficulty === 'HARD' ? 5 : 4;
        if (prevTargets.length >= maxConcurrent) return prevTargets;

        // Determine node type
        const rand = Math.random();
        let type: TargetType = 'STANDARD';
        let points = 100;
        let size = 56;

        if (rand < 0.12 && diffConfig.hasHazards) {
          type = 'HAZARD';
          points = -150;
          size = 50;
        } else if (rand < 0.22) {
          type = 'GOLDEN';
          points = 250;
          size = 62;
        } else if (rand < 0.28) {
          type = 'TIME_BONUS';
          points = 50;
          size = 52;
        } else if (rand < 0.34) {
          type = 'MULTIPLIER';
          points = 100;
          size = 54;
        } else if (rand < 0.40 && diffConfig.hasFakeTargets) {
          type = 'DECOY';
          points = 50;
          size = 48;
        }

        // Coordinates (12% to 85% to stay well inside board borders)
        const x = Math.floor(Math.random() * 73) + 12;
        const y = Math.floor(Math.random() * 73) + 12;

        const now = Date.now();
        const newTarget: TargetNode = {
          id: `target-${now}-${Math.random().toString(36).substr(2, 4)}`,
          x,
          y,
          type,
          createdAt: now,
          expiresAt: now + diffConfig.targetLifespan,
          size,
          points,
          dx: diffConfig.hasMovingTargets ? (Math.random() - 0.5) * 0.8 : 0,
          dy: diffConfig.hasMovingTargets ? (Math.random() - 0.5) * 0.8 : 0,
        };

        return [...prevTargets, newTarget];
      });
    };

    const spawnInterval = setInterval(spawnTarget, diffConfig.spawnInterval);
    return () => clearInterval(spawnInterval);
  }, [status, difficulty]);

  // Clean Expired Targets & Move Nodes
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTargets((prev) =>
        prev
          .filter((t) => {
            const isExpired = now >= t.expiresAt;
            if (isExpired && t.type === 'STANDARD') {
              // Missed standard target
              setMisses((m) => m + 1);
              setCombo(0);
            }
            return !isExpired;
          })
          .map((t) => {
            if (t.dx || t.dy) {
              let newX = t.x + (t.dx || 0);
              let newY = t.y + (t.dy || 0);
              let dx = t.dx;
              let dy = t.dy;

              if (newX <= 10 || newX >= 88) dx = -(dx || 0);
              if (newY <= 10 || newY >= 88) dy = -(dy || 0);

              return { ...t, x: newX, y: newY, dx, dy };
            }
            return t;
          })
      );
    }, 60);

    return () => clearInterval(cleanupInterval);
  }, [status]);

  // Particle Physics Animation Loop
  useEffect(() => {
    if (particles.length === 0) return;

    const anim = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - 0.04,
          }))
          .filter((p) => p.alpha > 0)
      );
    });

    return () => cancelAnimationFrame(anim);
  }, [particles]);

  // Handle Target Click
  const handleTargetClick = (target: TargetNode, e: React.MouseEvent) => {
    if (status !== 'PLAYING') return;

    // Remove target from screen immediately
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    // Spawn Particles
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const boardRect = document.getElementById('game-board-container')?.getBoundingClientRect();
    const originX = boardRect ? e.clientX - boardRect.left : 400;
    const originY = boardRect ? e.clientY - boardRect.top : 300;

    let particleColor = '#22d3ee'; // cyan
    if (target.type === 'GOLDEN') particleColor = '#facc15'; // yellow
    if (target.type === 'HAZARD') particleColor = '#f43f5e'; // red
    if (target.type === 'TIME_BONUS') particleColor = '#34d399'; // emerald
    if (target.type === 'MULTIPLIER') particleColor = '#e879f9'; // fuchsia

    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      return {
        id: `p-${Date.now()}-${i}`,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        size: Math.random() * 4 + 3,
        alpha: 1,
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);

    // Calculate Points
    const diffConfig = DIFFICULTY_PRESETS[difficulty];
    let addedPoints = 0;

    if (target.type === 'HAZARD') {
      soundManager.playHazardHit();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);

      setCombo(0);
      setMisses((m) => m + 1);
      addedPoints = -150;

      // Floating text
      addFloatingText('-150 BOMB!', target.x, target.y, 'text-rose-400');
    } else {
      // Successful Hit!
      const currentCombo = combo + 1;
      setHits((h) => h + 1);
      setCombo(currentCombo);
      setMaxCombo((m) => Math.max(m, currentCombo));

      const comboMultiplier = 1 + Math.floor(currentCombo / 5) * 0.2; // +20% for every 5 streak
      const activePowerupMult = isMultiplierActive ? 2 : 1;
      addedPoints = Math.round(target.points * diffConfig.multiplier * comboMultiplier * activePowerupMult);

      if (target.type === 'GOLDEN') {
        soundManager.playGoldenHit();
        addFloatingText(`+${addedPoints} GOLD!`, target.x, target.y, 'text-amber-300');
      } else if (target.type === 'TIME_BONUS') {
        soundManager.playTimeBonus();
        setTimeRemaining((t) => Math.min(60, t + 3));
        addFloatingText('+3s TIME!', target.x, target.y, 'text-emerald-300');
      } else if (target.type === 'MULTIPLIER') {
        soundManager.playMultiplier();
        setIsMultiplierActive(true);
        multiplierEndTimeRef.current = Date.now() + 8000;
        addFloatingText('2x BOOST (8s)!', target.x, target.y, 'text-fuchsia-300');
      } else {
        soundManager.playHit(currentCombo);
        addFloatingText(`+${addedPoints}`, target.x, target.y, 'text-cyan-300');
      }
    }

    setScore((s) => Math.max(0, s + addedPoints));
  };

  // Handle Missed Clicks on Board
  const handleBoardMissClick = () => {
    if (status !== 'PLAYING') return;

    soundManager.playTick(false);
    setMisses((m) => m + 1);
    setCombo(0);
  };

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const newText: FloatingText = {
      id: `float-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      x,
      y,
      color,
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== newText.id));
    }, 600);
  };

  // Finalize Game Session & Save to Leaderboard
  const handleEndGame = async () => {
    setStatus('GAME_OVER');

    const totalAttempts = hits + misses;
    const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;

    const payload = {
      playerName: profile.name,
      avatar: profile.avatar,
      score,
      difficulty,
      accuracy,
      maxCombo,
      hits,
      date: 'Just now',
      roomCode,
    };

    // Submit to server & local storage
    const { updatedBoard, rank, isNewHighScore: isHighScore } = await submitScoreToServer(payload);

    setLeaderboard(updatedBoard);
    setLastRank(rank);
    setIsNewHighScore(isHighScore);
    setProfile(getPlayerProfile());

    // Broadcast score entry to all windows/tabs sharing this URL room code
    if (roomBroadcasterRef.current) {
      roomBroadcasterRef.current.broadcast({
        type: 'NEW_SCORE_ENTRY',
        playerName: profile.name,
        score,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Live Multiplayer Toast */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-white">{liveToast.message}</div>
              {liveToast.subtext && <div className="text-[10px] text-cyan-300 font-mono">{liveToast.subtext}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <Navbar
        player={profile}
        isMuted={isMuted}
        onToggleMuted={handleToggleMute}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenProfile={() => setIsStatsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        activeDifficulty={difficulty}
        roomCode={roomCode}
        gameStatus={status}
        onQuickReplay={handleQuickReplay}
        onShareRoom={handleShareRoom}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-7xl w-full mx-auto">
        {/* VIEW 1: WELCOME & NAME INPUT SCREEN */}
        {status === 'NAME_INPUT' && (
          <NameInputScreen
            profile={profile}
            selectedDifficulty={difficulty}
            onSelectDifficulty={setDifficulty}
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {/* VIEW 2: READY COUNTDOWN (3... 2... 1... BLITZ!) */}
        {status === 'READY' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center animate-pulse">
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30">
              PREPARE YOUR REFLEXES
            </span>
            <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
              {readyCountdown > 0 ? readyCountdown : 'BLITZ!'}
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Difficulty: <span className="text-white font-bold">{DIFFICULTY_PRESETS[difficulty].name}</span>
            </p>
          </div>
        )}

        {/* VIEW 3: ACTIVE PLAYING ARENA */}
        {status === 'PLAYING' && (
          <div className="w-full max-w-4xl space-y-4">
            {/* Top 60s Countdown Ring & Multiplier Bar */}
            <CountdownIndicator
              timeRemaining={timeRemaining}
              totalTime={60}
              combo={combo}
              multiplier={DIFFICULTY_PRESETS[difficulty].multiplier * (isMultiplierActive ? 2 : 1)}
              isMultiplierActive={isMultiplierActive}
              onQuickReplay={handleQuickReplay}
            />

            {/* Score HUD Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Live Score:</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  {score.toLocaleString()} <span className="text-xs text-amber-500">pts</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                <span>Hits: <strong className="text-cyan-300">{hits}</strong></span>
                <span>Misses: <strong className="text-rose-400">{misses}</strong></span>
              </div>
            </div>

            {/* Core Interactive Game Arena */}
            <GameBoard
              targets={targets}
              floatingTexts={floatingTexts}
              particles={particles}
              difficulty={difficulty}
              timeRemaining={timeRemaining}
              screenShake={screenShake}
              onTargetClick={handleTargetClick}
              onBoardMissClick={handleBoardMissClick}
            />
          </div>
        )}
      </main>

      {/* MODAL 1: GAME OVER SUMMARY */}
      <GameOverModal
        isOpen={status === 'GAME_OVER'}
        score={score}
        hits={hits}
        misses={misses}
        maxCombo={maxCombo}
        difficulty={difficulty}
        playerName={profile.name}
        avatar={profile.avatar}
        rank={lastRank}
        isNewHighScore={isNewHighScore}
        roomCode={roomCode}
        onPlayAgain={() => {
          setStatus('READY');
          setReadyCountdown(3);
        }}
        onChangeDifficulty={() => setStatus('NAME_INPUT')}
        onOpenLeaderboard={() => {
          setStatus('NAME_INPUT');
          setIsLeaderboardOpen(true);
        }}
      />

      {/* MODAL 2: LIVE SCOREBOARD / LEADERBOARD */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        currentPlayerName={profile.name}
        currentRoomCode={roomCode}
        onRefreshEntries={setLeaderboard}
      />

      {/* MODAL 3: TUTORIAL / HOW TO PLAY */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* MODAL 4: PLAYER STATS & PROFILE */}
      <GameHubStats
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      {/* MODAL 5: MULTIPLAYER ROOM & PUBLIC LINK SHARE */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        currentRoomCode={roomCode}
        onRoomChange={(newCode) => {
          setRoomCode(newCode);
          setRoomCodeInURL(newCode);
          fetchScoresFromServer(newCode).then(setLeaderboard);
        }}
      />
    </div>
  );
}
