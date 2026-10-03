import React, { useState, useEffect } from 'react';
import { Seat } from '../../types';
import { Timer, ArrowRight, Armchair, ShieldCheck } from 'lucide-react';

interface StickyBookingBarProps {
  showId: string;
  selectedSeats: Seat[];
  lockExpiresAt: number | null;
  onLockExpired: () => void;
  onProceed: () => void;
  loading?: boolean;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({
  showId,
  selectedSeats,
  lockExpiresAt,
  onLockExpired,
  onProceed,
  loading = false
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    if (!lockExpiresAt || selectedSeats.length === 0) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((lockExpiresAt - now) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        onLockExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt, selectedSeats.length, onLockExpired]);

  if (selectedSeats.length === 0) return null;

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const seatLabels = selectedSeats.map(s => `${s.rowLabel}${s.seatNumber}`).join(', ');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimerExpiringSoon = remainingSeconds <= 60 && remainingSeconds > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#05070d]/92 backdrop-blur-2xl border-t border-white/[0.1] p-4 sm:p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Selected Seats Summary */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
            <Armchair className="w-6 h-6" />
          </div>
          <div className="flex-1 sm:flex-initial">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected:
              </span>
              <span className="text-sm font-black text-rose-400 font-mono tracking-wide">{seatLabels}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>Total: <strong className="text-white text-base font-black">₹{totalAmount}</strong></span>
              <span className="text-slate-400 hidden md:inline">• Base price excl. taxes</span>
            </div>
          </div>
        </div>

        {/* Right: Redis Lock Timer Badge & Checkout Button */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {lockExpiresAt && remainingSeconds > 0 && (
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
              isTimerExpiringSoon
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-white/[0.04] border-white/10 text-amber-300'
            }`}>
              <Timer className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-mono font-bold">
                Hold: <span className="text-white">{formatTimer(remainingSeconds)}</span>
              </div>
            </div>
          )}

          <button
            onClick={onProceed}
            disabled={loading}
            className="px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? 'Verifying Hold...' : 'Proceed to Payment'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
