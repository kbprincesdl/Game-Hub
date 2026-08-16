import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  accuracy: number;
  maxCombo: number;
  hits: number;
  date: string;
  timestamp: number;
  roomCode?: string;
}

// In-memory store holding only real submitted player scores
let globalScores: LeaderboardEntry[] = [];

// Remove any dummy sample bots if any exist
const isSampleEntry = (entry: LeaderboardEntry): boolean => {
  if (!entry) return true;
  if (entry.id && entry.id.startsWith('sample-')) return true;
  const dummyNames = ['cyberviper', 'auraknight', 'novarider', 'pixelpulse', 'zenmaster'];
  if (dummyNames.includes((entry.playerName || '').trim().toLowerCase())) return true;
  return false;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Get scores (optionally filter by room)
  app.get('/api/scores', (req, res) => {
    const room = req.query.room ? String(req.query.room).trim().toUpperCase() : null;

    // Purge any dummy records
    globalScores = globalScores.filter((s) => !isSampleEntry(s));

    let results = [...globalScores];
    if (room && room !== 'ALL') {
      results = results.filter(
        (s) => s.roomCode && s.roomCode.toUpperCase() === room
      );
    }

    results.sort((a, b) => b.score - a.score);
    res.json({
      success: true,
      count: results.length,
      scores: results.slice(0, 200),
      allScores: globalScores.slice(0, 200),
    });
  });

  // API Route: Submit new score from any player / device
  app.post('/api/scores', (req, res) => {
    const {
      playerName,
      avatar,
      score,
      difficulty,
      accuracy,
      maxCombo,
      hits,
      roomCode,
    } = req.body;

    if (!playerName || typeof score !== 'number') {
      return res.status(400).json({ success: false, error: 'Missing playerName or score' });
    }

    const cleanRoom = roomCode ? String(roomCode).trim().toUpperCase() : 'PUBLIC-ROOM';

    const newEntry: LeaderboardEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerName: String(playerName).trim().slice(0, 25),
      avatar: avatar || '⚡',
      score: Math.max(0, Math.round(score)),
      difficulty: ['EASY', 'MEDIUM', 'HARD', 'INSANE'].includes(difficulty)
        ? difficulty
        : 'MEDIUM',
      accuracy: Math.min(100, Math.max(0, Math.round(accuracy || 0))),
      maxCombo: Math.max(0, Math.round(maxCombo || 0)),
      hits: Math.max(0, Math.round(hits || 0)),
      date: 'Just now',
      timestamp: Date.now(),
      roomCode: cleanRoom,
    };

    // Prepend and keep top 200 scores (filtering out any old sample entries)
    globalScores = [newEntry, ...globalScores.filter((s) => !isSampleEntry(s))]
      .sort((a, b) => b.score - a.score)
      .slice(0, 200);

    // Calculate rank in room and global
    const roomScores = globalScores.filter(
      (s) => s.roomCode && s.roomCode.toUpperCase() === cleanRoom
    );
    const roomRank = roomScores.findIndex((s) => s.id === newEntry.id) + 1;
    const globalRank = globalScores.findIndex((s) => s.id === newEntry.id) + 1;

    res.json({
      success: true,
      entry: newEntry,
      roomRank: roomRank > 0 ? roomRank : 1,
      globalRank: globalRank > 0 ? globalRank : 1,
      scores: globalScores,
    });
  });

  // API Route: Reset scores completely to empty
  app.post('/api/scores/reset', (req, res) => {
    globalScores = [];
    res.json({ success: true, scores: [] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
