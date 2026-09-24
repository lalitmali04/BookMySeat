import React from 'react';
import { useCity, POPULAR_CITIES } from '../context/CityContext';
import { MapPin, X, Check } from 'lucide-react';

export const CityModal: React.FC = () => {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, setSelectedCity } = useCity();

  if (!isCityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500"></div>

        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Select Your City</h3>
              <p className="text-xs text-slate-400">Discover movies, IMAX shows, and live events in your area</p>
            </div>
          </div>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Cities Grid */}
        <div className="mt-6">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Popular Metro Regions</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{city.icon}</span>
                  <span className="font-semibold text-sm">{city.name}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">{city.state}</span>
                  {isSelected && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>Prices and seat configurations dynamically adapt to selected venue.</span>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="text-rose-400 hover:text-rose-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
