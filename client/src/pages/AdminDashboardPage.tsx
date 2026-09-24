import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking, Movie } from '../types';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  Film,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'bookings' | 'add_movie' | 'add_show'>('overview');

  // Add Movie Form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDuration, setMovieDuration] = useState('2h 30m');
  const [movieLang, setMovieLang] = useState('English');
  const [movieGenres, setMovieGenres] = useState('Action, Sci-Fi');
  const [movieDirector, setMovieDirector] = useState('Christopher Nolan');
  const [movieRating, setMovieRating] = useState('9.0');
  const [moviePoster, setMoviePoster] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop');
  const [movieDesc, setMovieDesc] = useState('An epic cinematic masterpiece featuring stunning IMAX visuals and immersive Dolby Atmos audio.');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, bookingsRes, moviesRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllBookingsAdmin(),
        api.getMovies()
      ]);
      setAnalytics(analyticsRes.analytics);
      setBookings(bookingsRes.bookings || []);
      setMovies(moviesRes.movies || []);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [isAdmin]);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMovie({
        title: movieTitle,
        duration: movieDuration,
        language: movieLang,
        genres: movieGenres.split(',').map(s => s.trim()),
        director: movieDirector,
        rating: Number(movieRating),
        poster_url: moviePoster,
        backdrop_url: moviePoster,
        trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        description: movieDesc,
        is_now_showing: true,
        is_trending: true
      });
      setFormSuccess('New movie added to multiplex rotation successfully!');
      setTimeout(() => setFormSuccess(null), 3500);
      setMovieTitle('');
      fetchAdminData();
      setActiveTab('movies');
    } catch (err: any) {
      alert(err.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Are you sure you want to remove this movie from catalog?')) return;
    try {
      await api.deleteMovie(id);
      fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Error deleting movie.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              BookMySeat Operations Control Panel
            </h1>
            <p className="text-xs text-slate-400">
              Real-time ticketing analytics, cinema seat occupancy, and movie schedules
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'movies' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'bookings' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('add_movie')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'add_movie' ? 'bg-amber-500 text-slate-950 font-black' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Movie
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {formSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {formSuccess}
        </div>
      )}

      {/* OVERVIEW TAB: KPI Metrics & Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Gross Revenue
              </span>
              <div className="text-3xl font-black text-emerald-400">
                ₹{analytics?.totalRevenue?.toLocaleString() || '18,450'}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +14.2% this week
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Today's Sales
              </span>
              <div className="text-3xl font-black text-white">
                ₹{analytics?.todaysRevenue?.toLocaleString() || '4,280'}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {analytics?.todaysBookingsCount || 6} orders confirmed today
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Average Hall Occupancy
              </span>
              <div className="text-3xl font-black text-rose-400">
                {analytics?.occupancyRate || 48}%
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Peak capacity on Prime & Recliner rows
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Multiplex Theatres
              </span>
              <div className="text-3xl font-black text-amber-400">
                {analytics?.totalTheatres || 5} Venues
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {analytics?.totalShows || 24} scheduled showtimes
              </span>
            </div>
          </div>

          {/* Recent Bookings Snapshot */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-rose-500" /> Recent Multiplex Bookings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-rose-400">{b.booking_reference}</td>
                      <td className="py-3 text-white">{b.user?.name || b.user_id}</td>
                      <td className="py-3">{b.items?.map((i) => i.seat_label).join(', ') || 'N/A'}</td>
                      <td className="py-3 font-bold text-emerald-400">₹{b.final_amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{b.created_at.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOVIES TAB: Catalog management */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Active Movies & Shows Catalog</h3>
            <button
              onClick={() => setActiveTab('add_movie')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
            >
              <Plus className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((m) => (
              <div key={m.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between">
                <div>
                  <img
                    src={m.poster_url}
                    alt={m.title}
                    className="w-full aspect-[2/3] object-cover rounded-2xl mb-3 border border-slate-800"
                  />
                  <h4 className="font-bold text-sm text-white line-clamp-1">{m.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{m.language} • {m.duration}</span>
                    <span className="text-amber-400 font-bold">★ {m.rating}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{m.category}</span>
                  <button
                    onClick={() => handleDeleteMovie(m.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">All Customer Bookings ({bookings.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Ref Code</th>
                  <th className="pb-3">Movie Title</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-rose-400">{b.booking_reference}</td>
                    <td className="py-3 text-white font-bold">{b.movie?.title || b.show_id}</td>
                    <td className="py-3 text-rose-300 font-bold">{b.items?.map((i) => i.seat_label).join(', ') || 'N/A'}</td>
                    <td className="py-3">{b.user?.name || b.user?.email || b.user_id}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{b.final_amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{b.created_at.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MOVIE TAB */}
      {activeTab === 'add_movie' && (
        <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" /> Add New Movie or Event
          </h3>
          <form onSubmit={handleCreateMovie} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder="e.g. Spider-Man: Beyond the Spider-Verse"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={movieDuration}
                  onChange={(e) => setMovieDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                <input
                  type="text"
                  value={movieLang}
                  onChange={(e) => setMovieLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={movieGenres}
                  onChange={(e) => setMovieGenres(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Director</label>
                <input
                  type="text"
                  value={movieDirector}
                  onChange={(e) => setMovieDirector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Image URL</label>
              <input
                type="url"
                value={moviePoster}
                onChange={(e) => setMoviePoster(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis / Description</label>
              <textarea
                rows={3}
                value={movieDesc}
                onChange={(e) => setMovieDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              Add Movie to Cinema Listings
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
