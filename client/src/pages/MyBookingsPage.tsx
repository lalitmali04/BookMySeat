import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { TicketModal } from '../components/TicketModal';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  QrCode,
  Sparkles,
  AlertCircle,
  X,
  Armchair
} from 'lucide-react';

export const MyBookingsPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getUserBookings();
      setBookings(res.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    setCancelLoading(true);
    try {
      await api.cancelBooking(cancellingBookingId);
      setToastMessage('Booking cancelled. Seats unlocked and refund registered.');
      setTimeout(() => setToastMessage(null), 4000);
      setCancelModalOpen(false);
      setCancellingBookingId(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-600/20">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Sign in to Access Your Tickets</h2>
        <p className="text-xs text-slate-400 mb-6">View your active digital QR passes, cinema bookings, and invoices.</p>
        <button
          onClick={onOpenAuth}
          className="px-7 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' && (b.show?.date || b.created_at) >= todayStr;
    if (activeTab === 'past') return b.status === 'CONFIRMED' && (b.show?.date || b.created_at) < todayStr;
    return true;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 studio-glass border border-emerald-500 text-emerald-200 p-4 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-rose-500" /> Digital Ticket Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your contactless turnstile passes, cinema vouchers, and seat details.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-[#060912] border border-white/[0.08] rounded-full">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your tickets...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 text-center studio-glass border border-white/[0.08] rounded-3xl">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No {activeTab !== 'all' ? activeTab : ''} tickets found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">You have no reservations under this category.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Explore Blockbusters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const seatLabels = b.items?.map(i => i.seat_label).join(', ') || 'N/A';

            return (
              <div
                key={b.id}
                className="studio-glass rounded-3xl p-6 border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all ticket-edge-left ticket-edge-right"
              >
                <div>
                  {/* Top Status & Reference */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      REF: <strong className="text-rose-400">{b.booking_reference}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isConfirmed
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Movie Media & Info */}
                  <div className="flex gap-4 items-start mb-4">
                    {b.movie?.poster_url && (
                      <img
                        src={b.movie.poster_url}
                        alt={b.movie.title}
                        className="w-16 h-24 object-cover rounded-xl border border-white/10 shadow shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white leading-tight truncate">
                        {b.movie?.title || 'Screening'}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 my-1.5">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-extrabold">
                          {b.show?.format || 'IMAX 3D'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 text-[10px]">
                          {b.screen?.name || 'Screen 1'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {b.theatre?.name}
                      </p>
                    </div>
                  </div>

                  {/* Booking Specs */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#060912] border border-white/[0.04] text-xs mb-4">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Date</span>
                      <span className="font-bold text-white text-[11px] truncate block">
                        {b.show?.date || b.created_at.split('T')[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Time</span>
                      <span className="font-bold text-white text-[11px] truncate block">
                        {b.show?.startTime || '07:30 PM'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Seats</span>
                      <span className="font-black text-rose-400 text-[11px] font-mono truncate block">
                        {seatLabels}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Paid Amount</span>
                    <span className="text-base font-black text-emerald-400">₹{b.final_amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Pass
                        </button>
                        <button
                          onClick={() => { setCancellingBookingId(b.id); setCancelModalOpen(true); }}
                          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-semibold text-xs transition cursor-pointer border border-white/[0.06]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Pass Modal */}
      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        booking={selectedTicket}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0c111e] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white text-center mb-1">Cancel Booking?</h4>
            <p className="text-xs text-slate-400 text-center mb-6">
              Your seats will be released back to the live auditorium inventory immediately.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
