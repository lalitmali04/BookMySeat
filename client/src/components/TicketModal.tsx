import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../types';
import { X, Download, Share2, Calendar, MapPin, Clock, Armchair, Sparkles } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, booking }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      const qrPayload = JSON.stringify({
        ref: booking.booking_reference,
        showId: booking.show_id,
        seats: booking.items?.map(i => i.seat_label) || [],
        user: booking.user_id,
        amount: booking.final_amount
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => setQrDataUrl(url)).catch(() => {});
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const movie = booking.movie;
  const theatre = booking.theatre;
  const show = booking.show;
  const seatLabels = booking.items?.map(i => i.seat_label).join(', ') || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> Digital E-Ticket
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Save / Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boarding Pass Ticket Body */}
        <div ref={ticketRef} className="p-6 bg-slate-900 text-slate-100">
          {/* Main Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                booking.status === 'CONFIRMED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {booking.status}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                REF: <span className="text-white">{booking.booking_reference}</span>
              </span>
            </div>

            {/* Movie Info */}
            <div className="flex gap-4 items-start mb-6">
              {movie?.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-2xl border border-slate-800 shadow-md shrink-0"
                />
              )}
              <div>
                <h4 className="text-xl font-black text-white leading-tight mb-1">
                  {movie?.title || 'Movie Screening'}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                    {show?.format || 'IMAX 3D'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium">
                    {show?.language || 'English'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {theatre?.name || 'Cinema Multiplex'}
                </p>
              </div>
            </div>

            {/* Showtime Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Date</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {show?.date || booking.created_at.split('T')[0]}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Time</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {show?.startTime || '07:30 PM'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Seats</span>
                <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
                  <Armchair className="w-3.5 h-3.5 text-rose-500" /> {seatLabels}
                </span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative my-4 flex items-center justify-between">
              <div className="absolute -left-9 w-6 h-6 rounded-full bg-slate-900 border-r border-slate-800"></div>
              <div className="w-full border-t border-dashed border-slate-800"></div>
              <div className="absolute -right-9 w-6 h-6 rounded-full bg-slate-900 border-l border-slate-800"></div>
            </div>

            {/* QR Code and Gate Info */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Total Paid</span>
                <span className="text-2xl font-black text-emerald-400">₹{booking.final_amount}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Payment ID: {booking.payment_id}</span>
                <span className="text-[10px] text-slate-500 mt-2 block">Present this QR at Hall Entry Gate 2</span>
              </div>
              {qrDataUrl && (
                <div className="p-2 bg-white rounded-2xl shadow-md">
                  <img src={qrDataUrl} alt="Ticket QR" className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
