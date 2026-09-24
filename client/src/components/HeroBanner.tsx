import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Star, Play, Ticket, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  featuredMovies: Movie[];
  onWatchTrailer: (url: string, title: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredMovies, onWatchTrailer }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const current = featuredMovies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl mb-12">
      {/* Background Backdrop with Cinema Gradient */}
      <div className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[500px] w-full flex items-center">
        <img
          src={current.backdrop_url}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 md:opacity-50 transition-opacity duration-700"
        />

        {/* Ambient Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-10 md:p-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" /> Featured Premiere
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {current.rating} ({current.votes?.toLocaleString() || '10k+'} votes)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            {current.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-200">
              {current.language}
            </span>
            <span>•</span>
            <span>{Array.isArray(current.genres) ? current.genres.join(', ') : current.genres}</span>
            <span>•</span>
            <span>{current.duration}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed max-w-xl">
            {current.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/movie/${current.id}`)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" /> Book Tickets Now
            </button>
            {current.trailer_url && (
              <button
                onClick={() => onWatchTrailer(current.trailer_url, current.title)}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* Arrow Navigation */}
        {featuredMovies.length > 1 && (
          <div className="absolute right-6 bottom-6 flex items-center gap-2 z-10">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Carousel Indicators */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-rose-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
