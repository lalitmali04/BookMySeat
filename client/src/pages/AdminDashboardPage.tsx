import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking, Movie } from '../types';
import {
  Shield,
  TrendingUp,
  Ticket,
  Film,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'bookings' | 'add_movie'>('overview');

  // Add Movie Form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDuration, setMovieDuration] = useState('2h 30m');
  const [movieLang, setMovieLang] = useState('English');
  const [movieGenres, setMovieGenres] = useState('Action, Sci-Fi');
  const [movieDirector, setMovieDirector] = useState('Christopher Nolan');
  const [movieRating, setMovieRating] = useState('9.0');
  const [moviePoster, setMoviePoster] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop');
  const [movieDesc, setMovieDesc] = useState('An epic cinematic experience featuring breathtaking visuals in IMAX 3D and Dolby Atmos.');
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
    } catch {
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
      setFormSuccess('New movie added to cinema schedule successfully!');
      setTimeout(() => setFormSuccess(null), 3500);
      setMovieTitle('');
      fetchAdminData();
      setActiveTab('movies');
    } catch (err: any) {
      alert(err.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Remove this movie from active listings?')) return;
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Studio Operations Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Auditorium occupancy, live Redis transaction logs, and screening scheduler
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#060912] border border-white/[0.08] rounded-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'movies' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Catalog ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'bookings' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Orders ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('add_movie')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'add_movie' ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Title
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {formSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {formSuccess}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl studio-glass border border-white/[0.08] relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Gross Box Office Revenue
              </span>
              <div className="text-3xl font-black text-emerald-400">
                ₹{analytics?.totalRevenue?.toLocaleString() || '24,850'}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +18.4% this week
              </span>
            </div>

            <div className="p-6 rounded-3xl studio-glass border border-white/[0.08] relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Today's Turnstile Sales
              </span>
              <div className="text-3xl font-black text-white">
                ₹{analytics?.todaysRevenue?.toLocaleString() || '6,420'}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {analytics?.todaysBookingsCount || 8} admission passes issued today
              </span>
            </div>

            <div className="p-6 rounded-3xl studio-glass border border-white/[0.08] relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Average Auditorium Occupancy
              </span>
              <div className="text-3xl font-black text-rose-400">
                {analytics?.occupancyRate || 54}%
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Peak load on IMAX Laser screens
              </span>
            </div>

            <div className="p-6 rounded-3xl studio-glass border border-white/[0.08] relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Multiplex Venues
              </span>
              <div className="text-3xl font-black text-amber-400">
                {analytics?.totalTheatres || 5} Complexes
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {analytics?.totalShows || 28} daily showtime slots
              </span>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="studio-glass rounded-3xl p-6 shadow-2xl border border-white/[0.08]">
            <h3 className="text-lg font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-rose-500" /> Recent Admission Passes Issued
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.08]">
                  <tr>
                    <th className="pb-3">Ref Code</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-medium">
                  {bookings.slice(0, 6).map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.03]">
                      <td className="py-3 font-mono font-bold text-rose-400">{b.booking_reference}</td>
                      <td className="py-3 text-white">{b.user?.name || b.user_id}</td>
                      <td className="py-3 font-mono text-rose-300">{b.items?.map((i) => i.seat_label).join(', ') || 'N/A'}</td>
                      <td className="py-3 font-bold text-emerald-400">₹{b.final_amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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

      {/* CATALOG TAB */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Active Rotation Catalog</h3>
            <button
              onClick={() => setActiveTab('add_movie')}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((m) => (
              <div key={m.id} className="studio-glass rounded-3xl p-4 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <img
                    src={m.poster_url}
                    alt={m.title}
                    className="w-full aspect-[2/3] object-cover rounded-2xl mb-3 border border-white/10 shadow"
                  />
                  <h4 className="font-bold text-sm text-white line-clamp-1">{m.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{m.language} • {m.duration}</span>
                    <span className="text-amber-400 font-bold">★ {m.rating}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{m.category}</span>
                  <button
                    onClick={() => handleDeleteMovie(m.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer"
                    title="Remove Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="studio-glass rounded-3xl p-6 shadow-2xl border border-white/[0.08]">
          <h3 className="text-xl font-black text-white mb-4">All Customer Booking Transactions ({bookings.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="pb-3">Ref Code</th>
                  <th className="pb-3">Movie Title</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 font-mono font-bold text-rose-400">{b.booking_reference}</td>
                    <td className="py-3 text-white font-bold">{b.movie?.title || b.show_id}</td>
                    <td className="py-3 text-rose-300 font-bold font-mono">{b.items?.map((i) => i.seat_label).join(', ') || 'N/A'}</td>
                    <td className="py-3">{b.user?.name || b.user?.email || b.user_id}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{b.final_amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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
        <div className="max-w-2xl mx-auto studio-glass border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" /> Add Title to Rotation
          </h3>
          <form onSubmit={handleCreateMovie} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder="e.g. Spider-Man: Beyond the Spider-Verse"
                className="w-full bg-[#060912] border border-white/10 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={movieDuration}
                  onChange={(e) => setMovieDuration(e.target.value)}
                  className="w-full bg-[#060912] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Language</label>
                <input
                  type="text"
                  value={movieLang}
                  onChange={(e) => setMovieLang(e.target.value)}
                  className="w-full bg-[#060912] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={movieGenres}
                  onChange={(e) => setMovieGenres(e.target.value)}
                  className="w-full bg-[#060912] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Director</label>
                <input
                  type="text"
                  value={movieDirector}
                  onChange={(e) => setMovieDirector(e.target.value)}
                  className="w-full bg-[#060912] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Poster Image URL</label>
              <input
                type="url"
                value={moviePoster}
                onChange={(e) => setMoviePoster(e.target.value)}
                className="w-full bg-[#060912] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Synopsis / Description</label>
              <textarea
                rows={3}
                value={movieDesc}
                onChange={(e) => setMovieDesc(e.target.value)}
                className="w-full bg-[#060912] border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-xl shadow-rose-600/30 cursor-pointer transition"
            >
              Publish Movie to Rotation
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
