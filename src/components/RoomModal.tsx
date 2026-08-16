import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, ExternalLink, X, ShieldCheck, Sparkles, Hash } from 'lucide-react';
import { getShareableRoomURL, setRoomCodeInURL } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomCode: string;
  onRoomChange: (newRoomCode: string) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  currentRoomCode,
  onRoomChange,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState(currentRoomCode);

  const shareableUrl = getShareableRoomURL(currentRoomCode);

  const handleCopyLink = () => {
    soundManager.playButtonClick();
    try {
      navigator.clipboard.writeText(shareableUrl);
    } catch {
      // Fallback
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    soundManager.playButtonClick();
    try {
      navigator.clipboard.writeText(currentRoomCode);
    } catch {
      // Fallback
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomInput.trim()) return;
    soundManager.playButtonClick();
    const cleanCode = customRoomInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setRoomCodeInURL(cleanCode);
    onRoomChange(cleanCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                Multiplayer Room Center
              </h2>
              <p className="text-xs text-slate-400">Compete live with friends in the same room</p>
            </div>
          </div>

          {/* Active Room Code Card */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" /> Current Room Code
              </span>
              <span className="text-2xl font-black font-mono tracking-wider text-cyan-300">
                {currentRoomCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" /> Copy Code
                </>
              )}
            </button>
          </div>

          {/* Room URL Box */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Room URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join or Switch Custom Room Code */}
          <form onSubmit={handleJoinCustomRoom} className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Enter Room Code To Join
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={20}
                value={customRoomInput}
                onChange={(e) => setCustomRoomInput(e.target.value)}
                placeholder="e.g. ALPHA-ROOM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm uppercase focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-all shadow-md active:scale-95"
              >
                Join Room
              </button>
            </div>
          </form>

          {/* Open in New Window Link */}
          <div className="mt-6 flex justify-end">
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Open room link in new browser window <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
