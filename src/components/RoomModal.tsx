import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, ExternalLink, X, ShieldCheck, Sparkles } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState(currentRoomCode);

  const shareableUrl = getShareableRoomURL(currentRoomCode);

  const handleCopyLink = () => {
    soundManager.playButtonClick();
    try {
      navigator.clipboard.writeText(shareableUrl);
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
                Multiplayer Room Link
              </h2>
              <p className="text-xs text-slate-400">Share with friends to compete on the same board</p>
            </div>
          </div>

          {/* Public Access Guarantee Alert Box */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-200">Public Link Ready (No 403 Errors)</span>
              This link uses the public domain (<code className="font-mono text-emerald-400">ais-pre-...</code>), allowing any player to open it directly in any browser window or mobile device.
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Public Room Invite Link
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
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Create/Join Custom Room Code */}
          <form onSubmit={handleJoinCustomRoom} className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch / Create Custom Room Code
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
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs shrink-0 transition-all"
              >
                Switch Room
              </button>
            </div>
          </form>

          {/* Open in New Tab Button */}
          <div className="mt-6 flex justify-end">
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Open in new browser window <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
