import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../types';
import { X, Download, Calendar, MapPin, Clock, Armchair, Sparkles, QrCode } from 'lucide-react';

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
        width: 190,
        margin: 1,
        color: {
          dark: '#05070d',
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
      <div className="relative w-full max-w-lg bg-[#0c111e] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#070a13]">
          <div className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" /> Digital Admission Pass
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10"
            >
              <Download className="w-3.5 h-3.5" /> Print Pass
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Boarding Pass Ticket Body */}
        <div ref={ticketRef} className="p-6 bg-[#0c111e] text-slate-100">
          <div className="bg-[#060912] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden shadow-2xl ticket-edge-left ticket-edge-right">
            
            {/* Status & Booking Code */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                booking.status === 'CONFIRMED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {booking.status}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                PASS: <span className="text-white">{booking.booking_reference}</span>
              </span>
            </div>

            {/* Movie Info */}
            <div className="flex gap-4 items-start mb-5">
              {movie?.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-2xl border border-white/10 shadow-md shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black text-white leading-tight mb-1 truncate">
                  {movie?.title || 'Screening'}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    {show?.format || 'IMAX 3D'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 text-[10px]">
                    {show?.language || 'English'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {theatre?.name}
                </p>
              </div>
            </div>

            {/* Showtime Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Date</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {show?.date || booking.created_at.split('T')[0]}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Time</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {show?.startTime || '07:30 PM'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Seats</span>
                <span className="text-xs font-black text-rose-400 flex items-center gap-1 font-mono">
                  <Armchair className="w-3.5 h-3.5 text-rose-500" /> {seatLabels}
                </span>
              </div>
            </div>

            {/* Perforated Divider Line */}
            <div className="my-5 perforated-line" />

            {/* QR Code and Gate Admission Instructions */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Paid</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₹{booking.final_amount}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Ref ID: {booking.payment_id || booking.id.substring(0, 10)}</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Scan at auditorium entrance turnstile</span>
              </div>
              {qrDataUrl && (
                <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                  <img src={qrDataUrl} alt="Ticket QR Code" className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
