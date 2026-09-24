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
  Info,
  ShieldCheck,
  Film
} from 'lucide-react';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<TheatreWithShows[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Trailer Modal
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Generate next 5 dates for the date picker
  const dates = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date(Date.now() + offset * 86400000);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'TODAY' : offset === 1 ? 'TOM' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
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
      } catch (e) {
        // Handled
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, selectedDate, selectedCity]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Loading movie details & showtimes...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested title may not be available or was removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleShowSelect = (show: ShowSlot) => {
    if (show.statusBadge === 'Sold Out') return;
    navigate(`/seat-selection/${show.id}`);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Movie Hero Banner */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie.backdrop_url}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Card */}
            <div className="relative w-48 sm:w-60 md:w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 shrink-0 mx-auto md:mx-0 group">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {movie.trailer_url && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                    <Play className="w-4 h-4 fill-white" /> Play Trailer
                  </span>
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase">
                  {movie.category === 'event' ? 'Live Arena Show' : 'In Multiplexes'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {movie.rating} / 10 ({movie.votes?.toLocaleString()} Votes)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-300 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold">{movie.language}</span>
                <span>•</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">{Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300"><Clock className="w-3.5 h-3.5" /> {movie.duration}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300"><Calendar className="w-3.5 h-3.5" /> Released {movie.release_date}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mb-6">
                {movie.description}
              </p>

              <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center md:justify-start gap-6 border-t border-slate-800/80 pt-4">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-semibold">DIRECTOR</span>
                  <span className="font-bold text-white text-sm">{movie.director}</span>
                </div>
                {movie.trailer_url && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Watch Official Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Cast & Crew Section */}
        {movie.cast_list && movie.cast_list.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Star Cast & Crew
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {movie.cast_list.map((cast, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <img
                    src={cast.image}
                    alt={cast.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border border-slate-700 shadow-md"
                  />
                  <h5 className="font-bold text-xs text-white truncate">{cast.name}</h5>
                  <p className="text-[11px] text-slate-400 truncate">{cast.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Showtime & Theatre Booking Section */}
        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Ticket className="w-6 h-6 text-rose-500" /> Select Date & Showtimes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing multiplex screens and auditorium formats in <strong className="text-slate-200">{selectedCity}</strong>
              </p>
            </div>

            {/* Date Scroller */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {dates.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex flex-col items-center justify-center min-w-[62px] py-2.5 px-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold tracking-wider">{d.dayName}</span>
                    <span className="text-base font-black">{d.dayNumber}</span>
                    <span className="text-[9px] font-semibold">{d.month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Status Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 my-6 text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Filling Fast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Almost Full
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Sold Out
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              ⚡ Live seat availability calculated in real time
            </span>
          </div>

          {/* Theatres List */}
          {theatres.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
              <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No Shows Scheduled for {selectedDate} in {selectedCity}</h4>
              <p className="text-xs text-slate-400 mt-1">Please pick another date or select a different city above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {theatres.map((theatre) => (
                <div
                  key={theatre.theatreId}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-white tracking-tight">{theatre.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[11px] font-bold">
                          ★ {theatre.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {theatre.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {theatre.facilities.map((fac, fIdx) => (
                        <span key={fIdx} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
                    {theatre.shows.map((show) => {
                      const isSoldOut = show.statusBadge === 'Sold Out';
                      const badgeColor =
                        show.statusBadge === 'Available'
                          ? 'text-emerald-400'
                          : show.statusBadge === 'Filling Fast'
                          ? 'text-amber-400'
                          : show.statusBadge === 'Almost Full'
                          ? 'text-orange-400'
                          : 'text-slate-500';

                      return (
                        <button
                          key={show.id}
                          disabled={isSoldOut}
                          onClick={() => handleShowSelect(show)}
                          className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                            isSoldOut
                              ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                              : 'bg-slate-950 hover:bg-slate-800/90 border-slate-800 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-white group-hover:text-rose-400 transition-colors">
                                {show.startTime}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                                {show.format}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {show.screenName}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${badgeColor}`}>
                              {show.statusBadge}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300">
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

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={movie.trailer_url}
        title={movie.title}
      />
    </div>
  );
};
