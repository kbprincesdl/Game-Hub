import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Clock, ShieldAlert, Star, Ghost } from 'lucide-react';
import { TargetNode, FloatingText, Particle, DifficultyLevel } from '../types';

interface GameBoardProps {
  targets: TargetNode[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  difficulty: DifficultyLevel;
  timeRemaining: number;
  screenShake: boolean;
  onTargetClick: (target: TargetNode, e: React.MouseEvent) => void;
  onBoardMissClick: (e: React.MouseEvent) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  targets,
  floatingTexts,
  particles,
  difficulty,
  timeRemaining,
  screenShake,
  onTargetClick,
  onBoardMissClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render particles on HTML5 Canvas overlay for maximum 60fps smoothness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [particles]);

  const handleBoardClick = (e: React.MouseEvent) => {
    // Only register miss if clicked strictly on background, not on a target node
    if ((e.target as HTMLElement).closest('.game-target-node')) {
      return;
    }
    onBoardMissClick(e);
  };

  return (
    <div
      id="game-board-container"
      onClick={handleBoardClick}
      className={`relative w-full aspect-[4/3] max-h-[560px] bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl cursor-crosshair select-none transition-transform ${
        screenShake ? 'animate-shake border-rose-500/80 shadow-rose-500/30' : ''
      }`}
    >
      {/* Background Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Canvas Particle Effect Overlay */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Target Nodes Layer */}
      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {targets.map((target) => {
            const timeLeftRatio = Math.max(0, (target.expiresAt - Date.now()) / (target.expiresAt - target.createdAt));

            return (
              <motion.div
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTargetClick(target, e);
                }}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="game-target-node absolute flex items-center justify-center cursor-pointer group"
              >
                {/* STANDARD TARGET */}
                {target.type === 'STANDARD' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                    {/* Expiry Shrinking Ring */}
                    <div
                      style={{ transform: `scale(${timeLeftRatio})` }}
                      className="absolute inset-1 rounded-full bg-cyan-400/30 border border-cyan-300 transition-transform duration-75 pointer-events-none"
                    />
                    <Target className="w-1/2 h-1/2 text-cyan-300 relative z-10 animate-pulse" />
                  </div>
                )}

                {/* GOLDEN TARGET */}
                {target.type === 'GOLDEN' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-amber-500/30 border-2 border-yellow-300 shadow-xl shadow-amber-500/50 group-hover:scale-110 transition-transform animate-spin" style={{ animationDuration: '8s' }}>
                    <div
                      style={{ transform: `scale(${timeLeftRatio})` }}
                      className="absolute inset-1 rounded-full bg-yellow-400/30 border border-yellow-200 transition-transform duration-75 pointer-events-none"
                    />
                    <Star className="w-3/5 h-3/5 text-yellow-300 fill-yellow-400 relative z-10" />
                  </div>
                )}

                {/* HAZARD BOMB TARGET */}
                {target.type === 'HAZARD' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-rose-500/30 border-2 border-rose-500 shadow-xl shadow-rose-500/60 group-hover:scale-110 transition-transform animate-ping" style={{ animationDuration: '2s' }}>
                    <ShieldAlert className="w-3/5 h-3/5 text-rose-400 relative z-10" />
                  </div>
                )}

                {/* TIME BONUS TARGET */}
                {target.type === 'TIME_BONUS' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-emerald-500/30 border-2 border-emerald-400 shadow-xl shadow-emerald-500/50 group-hover:scale-110 transition-transform">
                    <Clock className="w-3/5 h-3/5 text-emerald-300 relative z-10 animate-bounce" />
                  </div>
                )}

                {/* MULTIPLIER STAR */}
                {target.type === 'MULTIPLIER' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-fuchsia-500/30 border-2 border-fuchsia-400 shadow-xl shadow-fuchsia-500/50 group-hover:scale-110 transition-transform">
                    <Zap className="w-3/5 h-3/5 text-fuchsia-300 relative z-10 fill-fuchsia-400" />
                  </div>
                )}

                {/* DECOY GHOST */}
                {target.type === 'DECOY' && (
                  <div className="relative w-full h-full flex items-center justify-center rounded-full bg-purple-500/20 border-2 border-purple-400/80 shadow-md shadow-purple-500/30 opacity-80 animate-pulse">
                    <Ghost className="w-3/5 h-3/5 text-purple-300 relative z-10" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Scores & Combo FX Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {floatingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: item.y, scale: 0.8 }}
              animate={{ opacity: 0, y: item.y - 45, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute font-black text-base sm:text-xl tracking-tight drop-shadow-md ${item.color}`}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
