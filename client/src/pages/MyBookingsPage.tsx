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
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Download,
  Trash2
} from 'lucide-react';

export const MyBookingsPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { isAuthenticated, user } = useAuth();
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
    } catch (e) {
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
      setToastMessage('Booking cancelled successfully. Seats released and refund initiated.');
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
      <div className="min-h-screen py-20 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to View Your Bookings</h2>
        <p className="text-xs text-slate-400 mb-6">Access your digital QR tickets, booking history, and seat details.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
        >
          Sign In Now
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
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-950/90 border border-emerald-500 text-emerald-200 p-4 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-rose-500" /> My Booking History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your movie tickets, access digital gate QR codes, and view receipts.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-md'
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
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading your tickets...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No {activeTab !== 'all' ? activeTab : ''} bookings found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">You haven't booked any shows in this category yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
          >
            Explore Movies & Book Seats
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const seatLabels = b.items?.map((i) => i.seat_label).join(', ') || 'N/A';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Movie & Venue Details */}
                <div className="flex gap-4 items-start">
                  {b.movie?.poster_url && (
                    <img
                      src={b.movie.poster_url}
                      alt={b.movie.title}
                      className="w-16 h-24 object-cover rounded-2xl border border-slate-800 shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isCancelled
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        REF: <strong className="text-slate-200">{b.booking_reference}</strong>
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-white leading-tight mb-1">{b.movie?.title || 'Movie Title'}</h4>

                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {b.theatre?.name} ({b.screen?.name})
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {b.show?.date || b.created_at.split('T')[0]} • {b.show?.startTime}
                      </p>
                      <p className="text-rose-400 font-bold">
                        Seats: {seatLabels} ({b.items?.length || 1} Tickets)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-xl font-black text-emerald-400">₹{b.final_amount}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedTicket(b)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-rose-400" /> View QR Ticket
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => {
                          setCancellingBookingId(b.id);
                          setCancelModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs transition cursor-pointer"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        booking={selectedTicket}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cancel Booking & Release Seats?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to cancel this booking? The locked seats will immediately become available for other customers, and a full refund will be initiated.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
