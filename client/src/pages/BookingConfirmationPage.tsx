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
  ShieldCheck,
  QrCode
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f43f5e', '#ffffff', '#10b981']
      });
    } catch {}

    if (!id) return;
    api.getBookingById(id)
      .then(res => setBooking(res.booking))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Minting your digital admission pass...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen py-24 px-4 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-black text-white mb-2">Booking Record Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-rose-600 text-white text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const seatLabels = booking.items?.map(i => i.seat_label).join(', ') || 'N/A';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your seats are officially reserved and your digital pass is ready for admission.
        </p>
      </div>

      {/* Collectible Ticket Stub Container */}
      <div className="studio-glass rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8 border border-white/[0.08] ticket-edge-left ticket-edge-right">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-rose-500 to-amber-400" />

        {/* Ref and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BOOKING REFERENCE</span>
            <div className="text-lg sm:text-xl font-mono font-black text-rose-400 tracking-wider mt-0.5">
              {booking.booking_reference}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex gap-5 items-start py-6 border-b border-white/[0.06]">
          {booking.movie?.poster_url && (
            <img
              src={booking.movie.poster_url}
              alt={booking.movie.title}
              className="w-20 h-28 object-cover rounded-2xl border border-white/10 shadow-lg shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-white leading-tight mb-1 truncate">
              {booking.movie?.title || 'Movie Title'}
            </h3>
            <div className="text-xs text-slate-400 space-y-1 mt-2">
              <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {booking.theatre?.name}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {booking.show?.date} • {booking.show?.startTime}
              </p>
              <p className="font-bold text-rose-300">
                {booking.show?.format} • {booking.screen?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-b border-white/[0.06] text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Assigned Seats</span>
            <span className="text-sm font-black text-white font-mono">{seatLabels}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Payment Channel</span>
            <span className="text-sm font-bold text-slate-200">Instant UPI Pass</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Paid</span>
            <span className="text-xl font-black text-emerald-400">₹{booking.final_amount}</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" /> View Digital QR Ticket
          </button>
          <Link
            to="/my-bookings"
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-white/10"
          >
            My Tickets <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-slate-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>

      {/* Digital Ticket Modal with QR Scanner Pass */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};
