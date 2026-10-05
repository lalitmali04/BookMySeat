import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Star, Play, Ticket, ChevronLeft, ChevronRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

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
    }, 8000);
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
    <div className="relative w-full rounded-3xl overflow-hidden studio-glass border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(225,29,72,0.12)] mb-12 group/hero backdrop-blur-xl">
      {/* Background Media with Gradient Mask allowing 3D background on right side */}
      <div className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[560px] w-full flex items-center">
        <img
          src={current.backdrop_url}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 group-hover/hero:scale-105 transition-all duration-1000 ease-out"
        />

        {/* Studio Layering: Dark on left for ultra-crisp typography, translucent on right for 3D Hero */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/95 via-[#05070d]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(225,29,72,0.18),transparent_60%)]" />

        {/* Hero Spotlight Content */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-10 md:p-14 flex flex-col justify-center">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Studio Premiere
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {current.rating}
              <span className="text-slate-400 text-[10px] font-normal">({current.votes?.toLocaleString() || '12.4k'} reviews)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {current.certificate || 'UA 16+'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-3 drop-shadow-lg">
            {current.title}
          </h1>

          {/* Formats & Genre Specs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-600/25 border border-rose-500/40 text-rose-200 font-bold text-[11px]">
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
              className="px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-600/35 hover:shadow-rose-600/55 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4" /> Book Tickets
            </button>
            {current.trailer_url && (
              <button
                onClick={() => onWatchTrailer(current.trailer_url, current.title)}
                className="px-6 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 backdrop-blur-md cursor-pointer hover:border-white/30"
              >
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* 3D Interactive Perspective Badge (Right Side) */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-end pointer-events-none z-10">
          <div className="p-3.5 rounded-2xl studio-glass border border-rose-500/30 text-right backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 3D Live Engine
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">Spider-Man Suit Sync</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scroll-linked WebGL 60FPS
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        {featuredMovies.length > 1 && (
          <div className="absolute right-6 bottom-6 hidden sm:flex items-center gap-2 z-20">
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-slate-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous Featured Movie"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-slate-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95"
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

