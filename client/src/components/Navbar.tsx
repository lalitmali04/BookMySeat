import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Clapperboard
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

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection for dynamic glassmorphic opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounced
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.getMovies({ search: searchQuery });
          setSearchResults(res.movies || []);
          setShowSearchDropdown(true);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 200);
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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05070d]/88 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#05070d]/90 via-[#05070d]/50 to-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-600/30 group-hover:shadow-rose-600/50 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-rose-500 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-black tracking-tight text-white flex items-center leading-none">
                  Book<span className="text-rose-500 font-extrabold ml-0.5">MySeat</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
                  Cinemas & Events
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-rose-500/40 hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-all duration-200 group cursor-pointer"
              aria-label={`Current city: ${selectedCity}. Click to change.`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Search Bar with Autocomplete */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Search movies, IMAX formats, live shows..."
                className="w-full bg-slate-900/70 backdrop-blur-md border border-white/[0.08] focus:border-rose-500 focus:bg-slate-900/90 rounded-full pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {isSearching ? (
                <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              ) : searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete Results Flyout */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c101a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Now Showing & Upcoming
                    </div>
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMovie(m.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition text-left cursor-pointer group"
                      >
                        <img
                          src={m.poster_url}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10 shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-rose-400 transition truncate">
                            {m.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {m.rating}
                            </span>
                            <span>•</span>
                            <span>{m.language}</span>
                            <span>•</span>
                            <span className="truncate">{Array.isArray(m.genres) ? m.genres.slice(0, 2).join(', ') : m.genres}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 shrink-0 group-hover:bg-rose-600 group-hover:text-white transition">
                          Book
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No movies found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Nav Links & Auth Menu */}
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  location.pathname === '/' && !location.search.includes('category=event')
                    ? 'text-white bg-white/[0.08] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/?category=event"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  location.search.includes('category=event')
                    ? 'text-white bg-white/[0.08] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Events & Concerts
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-bookings"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    location.pathname === '/my-bookings'
                      ? 'text-white bg-white/[0.08] shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-rose-500" />
                  <span>My Tickets</span>
                </Link>
              )}
            </nav>

            {/* User Profile or Sign In CTA */}
            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0c101a] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {user.role === 'admin' ? 'Super Admin' : user.membershipTier || 'Premiere Member'}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" /> Account Profile
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                    >
                      <Ticket className="w-3.5 h-3.5 text-rose-500" /> Digital Ticket Wallet
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/10 rounded-xl transition"
                      >
                        <Shield className="w-3.5 h-3.5" /> Studio Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => { setIsUserDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition mt-1 border-t border-white/[0.06] cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white md:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#05070d]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { setIsCityModalOpen(true); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-200"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> City: <span className="text-white font-bold">{selectedCity}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] rounded-xl"
            >
              Movies & Experiences
            </Link>
            <Link
              to="/?category=event"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] rounded-xl"
            >
              Live Events & Concerts
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] rounded-xl flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-rose-500" /> My Tickets
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-500/10 rounded-xl flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
