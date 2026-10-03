import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Movie } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';
import { SpidermanScene } from '../components/SpidermanScene';
import { useCity } from '../context/CityContext';
import {
  Film,
  Flame,
  Calendar,
  Filter,
  Layers,
  Music,
  Gift,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';

const GENRES = ['All Genres', 'Sci-Fi', 'Action', 'Adventure', 'Comedy', 'Drama', 'Live Event'];
const LANGUAGES = ['All Languages', 'English', 'Hindi'];

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useCity();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All Languages');

  // Trailer Modal State
  const [trailerState, setTrailerState] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await api.getMovies({
          category: activeCategory !== 'all' ? activeCategory : undefined,
          genre: selectedGenre !== 'All Genres' ? selectedGenre : undefined,
          language: selectedLanguage !== 'All Languages' ? selectedLanguage : undefined
        });
        setMovies(res.movies || []);
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeCategory, selectedGenre, selectedLanguage]);

  const handleWatchTrailer = (url: string, title: string) => {
    setTrailerState({ isOpen: true, url, title });
  };

  const trendingMovies = movies.filter(m => m.is_trending);
  const nowShowing = movies.filter(m => m.is_now_showing);
  const upcoming = movies.filter(m => m.is_upcoming);
  const events = movies.filter(m => m.category === 'event');

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Banner Showcase */}
        <HeroBanner
          featuredMovies={trendingMovies.length > 0 ? trendingMovies : movies.slice(0, 3)}
          onWatchTrailer={handleWatchTrailer}
        />

        {/* Studio Filter Bar */}
        <div className="studio-glass rounded-3xl p-4 sm:p-5 mb-12 shadow-xl border border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Segmented Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setActiveCategory('all'); setSearchParams({}); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeCategory === 'all'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> All Experiences
              </button>
              <button
                onClick={() => { setActiveCategory('movie'); setSearchParams({ category: 'movie' }); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeCategory === 'movie'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Movies & IMAX
              </button>
              <button
                onClick={() => { setActiveCategory('event'); setSearchParams({ category: 'event' }); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeCategory === 'event'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-amber-400" /> Live Events & Tours
              </button>
            </div>

            {/* Filter Dropdowns (Genre & Language) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-semibold"
                  aria-label="Filter by genre"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g} className="bg-[#0c111e] text-white">{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-semibold"
                  aria-label="Filter by language"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l} className="bg-[#0c111e] text-white">{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton States */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-16">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl studio-shimmer border border-white/[0.06]" />
            ))}
          </div>
        ) : (
          <>
            {/* Section 1: Now Showing in Selected City */}
            {nowShowing.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Now Showing in {selectedCity}
                      </h2>
                      <p className="text-xs text-slate-400">Experience blockbusters in IMAX 3D, Dolby Atmos & 4DX</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                    {nowShowing.length} Experiences
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {nowShowing.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onWatchTrailer={handleWatchTrailer} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Trending & Recommended */}
            {trendingMovies.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Trending & Critics' Choice
                      </h2>
                      <p className="text-xs text-slate-400">Top-rated titles trending this week</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {trendingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onWatchTrailer={handleWatchTrailer} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Live Events & Arena Shows */}
            {events.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Live Concerts & Comedy Shows
                      </h2>
                      <p className="text-xs text-slate-400">Stadium tours, standup comedy, and stage spectacles</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {events.map((event) => (
                    <MovieCard key={event.id} movie={event} onWatchTrailer={handleWatchTrailer} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 4: Upcoming Coming Soon */}
            {upcoming.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Upcoming Releases
                      </h2>
                      <p className="text-xs text-slate-400">Advance booking opening shortly</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {upcoming.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onWatchTrailer={handleWatchTrailer} />
                  ))}
                </div>
              </section>
            )}

            {/* Ticket Perks & Offers Perforated Banner */}
            <section className="relative p-6 sm:p-8 rounded-3xl studio-glass border border-rose-500/20 shadow-2xl mb-12 overflow-hidden ticket-edge-left ticket-edge-right">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
                    <Ticket className="w-7 h-7 -rotate-12" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Studio Pass Promotion
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Save 20% on IMAX & Recliner Tickets
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Apply voucher code <span className="font-mono font-bold text-amber-400 bg-white/[0.08] px-2 py-0.5 rounded border border-white/10">CINEMA20</span> during checkout.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Valid at all Multiplexes
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Global Trailer Modal */}
        <TrailerModal
          isOpen={trailerState.isOpen}
          onClose={() => setTrailerState({ isOpen: false, url: '', title: '' })}
          videoUrl={trailerState.url}
          title={trailerState.title}
        />
    </div>
  );
};
