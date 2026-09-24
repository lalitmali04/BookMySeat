import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api, getUserLockToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckoutValidationResponse, ShowDetails } from '../types';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  Timer,
  ChevronLeft,
  Lock,
  Sparkles,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const CheckoutPage: React.FC<{ onOpenAuth: (mode?: 'login' | 'register') => void }> = ({ onOpenAuth }) => {
  const { showId } = useParams<{ showId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const seatIdsParam = searchParams.get('seats');
  const seatIds = seatIdsParam ? seatIdsParam.split(',') : [];

  const [checkoutData, setCheckoutData] = useState<CheckoutValidationResponse | null>(null);
  const [show, setShow] = useState<ShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'>('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'ALEX JOHNSON');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Idempotency Key generated once per checkout session
  const [idempotencyKey] = useState<string>(() => 'idemp_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now());

  // Countdown timer (e.g. 5 minutes)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showId || seatIds.length === 0) {
      navigate('/');
      return;
    }

    const validate = async () => {
      setLoading(true);
      setError(null);
      try {
        const [checkoutRes, showRes] = await Promise.all([
          api.validateCheckout(showId, seatIds),
          api.getShowSeats(showId)
        ]);
        setCheckoutData(checkoutRes.checkout);
        setShow(showRes.show);
      } catch (err: any) {
        setError(err.message || 'Seat lock has expired or is invalid. Please select seats again.');
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [showId, seatIdsParam]);

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    if (!showId || seatIds.length === 0) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Simulate realistic payment gateway processing delay (800ms)
      await new Promise(r => setTimeout(r, 800));

      const res = await api.confirmBooking({
        showId,
        seatIds,
        paymentMethod,
        idempotencyKey
      });

      // Navigate to confirmation page
      navigate(`/confirmation/${res.booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Payment or seat booking failed.');
      setProcessingPayment(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Verifying seat hold and preparing secure payment gateway...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Seat Hold Expired</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Your temporary lock has timed out.'}</p>
        <button
          onClick={() => navigate(showId ? `/seat-selection/${showId}` : '/')}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
        >
          Select Seats Again
        </button>
      </div>
    );
  }

  const seatLabels = checkoutData.items.map(i => i.seatLabel).join(', ');

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <button
          onClick={() => navigate(`/seat-selection/${showId}`)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Seat Map
        </button>

        {/* Live Countdown Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
          <Timer className="w-4 h-4 animate-spin-slow" />
          <span>Seats held for <strong className="text-white">{formatTimer(remainingSeconds)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Mock Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-500" /> Secure Payment Gateway
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">256-Bit SSL Encrypted & Idempotent Mock Gateway</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Demo Gateway
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'NET_BANKING'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-bold">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'WALLET'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-bold">Wallets</span>
              </button>
            </div>

            {/* Payment Method Details Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Scan QR Code or enter UPI ID</span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span>Popular Apps:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">Google Pay</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">PhonePe</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">Paytm UPI</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="block text-[11px] font-semibold text-slate-400">Select Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                          selectedBank === bank ? 'bg-rose-600/20 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'WALLET' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="block text-[11px] font-semibold text-slate-400">Select Digital Wallet</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Paytm', 'PhonePe', 'Amazon Pay'].map(wallet => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center cursor-pointer ${
                          selectedWallet === wallet ? 'bg-rose-600/20 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={processingPayment}
                className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Secure Transaction & Locking Seat Row...</span>
                  </>
                ) : (
                  <span>Pay ₹{checkoutData.finalAmount} & Confirm Booking</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order & Price Breakdown */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-28">
            <h4 className="text-base font-black text-white tracking-tight pb-3 border-b border-slate-800 mb-4">
              Booking Summary
            </h4>

            {show && (
              <div className="flex gap-4 items-start pb-4 border-b border-slate-800 mb-4">
                {show.movie.poster_url && (
                  <img
                    src={show.movie.poster_url}
                    alt={show.movie.title}
                    className="w-16 h-24 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                )}
                <div>
                  <h5 className="font-bold text-sm text-white leading-tight mb-1">{show.movie.title}</h5>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-rose-500" /> {show.theatre.name}
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {show.date} • {show.startTime}
                    </p>
                    <p className="font-semibold text-rose-400">{show.format} • {show.screen.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seat List */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Selected Seats ({checkoutData.items.length})</span>
                <span className="text-rose-400 font-bold">{seatLabels}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Ticket Price</span>
                <span className="font-semibold text-white">₹{checkoutData.baseAmount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Convenience Fee (10%)</span>
                <span>₹{checkoutData.convenienceFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Integrated GST (18%)</span>
                <span>₹{checkoutData.tax}</span>
              </div>
            </div>

            {/* Total Payable */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-bold text-white uppercase">Grand Total Payable</span>
              <span className="text-2xl font-black text-emerald-400">₹{checkoutData.finalAmount}</span>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Cancellation Protection Guarantee
              </p>
              <p>You can cancel eligible bookings up to 2 hours before the showtime from My Bookings.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
