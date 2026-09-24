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
  Info,
  AlertCircle,
  Sparkles,
  Lock,
  Armchair
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

    // Socket.io real-time updates
    joinShowRoom(showId);
    const socket = getSocket();

    const handleSeatLocked = (data: { showId: string; seatId: string; userToken: string; ttl: number }) => {
      if (data.showId !== showId) return;
      const myToken = getUserLockToken();
      if (data.userToken === myToken) return; // already handled locally

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

  // Handle seat selection with atomic Redis locking
  const handleToggleSeat = async (seat: Seat) => {
    if (!showId) return;
    if (lockInProgress) return;

    const isAlreadySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isAlreadySelected) {
      // Release lock
      setLockInProgress(true);
      try {
        await api.unlockSeats(showId, [seat.seatId]);
        const updated = selectedSeats.filter((s) => s.seatId !== seat.seatId);
        setSelectedSeats(updated);
        if (updated.length === 0) {
          setLockExpiresAt(null);
        }
        // Update local seat status to AVAILABLE
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
      // Max 10 seats check
      if (selectedSeats.length >= 10) {
        showToast('Maximum 10 seats allowed per booking.', 'info');
        return;
      }

      // Acquire Redis Temporary Soft Lock
      setLockInProgress(true);
      try {
        const lockRes = await api.lockSeats(showId, [seat.seatId]);
        const updated = [...selectedSeats, { ...seat, isLockedByMe: true, status: 'SELECTED' as const }];
        setSelectedSeats(updated);
        setLockExpiresAt(lockRes.expiresAt);

        // Update local seat status
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
        // Race condition / lock conflict occurred
        showToast(err.message || 'Sorry, this seat was just selected by another user.', 'error');
        // Refresh live map to sync latest status
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
      <div className="min-h-screen py-16 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Initializing Cinema Seating Matrix & Redis Lock Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(show?.movie?.id ? `/movie/${show.movie.id}` : '/')}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {show?.movie?.title || 'Movie Screening'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {show?.theatre?.name || 'Multiplex'} ({show?.screen?.name || 'Main Screen'})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {show?.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {show?.startTime}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold text-[10px]">
                {show?.format || 'IMAX 3D'}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-4 h-4 rounded-lg bg-slate-900 border border-slate-700"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-300 font-bold">
            <div className="w-4 h-4 rounded-lg bg-rose-600 border border-rose-500 shadow-sm"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <div className="w-4 h-4 rounded-lg bg-amber-500/20 border border-amber-500 animate-pulse"></div>
            <span>Locked (Other User)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-4 h-4 rounded-lg bg-slate-800/60 border border-slate-800"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Cinema Seating Location & Venue Overview Section */}
      <CinemaVenueLayout
        theatreName={show?.theatre?.name || 'Multiplex Cinema'}
        screenName={show?.screen?.name || 'Audi 1'}
        format={show?.format || 'IMAX 3D'}
        selectedSeatsCount={selectedSeats.length}
      />

      {/* Cinema Screen Curved Projection */}
      <CinemaScreen format={show.format} />

      {/* Interactive Seat Matrix */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-x-auto my-8">
        <div className="min-w-[640px] max-w-4xl mx-auto space-y-8">
          {categories.map((cat) => {
            const rowKeys = Object.keys(cat.rows).sort();
            if (rowKeys.length === 0) return null;

            return (
              <div key={cat.category} className="space-y-3">
                {/* Category Header with Price Pill */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      cat.category === 'RECLINER' ? 'bg-amber-400' : cat.category === 'PRIME' ? 'bg-indigo-400' : 'bg-slate-400'
                    }`}></span>
                    {cat.category} SECTION
                  </span>
                  <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                    ₹{cat.price}
                  </span>
                </div>

                {/* Rows Grid */}
                <div className="space-y-2.5 pt-2">
                  {rowKeys.map((rowKey) => {
                    const rowSeats = cat.rows[rowKey];
                    // Split seats with center aisle (e.g. 1..5 on Left, 6..10 on Right)
                    const leftAisle = rowSeats.slice(0, Math.ceil(rowSeats.length / 2));
                    const rightAisle = rowSeats.slice(Math.ceil(rowSeats.length / 2));

                    return (
                      <div key={rowKey} className="flex items-center justify-center gap-3 sm:gap-4">
                        {/* Row Label Left */}
                        <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                          {rowKey}
                        </span>

                        {/* Left Wing */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {leftAisle.map((seat) => (
                            <SeatButton
                              key={seat.seatId}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                              onToggle={handleToggleSeat}
                              disabled={lockInProgress}
                            />
                          ))}
                        </div>

                        {/* Center Gangway / Aisle */}
                        <div className="w-6 sm:w-10 text-center text-[10px] uppercase font-bold text-slate-400 select-none">
                          AISLE
                        </div>

                        {/* Right Wing */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {rightAisle.map((seat) => (
                            <SeatButton
                              key={seat.seatId}
                              seat={seat}
                              isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                              onToggle={handleToggleSeat}
                              disabled={lockInProgress}
                            />
                          ))}
                        </div>

                        {/* Row Label Right */}
                        <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                          {rowKey}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Booking Bar with Countdown */}
      <StickyBookingBar
        showId={show.id}
        selectedSeats={selectedSeats}
        lockExpiresAt={lockExpiresAt}
        onLockExpired={handleLockExpired}
        onProceed={handleProceedToCheckout}
      />
    </div>
  );
};
