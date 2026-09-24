import React from 'react';
import { Tv, Speaker, DoorOpen, Compass, Eye, ShieldCheck } from 'lucide-react';

interface CinemaVenueLayoutProps {
  theatreName: string;
  screenName: string;
  format: string;
  selectedSeatsCount: number;
}

export const CinemaVenueLayout: React.FC<CinemaVenueLayoutProps> = ({
  theatreName,
  screenName,
  format,
  selectedSeatsCount
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Cinema Seating & Venue Layout Overview
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300">
                {format}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {theatreName} • {screenName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Optimal Eye-Level: <strong className="text-slate-200">Rows C, D & E (Prime Tier)</strong></span>
        </div>
      </div>

      {/* Hall Blueprint Diagram */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
        {/* Surround Speaker Positions */}
        <div className="absolute top-2 left-4 text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
          <Speaker className="w-3.5 h-3.5 text-indigo-400" /> Dolby Atmos Left Array
        </div>
        <div className="absolute top-2 right-4 text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
          <Speaker className="w-3.5 h-3.5 text-indigo-400" /> Dolby Atmos Right Array
        </div>

        {/* Mini Cinema Stage Blueprint */}
        <div className="max-w-md mx-auto pt-6 pb-2 text-center">
          {/* Mini Curved Screen */}
          <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-rose-500/30 via-rose-500 to-rose-500/30 rounded-full shadow-md shadow-rose-500/20 mb-1"></div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">▲ CINEMA SCREEN (FRONT) ▲</span>

          {/* Tier Zone Indicators */}
          <div className="grid grid-cols-1 gap-2 mt-4 text-xs font-semibold">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Rows A & B: VIP Recliner Lounges</span>
              </div>
              <span className="text-[11px] text-slate-400">₹450 • Top Luxury & Legroom</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Rows C, D & E: Prime Sound Horizon</span>
              </div>
              <span className="text-[11px] text-slate-400">₹280 • Optimal Screen Immersion</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Rows F, G & H: Classic Multiplex</span>
              </div>
              <span className="text-[11px] text-slate-400">₹180 • Standard Seating</span>
            </div>
          </div>

          {/* Gates & Aisles */}
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 px-2 font-medium">
            <span className="flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> Entry Gate 1 (Left Aisle)
            </span>
            <span className="text-slate-400">Center Aisle (Wheelchair Accessible)</span>
            <span className="flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-emerald-400" /> Exit Gate 2 (Right Aisle)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
