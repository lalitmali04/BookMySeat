import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getUserLockToken } from '../services/api';
import { getSocket, joinShowRoom, leaveShowRoom } from '../services/socket';
import { ShowDetails, Seat, SeatCategoryGroup } from '../types';
import { CinemaScreen } from '../components/SeatMap/CinemaScreen';
import { CinemaVenueLayout } from '../components/SeatMap/CinemaVenueLayout';
import { SeatButton } from '../components/SeatMap/SeatButton';
import { StickyBookingBar } from '../components/SeatMap/StickyBookingBar';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Armchair,
  CheckCircle2
} from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<ShowDetails | null>(null);
  const [categories, setCategories] = useState<SeatCategoryGroup[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockInProgress, setLockInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSeatMap = useCallback(async () => {
    if (!showId) return;
    try {
      const res = await api.getShowSeats(showId);
      setShow(res.show);
      setCategories(res.categories || []);

      // Restore any seats currently locked by me
      const myLockedSeats: Seat[] = [];
      let maxTtl = 0;
      for (const cat of res.categories) {
        for (const rowKey of Object.keys(cat.rows)) {
          for (const s of cat.rows[rowKey]) {
            if (s.isLockedByMe) {
              myLockedSeats.push(s);
              if (s.remainingTtl > maxTtl) maxTtl = s.remainingTtl;
            }
          }
        }
      }
      setSelectedSeats(myLockedSeats);
      if (myLockedSeats.length > 0 && maxTtl > 0) {
        setLockExpiresAt(Date.now() + maxTtl * 1000);
      }
    } catch (e: any) {
      showToast(e.message || 'Error loading seat layout.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    if (!showId) return;
    fetchSeatMap();

    // Socket.io real-time updates for concurrent seat reservations
    joinShowRoom(showId);
    const socket = getSocket();

    const handleSeatLocked = (data: { showId: string; seatId: string; userToken: string; ttl: number }) => {
      if (data.showId !== showId) return;
      const myToken = getUserLockToken();
      if (data.userToken === myToken) return;

      setCategories((prevCats) =>
        prevCats.map((cat) => ({
          ...cat,
          rows: Object.fromEntries(
            Object.entries(cat.rows).map(([rowKey, seats]) => [
              rowKey,
              seats.map((s) => (s.seatId === data.seatId ? { ...s, status: 'LOCKED', isLockedByMe: false } : s))
            ])
          )
        }))
      );
    };

    const handleSeatUnlocked = (data: { showId: string; seatIds: string[] }) => {
      if (data.showId !== showId) return;
      setCategories((prevCats) =>
        prevCats.map((cat) => ({
          ...cat,
          rows: Object.fromEntries(
            Object.entries(cat.rows).map(([rowKey, seats]) => [
              rowKey,
              seats.map((s) => (data.seatIds.includes(s.seatId) ? { ...s, status: 'AVAILABLE', isLockedByMe: false } : s))
            ])
          )
        }))
      );
    };

    const handleSeatBooked = (data: { showId: string; seatIds: string[] }) => {
      if (data.showId !== showId) return;
      setCategories((prevCats) =>
        prevCats.map((cat) => ({
          ...cat,
          rows: Object.fromEntries(
            Object.entries(cat.rows).map(([rowKey, seats]) => [
              rowKey,
              seats.map((s) => (data.seatIds.includes(s.seatId) ? { ...s, status: 'BOOKED', isLockedByMe: false } : s))
            ])
          )
        }))
      );
    };

    socket.on('seat:locked', handleSeatLocked);
    socket.on('seat:unlocked', handleSeatUnlocked);
    socket.on('seat:booked', handleSeatBooked);

    return () => {
      leaveShowRoom(showId);
      socket.off('seat:locked', handleSeatLocked);
      socket.off('seat:unlocked', handleSeatUnlocked);
      socket.off('seat:booked', handleSeatBooked);
    };
  }, [showId, fetchSeatMap]);

  // Atomic Redis lock toggle
  const handleToggleSeat = async (seat: Seat) => {
    if (!showId) return;
    if (lockInProgress) return;

    const isAlreadySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isAlreadySelected) {
      setLockInProgress(true);
      try {
        await api.unlockSeats(showId, [seat.seatId]);
        const updated = selectedSeats.filter((s) => s.seatId !== seat.seatId);
        setSelectedSeats(updated);
        if (updated.length === 0) {
          setLockExpiresAt(null);
        }
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            rows: Object.fromEntries(
              Object.entries(cat.rows).map(([rowKey, seats]) => [
                rowKey,
                seats.map((s) => (s.seatId === seat.seatId ? { ...s, status: 'AVAILABLE', isLockedByMe: false } : s))
              ])
            )
          }))
        );
      } catch (err: any) {
        showToast(err.message || 'Failed to release seat.', 'error');
      } finally {
        setLockInProgress(false);
      }
    } else {
      if (selectedSeats.length >= 10) {
        showToast('Maximum 10 seats allowed per booking.', 'info');
        return;
      }

      setLockInProgress(true);
      try {
        const lockRes = await api.lockSeats(showId, [seat.seatId]);
        const updated = [...selectedSeats, { ...seat, isLockedByMe: true, status: 'SELECTED' as const }];
        setSelectedSeats(updated);
        setLockExpiresAt(lockRes.expiresAt);

        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            rows: Object.fromEntries(
              Object.entries(cat.rows).map(([rowKey, seats]) => [
                rowKey,
                seats.map((s) => (s.seatId === seat.seatId ? { ...s, status: 'SELECTED', isLockedByMe: true } : s))
              ])
            )
          }))
        );
      } catch (err: any) {
        showToast(err.message || 'Sorry, this seat was just selected by another user.', 'error');
        fetchSeatMap();
      } finally {
        setLockInProgress(false);
      }
    }
  };

  const handleLockExpired = () => {
    showToast('Your 5-minute seat hold has expired. Seats released.', 'info');
    setSelectedSeats([]);
    setLockExpiresAt(null);
    fetchSeatMap();
  };

  const handleProceedToCheckout = () => {
    if (!showId || selectedSeats.length === 0) return;
    const seatIdList = selectedSeats.map((s) => s.seatId).join(',');
    navigate(`/checkout/${showId}?seats=${encodeURIComponent(seatIdList)}`);
  };

  if (loading || !show) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading auditorium layout and live locks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-[#0c111e]/95 border-white/10 text-slate-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Info Panel */}
      <div className="studio-glass rounded-3xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-white/[0.08]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(show?.movie?.id ? `/movie/${show.movie.id}` : '/')}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
            aria-label="Back to movie details"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {show?.movie?.title || 'Screening'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {show?.theatre?.name || 'Cinema'} ({show?.screen?.name || 'Screen 1'})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {show?.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {show?.startTime}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 font-extrabold text-[10px]">
                {show?.format || 'IMAX 3D'}
              </span>
            </div>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs bg-[#060912]/80 px-4 py-2.5 rounded-full border border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-3.5 h-3.5 rounded-md bg-white/[0.06] border border-white/15" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-300 font-bold">
            <div className="w-3.5 h-3.5 rounded-md bg-rose-600 border border-rose-400 shadow-sm" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <div className="w-3.5 h-3.5 rounded-md bg-amber-500/20 border border-amber-500 animate-pulse" />
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-3.5 h-3.5 rounded-md bg-[#0a0e1a]/60 border border-white/[0.04]" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Auditorium Blueprint Layout */}
      <CinemaVenueLayout
        theatreName={show.theatre?.name || 'Multiplex'}
        screenName={show.screen?.name || 'Screen 1'}
        format={show.format || 'IMAX 3D'}
        selectedSeatsCount={selectedSeats.length}
      />

      {/* Seating Grid Container */}
      <div className="studio-glass rounded-3xl p-6 sm:p-10 mb-8 border border-white/[0.08] shadow-2xl relative overflow-x-auto">
        
        {/* Cinema Screen Curve */}
        <CinemaScreen format={show.format} />

        {/* Seating Rows grouped by Category */}
        <div className="space-y-10 min-w-[580px] max-w-4xl mx-auto pt-6">
          {categories.map((catGroup) => (
            <div key={catGroup.category} className="space-y-3">
              {/* Category Tier Divider */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-bold text-slate-400">
                <span className="uppercase tracking-wider flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-rose-500" />
                  {catGroup.category} TIER — ₹{catGroup.price}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {catGroup.category === 'RECLINER' ? 'Plush Recliners' : catGroup.category === 'PRIME' ? 'Prime Center' : 'Standard Seating'}
                </span>
              </div>

              {/* Rows inside Category */}
              <div className="space-y-2.5">
                {Object.entries(catGroup.rows).map(([rowLetter, rowSeats]) => (
                  <div key={rowLetter} className="flex items-center justify-center gap-3">
                    {/* Left Row Indicator */}
                    <span className="w-6 text-center text-xs font-extrabold text-slate-400 select-none">
                      {rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                        return (
                          <SeatButton
                            key={seat.seatId}
                            seat={seat}
                            isSelected={isSelected}
                            onToggle={handleToggleSeat}
                            disabled={lockInProgress}
                          />
                        );
                      })}
                    </div>

                    {/* Right Row Indicator */}
                    <span className="w-6 text-center text-xs font-extrabold text-slate-400 select-none">
                      {rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Order Summary & Hold Bar */}
      <StickyBookingBar
        showId={showId || ''}
        selectedSeats={selectedSeats}
        lockExpiresAt={lockExpiresAt}
        onLockExpired={handleLockExpired}
        onProceed={handleProceedToCheckout}
        loading={lockInProgress}
      />
    </div>
  );
};
