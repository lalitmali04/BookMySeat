import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seat } from '../../types';
import { Timer, ArrowRight, ShieldCheck, Armchair } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Selected Seats Summary */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div className="flex-1 sm:flex-initial">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected:
              </span>
              <span className="text-sm font-black text-rose-400">{seatLabels}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>Total Price: <strong className="text-white text-base font-extrabold">₹{totalAmount}</strong></span>
              <span className="text-slate-400">• Taxes & Fees calculated at checkout</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Redis Hold Countdown & CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {lockExpiresAt && remainingSeconds > 0 && (
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
              isTimerExpiringSoon
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-amber-400'
            }`}>
              <Timer className="w-4 h-4" />
              <div className="text-xs font-mono font-bold">
                Hold: <span className="text-white">{formatTimer(remainingSeconds)}</span>
              </div>
            </div>
          )}

          <button
            onClick={onProceed}
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? 'Validating Hold...' : 'Proceed to Pay'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
