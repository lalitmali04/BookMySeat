import React from 'react';
import { Compass, Speaker, DoorOpen, Eye } from 'lucide-react';

interface CinemaVenueLayoutProps {
  theatreName: string;
  screenName: string;
  format: string;
  selectedSeatsCount: number;
}

export const CinemaVenueLayout: React.FC<CinemaVenueLayoutProps> = ({
  theatreName,
  screenName,
  format
}) => {
  return (
    <div className="studio-glass rounded-3xl p-5 mb-8 shadow-xl border border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Auditorium Blueprint & Tier Layout
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                {format}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {theatreName} • {screenName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Optimal Eye-Level: <strong className="text-white">Rows C, D & E (Prime Tier)</strong></span>
        </div>
      </div>

      {/* Hall Blueprint Diagram */}
      <div className="mt-4 p-4 rounded-2xl bg-[#060912]/80 border border-white/[0.06] relative overflow-hidden">
        {/* Surround Sound Array Indicators */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-medium mb-3">
          <span className="flex items-center gap-1.5 text-indigo-300">
            <Speaker className="w-3 h-3 text-indigo-400" /> Dolby Atmos Left Surround
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300">
            <Speaker className="w-3 h-3 text-indigo-400" /> Dolby Atmos Right Surround
          </span>
        </div>

        {/* Stage & Tier Cards */}
        <div className="max-w-md mx-auto pt-2 pb-2 text-center">
          <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-rose-500/20 via-rose-500 to-rose-500/20 rounded-full shadow-md shadow-rose-500/20 mb-1" />
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">
            ▲ CINEMA SCREEN (FRONT) ▲
          </span>

          {/* Tier Zone Legend */}
          <div className="grid grid-cols-1 gap-2 mt-4 text-xs font-semibold">
            <div className="p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Rows A & B: VIP Recliner Lounges</span>
              </div>
              <span className="text-[11px] text-slate-400">₹450 • Extra Legroom & Recline</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Rows C, D & E: Prime Sound Horizon</span>
              </div>
              <span className="text-[11px] text-slate-400">₹280 • Optimal Immersion</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Rows F, G & H: Classic Tier</span>
              </div>
              <span className="text-[11px] text-slate-400">₹180 • Standard Multiplex</span>
            </div>
          </div>

          {/* Hall Entry & Exit Doors */}
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 px-2 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <DoorOpen className="w-3.5 h-3.5" /> Entry Gate 1 (Left)
            </span>
            <span className="text-slate-400">Center Aisle Walkway</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <DoorOpen className="w-3.5 h-3.5" /> Exit Gate 2 (Right)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
