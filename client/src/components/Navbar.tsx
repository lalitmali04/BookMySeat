import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import {
  Search,
  MapPin,
  Film,
  Ticket,
  User,
  LogOut,
  Shield,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { Movie } from '../types';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.getMovies({ search: searchQuery });
          setSearchResults(res.movies || []);
          setShowSearchDropdown(true);
        } catch (e) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const handleSelectMovie = (id: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/movie/${id}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Brand Logo + Location Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Book<span className="text-rose-500">My</span>Seat
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  Cinema & Live Events
                </span>
              </div>
            </Link>

            {/* City Selector Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 transition group cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Center: Search Bar with Autocomplete dropdown */}
          <div className="relative flex-1 max-w-lg hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Search for Movies, IMAX Shows, Concerts..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin absolute right-3.5 top-1/2 -translate-y-1/2"></div>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto">
                <div className="p-2 divide-y divide-slate-800/60">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMovie(m.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition text-left cursor-pointer"
                    >
                      <img
                        src={m.poster_url}
                        alt={m.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">{m.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="text-amber-400 font-semibold">★ {m.rating}</span>
                          <span>•</span>
                          <span>{m.language}</span>
                          <span>•</span>
                          <span>{Array.isArray(m.genres) ? m.genres.slice(0, 2).join(', ') : m.genres}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-rose-400 px-2 py-1 rounded-lg bg-rose-500/10 shrink-0">
                        Book
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Nav Links & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  location.pathname === '/' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/?category=event"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Events
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-bookings"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    location.pathname === '/my-bookings' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-rose-500" /> My Bookings
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-amber-400 ${
                    location.pathname.startsWith('/admin') ? 'bg-amber-500/15 border border-amber-500/30' : 'hover:bg-amber-500/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Panel
                </Link>
              )}
            </nav>

            {/* Auth Button or User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300">
                        {user.role === 'admin' ? 'Super Admin' : user.membershipTier || 'Silver Member'}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" /> My Profile & Points
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      <Ticket className="w-3.5 h-3.5 text-rose-500" /> Booking History
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { setIsUserDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition mt-1 border-t border-slate-800/60 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { setIsCityModalOpen(true); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> City: {selectedCity}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900 rounded-xl"
            >
              Movies
            </Link>
            <Link
              to="/?category=event"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900 rounded-xl"
            >
              Live Events & Concerts
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900 rounded-xl"
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-amber-400 hover:bg-amber-500/10 rounded-xl"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
