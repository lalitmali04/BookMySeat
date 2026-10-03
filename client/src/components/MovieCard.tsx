import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Star, Clock, Ticket, Play, Sparkles } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer?: (url: string, title: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onWatchTrailer }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-[#0c111e]/80 border border-white/[0.08] hover:border-rose-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.8),0_0_20px_-3px_rgba(225,29,72,0.25)] hover:-translate-y-1.5 flex flex-col">
      {/* Poster Media with Hover Zoom */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#06080f]">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Top Shadow Overlay for Badges */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {movie.is_trending ? (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-rose-600/40 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Trending
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-200 uppercase tracking-wide">
              {movie.certificate || 'UA'}
            </span>
          )}

          <span className="ml-auto px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{movie.rating}</span>
          </span>
        </div>

        {/* Format Pill (IMAX / 2D / 3D) */}
        <div className="absolute bottom-2.5 left-2.5 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-rose-300 tracking-wider">
            {movie.category === 'event' ? 'LIVE STAGE' : 'IMAX 2D'}
          </span>
        </div>

        {/* Hover Trailer Trigger Overlay */}
        {onWatchTrailer && movie.trailer_url && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWatchTrailer(movie.trailer_url, movie.title);
              }}
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-rose-600 border border-white/20 hover:border-rose-500 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-xl cursor-pointer transform hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Watch Trailer
            </button>
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-[#070b14]">
        <div>
          {/* Language & Duration specs */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-medium">
            <span className="text-slate-300 font-semibold">{movie.language}</span>
            <span className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Clock className="w-3 h-3" /> {movie.duration}
            </span>
          </div>

          {/* Title */}
          <Link to={`/movie/${movie.id}`}>
            <h3 className="text-sm font-bold text-white leading-tight group-hover:text-rose-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Genre line */}
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            {Array.isArray(movie.genres) ? movie.genres.join(' • ') : movie.genres}
          </p>
        </div>

        {/* Quick Booking CTA */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-rose-600 border border-white/[0.08] hover:border-rose-500 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group/btn shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 text-rose-400 group-hover/btn:text-white transition" />
            Book Seats
          </button>
        </div>
      </div>
    </div>
  );
};
