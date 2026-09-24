import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Star, Clock, Ticket, Play } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer?: (url: string, title: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onWatchTrailer }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 hover:-translate-y-1 flex flex-col">
      {/* Poster Image with Overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {movie.is_trending && (
            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-rose-600/30">
              Trending 🔥
            </span>
          )}
          <span className="ml-auto px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {movie.rating}
          </span>
        </div>

        {/* Hover Trailer Overlay Button */}
        {onWatchTrailer && movie.trailer_url && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWatchTrailer(movie.trailer_url, movie.title);
              }}
              className="px-4 py-2 rounded-2xl bg-white/15 hover:bg-rose-600 border border-white/20 hover:border-rose-500 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-xl cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Trailer
            </button>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Language & Duration */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-semibold">
              {movie.language}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {movie.duration}
            </span>
          </div>

          {/* Title */}
          <Link to={`/movie/${movie.id}`}>
            <h3 className="text-base font-bold text-white leading-snug group-hover:text-rose-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Genres */}
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            {Array.isArray(movie.genres) ? movie.genres.join(' • ') : movie.genres}
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group/btn"
          >
            <Ticket className="w-3.5 h-3.5 text-rose-400 group-hover/btn:text-white transition" />
            Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
};
