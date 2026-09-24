import React from 'react';

export const CinemaScreen: React.FC<{ format?: string }> = ({ format = 'IMAX LASER 3D' }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto my-10 flex flex-col items-center">
      {/* Screen Curved Beam Glow */}
      <div className="w-full h-3 bg-gradient-to-r from-rose-500/20 via-rose-500 to-rose-500/20 rounded-[50%] shadow-[0_-15px_30px_rgba(244,63,94,0.4)]"></div>
      
      {/* Curved Screen Border */}
      <div className="w-full h-8 border-t-2 border-slate-700/80 rounded-[50%/100%_100%_0_0] bg-gradient-to-b from-slate-800/40 to-transparent -mt-2"></div>

      {/* Screen Text */}
      <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        {format} • ALL EYES THIS WAY • SCREEN
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
      </div>
    </div>
  );
};
