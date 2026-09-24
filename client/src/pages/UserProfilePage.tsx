import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Ticket,
  Sparkles,
  Shield,
  Award,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  LogOut
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-rose-600/20 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                {user.membershipTier || 'VIP Member'}
              </span>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  Administrator
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Rewards and Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Loyalty Reward Points</span>
            <div className="text-2xl font-black text-white">{user.loyaltyPoints || 360} pts</div>
            <span className="text-[10px] text-amber-400 font-semibold">Redeemable on next booking</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Bookings</span>
            <div className="text-2xl font-black text-white">{user.totalBookings || 2} shows</div>
            <Link to="/my-bookings" className="text-[10px] text-rose-400 hover:underline font-semibold">
              View tickets history →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Cinema Privilege</span>
            <div className="text-lg font-black text-indigo-300">Priority Entry</div>
            <span className="text-[10px] text-slate-400 font-semibold">Free gourmet popcorn upgrade</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <Link
          to="/my-bookings"
          className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">My Movie & Event Tickets</h4>
              <p className="text-xs text-slate-400">View active booking QR codes and receipts</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-300">Operations Control Panel</h4>
                <p className="text-xs text-slate-400">Live gross revenue, hall occupancy & movie scheduler</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-200 transition" />
          </Link>
        )}
      </div>
    </div>
  );
};
