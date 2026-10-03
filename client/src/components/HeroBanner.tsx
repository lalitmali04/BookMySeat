import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Star, Play, Ticket, ChevronLeft, ChevronRight, Sparkles, Volume2, Film } from 'lucide-react';

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
    }, 7000);
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
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#0a0f1d] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-12 group/hero">
      {/* Background Backdrop with Studio Lighting Gradient */}
      <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[540px] w-full flex items-center">
        <img
          src={current.backdrop_url}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-100 group-hover/hero:scale-105 transition-all duration-1000 ease-out"
        />

        {/* Ambient Dark Gradient Layering for High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070d] via-[#05070d]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(225,29,72,0.15),transparent_60%)]" />

        {/* Hero Spotlight Content */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-10 md:p-14 flex flex-col justify-center">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Studio Premiere
            </span>
            <span className="px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {current.rating}
              <span className="text-slate-400 text-[10px] font-normal">({current.votes?.toLocaleString() || '12.4k'} votes)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {current.certificate || 'UA 16+'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-3 drop-shadow-md">
            {current.title}
          </h1>

          {/* Formats & Genre Specs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 font-bold text-[11px]">
              IMAX 3D
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.06] text-slate-200">
              {current.language}
            </span>
            <span className="text-slate-500">•</span>
            <span>{Array.isArray(current.genres) ? current.genres.join(', ') : current.genres}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{current.duration}</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 mb-8 leading-relaxed max-w-xl font-normal">
            {current.description}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => navigate(`/movie/${current.id}`)}
              className="px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4" /> Book Tickets
            </button>
            {current.trailer_url && (
              <button
                onClick={() => onWatchTrailer(current.trailer_url, current.title)}
                className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 backdrop-blur-md cursor-pointer hover:border-white/20"
              >
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        {featuredMovies.length > 1 && (
          <div className="absolute right-6 bottom-6 hidden sm:flex items-center gap-2 z-20">
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl bg-black/40 hover:bg-black/70 text-slate-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous Featured Movie"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl bg-black/40 hover:bg-black/70 text-slate-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Next Featured Movie"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Carousel Indicators */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                  idx === currentIndex ? 'w-8 bg-rose-500 shadow-sm shadow-rose-500' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
