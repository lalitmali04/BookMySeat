import React from 'react';
import { useCity, POPULAR_CITIES } from '../context/CityContext';
import { MapPin, X, Check, Sparkles } from 'lucide-react';

export const CityModal: React.FC = () => {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, setSelectedCity } = useCity();

  if (!isCityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c111e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Top Accent Rim */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-500 border border-rose-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Select Cinema Region</h3>
              <p className="text-xs text-slate-400">Discover IMAX showtimes, auditorium formats, and live tours near you</p>
            </div>
          </div>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close City Selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Cities Grid */}
        <div className="mt-6">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> Popular Metropolitan Regions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                      : 'bg-white/[0.03] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.07] text-slate-300'
                  }`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{city.icon}</span>
                  <span className="font-bold text-sm text-white">{city.name}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{city.state}</span>
                  {isSelected && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-rose-400">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span>Showtimes and seat inventories adapt to your chosen location.</span>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
