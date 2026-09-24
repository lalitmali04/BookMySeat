import React from 'react';
import { Seat } from '../../types';
import { Lock, Check } from 'lucide-react';

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  onToggle: (seat: Seat) => void;
  disabled?: boolean;
}

export const SeatButton: React.FC<SeatButtonProps> = ({ seat, isSelected, onToggle, disabled }) => {
  const isBooked = seat.status === 'BOOKED';
  const isLockedByOther = seat.status === 'LOCKED' && !seat.isLockedByMe;

  let stateClasses = '';
  let icon = null;

  if (isBooked) {
    stateClasses = 'bg-slate-800/60 border-slate-800 text-slate-600 cursor-not-allowed';
  } else if (isLockedByOther) {
    stateClasses = 'bg-amber-500/15 border-amber-500/50 text-amber-400 cursor-not-allowed animate-pulse shadow-md shadow-amber-500/10';
    icon = <Lock className="w-2.5 h-2.5" />;
  } else if (isSelected || seat.isLockedByMe) {
    stateClasses = 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40 scale-105 ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950 font-bold';
    icon = <Check className="w-3 h-3" />;
  } else {
    // Available styles based on Category
    if (seat.category === 'RECLINER') {
      stateClasses = 'bg-amber-950/20 border-amber-500/40 text-amber-200 hover:border-amber-400 hover:bg-amber-500/20 hover:scale-110';
    } else if (seat.category === 'PRIME') {
      stateClasses = 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/20 hover:scale-110';
    } else {
      stateClasses = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-400 hover:text-white hover:bg-slate-800 hover:scale-110';
    }
  }

  const tooltipText = isBooked
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Already Booked`
    : isLockedByOther
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Temporarily locked by another user`
    : isSelected || seat.isLockedByMe
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Held by you (₹${seat.price})`
    : `Seat ${seat.rowLabel}${seat.seatNumber} • ${seat.category} • ₹${seat.price}`;

  return (
    <button
      type="button"
      title={tooltipText}
      disabled={isBooked || isLockedByOther || disabled}
      onClick={() => onToggle(seat)}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer ${stateClasses}`}
    >
      {icon ? icon : seat.seatNumber}
    </button>
  );
};
