import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
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
  CheckCircle2,
  Ticket,
  Percent
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
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'ALEX JOHNSON');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');
  const [promoCode, setPromoCode] = useState('CINEMA20');
  const [promoApplied, setPromoApplied] = useState(true);

  // Idempotency Key generated once per checkout session
  const [idempotencyKey] = useState<string>(() => 'idemp_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now());

  // Countdown timer (5 minutes hold)
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
        setError(err.message || 'Seat hold has expired or is invalid. Please select seats again.');
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
      // Simulate realistic payment gateway processing animation
      await new Promise(r => setTimeout(r, 900));

      const res = await api.confirmBooking({
        showId,
        seatIds,
        paymentMethod,
        idempotencyKey
      });

      // Navigate to confirmation pass
      navigate(`/confirmation/${res.booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Payment or seat reservation could not be completed.');
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
      <div className="min-h-screen py-24 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Verifying seat lock and preparing secure checkout session...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="min-h-screen py-24 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Checkout Session Expired</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Your 5-minute seat reservation has ended. Please choose your seats again.'}</p>
        <button
          onClick={() => navigate(showId ? `/seat-selection/${showId}` : '/')}
          className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
        >
          Return to Seat Map
        </button>
      </div>
    );
  }

  const basePrice = checkoutData.baseAmount || 0;
  const convenienceFee = Math.round(basePrice * 0.08);
  const discount = promoApplied ? Math.round(basePrice * 0.15) : 0;
  const finalPayable = Math.max(0, basePrice + convenienceFee - discount);

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={() => navigate(`/seat-selection/${showId}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-full studio-glass border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Change Seats
        </button>

        {/* Live Hold Timer Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full studio-glass border border-rose-500/30 text-rose-300 shadow-sm">
          <Timer className="w-4 h-4 text-rose-400 animate-spin" />
          <span className="text-xs font-mono font-bold">
            Seat Hold: <strong className="text-white">{formatTimer(remainingSeconds)}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Payment Methods Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="studio-glass rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
            <h2 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Select Payment Method
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Encrypted 256-bit checkout with distributed row lock verification
            </p>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <QrCode className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold">Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <CreditCard className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'NET_BANKING'
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Building2 className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold">NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'WALLET'
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Wallet className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold">Wallets</span>
              </button>
            </div>

            {/* Payment Method Inputs */}
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-[#060912]/80 border border-white/[0.06] space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 font-mono"
                      required
                    />
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A payment request will be sent to Google Pay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-[#060912]/80 border border-white/[0.06] space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="p-4 rounded-2xl bg-[#060912]/80 border border-white/[0.06] space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Select Banking Institution</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'WALLET' && (
                <div className="p-4 rounded-2xl bg-[#060912]/80 border border-white/[0.06] space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Select Digital Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Paytm">Paytm Wallet</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="MobiKwik">MobiKwik</option>
                  </select>
                </div>
              )}

              {/* Promo Code Input */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono uppercase"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoApplied(!promoApplied)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 transition cursor-pointer"
                  >
                    {promoApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Submit Payment CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/40 hover:shadow-rose-600/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4" />
                  {processingPayment ? 'Processing Security Clearance...' : `Pay ₹${finalPayable} & Lock Tickets`}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Perforated Ticket Stub Summary */}
        <div className="lg:col-span-5">
          <div className="studio-glass rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl relative ticket-edge-left ticket-edge-right">
            
            {/* Movie Overview in Stub */}
            <div className="flex gap-4 items-start pb-5 border-b border-white/[0.06]">
              {show?.movie?.poster_url && (
                <img
                  src={show.movie.poster_url}
                  alt={show.movie.title}
                  className="w-16 h-24 object-cover rounded-xl border border-white/10 shadow shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase">
                  {show?.format || 'IMAX 3D'}
                </span>
                <h3 className="text-base font-black text-white mt-1 truncate">
                  {show?.movie?.title || 'Screening'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {show?.theatre?.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{show?.date}</span>
                  <span>•</span>
                  <span>{show?.startTime}</span>
                </p>
              </div>
            </div>

            {/* Seats Assigned */}
            <div className="py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">Reserved Seats ({seatIds.length})</span>
                <span className="font-mono font-black text-rose-400 text-sm">
                  {checkoutData.items?.map(i => i.seatLabel).join(', ') || seatIds.join(', ')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Screen: <strong className="text-slate-200">{show?.screen?.name || 'Screen 1'}</strong>
              </div>
            </div>

            {/* Price Breakdown Calculation */}
            <div className="py-4 space-y-2.5 border-b border-white/[0.06] text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Tickets Base Amount</span>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Integrated GST & Multiplex Fee</span>
                <span>₹{convenienceFee}</span>
              </div>
              {promoApplied && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Voucher Discount (CINEMA20)</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
            </div>

            {/* Perforated Divider Notch */}
            <div className="my-4 perforated-line" />

            {/* Total Grand Amount */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL PAYABLE</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All taxes included
                </span>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">
                ₹{finalPayable}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
