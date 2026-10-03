import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Movie, TheatreWithShows, ShowSlot } from '../types';
import { useCity } from '../context/CityContext';
import { TrailerModal } from '../components/TrailerModal';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Play,
  Ticket,
  ChevronRight,
  Sparkles,
  Film,
  Award,
  CheckCircle2,
  Share2,
  Heart,
  Volume2,
  Tv,
  Users
} from 'lucide-react';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<TheatreWithShows[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');

  // Trailer Modal State
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Generate next 6 dates for the date picker
  const dates = [0, 1, 2, 3, 4, 5].map(offset => {
    const d = new Date(Date.now() + offset * 86400000);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'TODAY' : offset === 1 ? 'TOMORROW' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    };
  });

  useEffect(() => {
    if (!id) return;
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.getMovieById(id),
          api.getShowsForMovie(id, selectedDate, selectedCity)
        ]);
        setMovie(movieRes.movie);
        setTheatres(showsRes.theatres || []);
      } catch {
        // Fallback or error handled
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, selectedDate, selectedCity]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading cinema showtimes and format availability...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen py-24 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Movie Experience Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested title is not currently screening in {selectedCity}.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
        >
          Explore All Titles
        </button>
      </div>
    );
  }

  const handleShowSelect = (show: ShowSlot) => {
    if (show.statusBadge === 'Sold Out') return;
    navigate(`/seat-selection/${show.id}`);
  };

  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-28">
      {/* 1. Full-Bleed IMAX Hero Spotlight Showcase */}
      <div className="relative w-full min-h-[520px] md:min-h-[580px] flex items-center overflow-hidden border-b border-white/[0.08]">
        
        {/* Backdrop Visual with High Dynamic Range Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover object-center opacity-50 scale-100 transform motion-safe:animate-in motion-safe:zoom-in-105 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070d] via-[#05070d]/80 to-[#05070d]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,0.25),transparent_60%)]" />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start md:items-center">
            
            {/* Poster Card with Studio Border */}
            <div className="relative w-56 sm:w-64 md:w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(225,29,72,0.2)] border border-white/15 shrink-0 mx-auto md:mx-0 group">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              
              {/* Play Trailer Floating Overlay */}
              {movie.trailer_url && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-4"
                  aria-label="Play Trailer"
                >
                  <span className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-2xl shadow-rose-600/50 hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 fill-white" /> Watch Trailer
                  </span>
                </button>
              )}

              {/* Format Badge On Poster */}
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-black text-rose-300 tracking-wider uppercase">
                  {movie.category === 'event' ? 'LIVE EVENT' : 'IMAX 3D'}
                </span>
              </div>
            </div>

            {/* Movie Description & Specifications */}
            <div className="flex-1 text-center md:text-left">
              
              {/* Top Tags & Rating Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-extrabold uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {movie.category === 'event' ? 'Live Stage Concert' : 'Now in Multiplexes'}
                </span>

                <span className="px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating} / 10</span>
                  <span className="text-slate-400 text-[10px] font-medium">({movie.votes?.toLocaleString() || '18.5k'} votes)</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300 uppercase">
                  {movie.certificate || 'UA 16+'}
                </span>
              </div>

              {/* Main Movie Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                {movie.title}
              </h1>

              {/* Format & Runtime Specs */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-semibold text-slate-300 mb-5">
                <span className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 font-bold">
                  IMAX Laser 3D
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200">
                  {movie.language}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-300">{Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-slate-300"><Clock className="w-3.5 h-3.5 text-rose-400" /> {movie.duration}</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-slate-300"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {movie.release_date}</span>
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-3xl mb-8 font-normal">
                {movie.description}
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2 border-t border-white/[0.08]">
                <button
                  onClick={scrollToBooking}
                  className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/40 hover:shadow-rose-600/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" /> Select Cinema & Seats
                </button>

                {movie.trailer_url && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Watch Official Trailer
                  </button>
                )}

                <div className="text-xs text-slate-400 hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">DIRECTED BY</span>
                  <span className="font-bold text-white text-sm">{movie.director}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Booking & Showtime Section */}
      <div id="booking-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Cast & Crew Section */}
        {movie.cast_list && movie.cast_list.length > 0 && (
          <section className="mb-14">
            <h3 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Performing Cast & Key Crew
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              {movie.cast_list.map((cast, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl studio-glass border border-white/[0.06] text-center hover:border-white/20 transition-all">
                  <img
                    src={cast.image}
                    alt={cast.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2.5 border border-white/10 shadow-md"
                  />
                  <h5 className="font-bold text-xs text-white truncate">{cast.name}</h5>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{cast.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Date Selector & Showtimes Header */}
        <section className="mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Ticket className="w-7 h-7 text-rose-500" /> Cinema Showtimes in {selectedCity}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time seat reservations with distributed Redis locking
              </p>
            </div>

            {/* Date Scroller Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {dates.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex flex-col items-center justify-center min-w-[72px] py-3 px-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/35 scale-105'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="text-[9px] font-extrabold tracking-wider">{d.dayName}</span>
                    <span className="text-lg font-black leading-tight mt-0.5">{d.dayNumber}</span>
                    <span className="text-[9px] font-bold text-slate-400">{d.month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Status Indicator Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-5 studio-glass rounded-2xl border border-white/[0.06] my-6 text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500" /> Filling Fast
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" /> Almost Full
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Sold Out
              </span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant QR Turnstile Admission
            </span>
          </div>

          {/* Theatres & Show Slots List */}
          {theatres.length === 0 ? (
            <div className="p-16 text-center studio-glass rounded-3xl border border-white/[0.08]">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white">No Showtimes Available for {selectedDate} in {selectedCity}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Advance scheduling for this date is not open yet. Please select another date or change your city in the top navigation bar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {theatres.map((theatre) => (
                <div
                  key={theatre.theatreId}
                  className="studio-glass rounded-3xl p-6 transition-all border border-white/[0.08] hover:border-white/20 shadow-xl"
                >
                  {/* Theatre Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-white tracking-tight">{theatre.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[11px] font-bold">
                          ★ {theatre.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {theatre.address}
                      </p>
                    </div>

                    {/* Facility Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {theatre.facilities.map((fac, fIdx) => (
                        <span key={fIdx} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-semibold text-slate-300">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Grid Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
                    {theatre.shows.map((show) => {
                      const isSoldOut = show.statusBadge === 'Sold Out';
                      const badgeColor =
                        show.statusBadge === 'Available'
                          ? 'text-emerald-400'
                          : show.statusBadge === 'Filling Fast'
                          ? 'text-amber-400'
                          : show.statusBadge === 'Almost Full'
                          ? 'text-rose-400'
                          : 'text-slate-500';

                      return (
                        <button
                          key={show.id}
                          disabled={isSoldOut}
                          onClick={() => handleShowSelect(show)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                            isSoldOut
                              ? 'bg-black/30 border-white/[0.03] opacity-40 cursor-not-allowed'
                              : 'bg-white/[0.03] hover:bg-rose-600/[0.15] border-white/[0.08] hover:border-rose-500/60 hover:shadow-lg hover:scale-[1.02]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-white group-hover:text-rose-400 transition-colors">
                                {show.startTime}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/[0.08] text-rose-300">
                                {show.format}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                              {show.screenName}
                            </div>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${badgeColor}`}>
                              {show.statusBadge}
                            </span>
                            <span className="text-xs font-black text-slate-200">
                              ₹{show.minPrice}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Global Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={movie.trailer_url}
        title={movie.title}
      />
    </div>
  );
};
