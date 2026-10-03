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
    stateClasses = 'bg-[#0a0e1a]/60 border-white/[0.04] text-slate-700 cursor-not-allowed pointer-events-none opacity-40';
  } else if (isLockedByOther) {
    stateClasses = 'bg-amber-500/10 border-amber-500/40 text-amber-300 cursor-not-allowed animate-pulse shadow-sm';
    icon = <Lock className="w-2.5 h-2.5 text-amber-400" />;
  } else if (isSelected || seat.isLockedByMe) {
    stateClasses = 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-110 ring-2 ring-rose-400/80 font-bold z-10';
    icon = <Check className="w-3.5 h-3.5 stroke-[3]" />;
  } else {
    // Available styles based on Category Tier
    if (seat.category === 'RECLINER') {
      stateClasses = 'bg-amber-500/[0.08] border-amber-500/30 text-amber-200 hover:border-amber-400 hover:bg-amber-500/25 hover:scale-110 hover:shadow-md';
    } else if (seat.category === 'PRIME') {
      stateClasses = 'bg-indigo-500/[0.08] border-indigo-500/30 text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/25 hover:scale-110 hover:shadow-md';
    } else {
      stateClasses = 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:border-rose-400/80 hover:text-white hover:bg-rose-600/20 hover:scale-110 hover:shadow-md';
    }
  }

  const tooltipText = isBooked
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Booked`
    : isLockedByOther
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Locked by another customer`
    : isSelected || seat.isLockedByMe
    ? `Seat ${seat.rowLabel}${seat.seatNumber} • Selected by you (₹${seat.price})`
    : `Seat ${seat.rowLabel}${seat.seatNumber} • ${seat.category} • ₹${seat.price}`;

  return (
    <button
      type="button"
      title={tooltipText}
      aria-label={tooltipText}
      disabled={isBooked || isLockedByOther || disabled}
      onClick={() => onToggle(seat)}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-center transition-all duration-150 cursor-pointer ${stateClasses}`}
    >
      {icon ? icon : seat.seatNumber}
    </button>
  );
};
