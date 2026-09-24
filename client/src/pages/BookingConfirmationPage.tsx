import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Booking } from '../types';
import { TicketModal } from '../components/TicketModal';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Home,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    // Launch festive confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#6366f1', '#10b981']
      });
    } catch (e) {}

    if (!id) return;
    api.getBookingById(id)
      .then(res => setBooking(res.booking))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Loading your confirmed ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const seatLabels = booking.items?.map(i => i.seat_label).join(', ') || 'N/A';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Success Badge Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          🎉 Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your seats are locked and your digital e-ticket has been generated.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-rose-500 to-amber-500"></div>

        {/* Ref and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">BOOKING REFERENCE</span>
            <div className="text-lg sm:text-xl font-mono font-black text-rose-400 tracking-wider">
              {booking.booking_reference}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase">
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex gap-4 items-start py-6 border-b border-slate-800">
          {booking.movie?.poster_url && (
            <img
              src={booking.movie.poster_url}
              alt={booking.movie.title}
              className="w-20 h-28 object-cover rounded-2xl border border-slate-800 shadow-md shrink-0"
            />
          )}
          <div>
            <h3 className="text-xl font-black text-white leading-tight mb-1">
              {booking.movie?.title || 'Movie Title'}
            </h3>
            <div className="text-xs text-slate-400 space-y-1 mt-2">
              <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {booking.theatre?.name}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {booking.show?.date} • {booking.show?.startTime}
              </p>
              <p className="font-bold text-rose-400">
                {booking.show?.format} • {booking.screen?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-b border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Seats</span>
            <span className="text-sm font-black text-white">{seatLabels}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Payment Method</span>
            <span className="text-sm font-bold text-slate-200">Instant UPI</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Total Amount Paid</span>
            <span className="text-lg font-black text-emerald-400">₹{booking.final_amount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ticket className="w-4 h-4" /> View Digital E-Ticket (QR)
          </button>
          <Link
            to="/my-bookings"
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            My Bookings <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>

      {/* Digital Ticket Modal with QR */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};
