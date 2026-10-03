import React from 'react';

export const CinemaScreen: React.FC<{ format?: string }> = ({ format = 'IMAX LASER 3D' }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto my-12 flex flex-col items-center select-none">
      {/* Curved Screen Glowing Light Beam */}
      <div className="w-full h-3 bg-gradient-to-r from-transparent via-rose-500/80 to-transparent rounded-[50%] cinema-screen-glow" />
      
      {/* Curved Screen Projection Surface */}
      <div className="w-full h-7 border-t-2 border-white/20 rounded-[50%/100%_100%_0_0] bg-gradient-to-b from-white/[0.08] to-transparent -mt-1.5" />

      {/* Screen Identification Text */}
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400 mt-2.5 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
        <span>{format} • AUDITORIUM SCREEN</span>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
      </div>
    </div>
  );
};
