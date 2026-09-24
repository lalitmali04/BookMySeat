import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, CreditCard, Sparkles, Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800/60 mb-12">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Real-Time Seat Locking</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Distributed Redis lock guarantees zero double-bookings.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Instant E-Tickets</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Instant QR codes for contactless digital entry at all multiplexes.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast & Secure Checkout</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Idempotent transaction layer with UPI, Cards & NetBanking.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white">BookMySeat</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The next-generation cinema and entertainment ticket booking engine built for speed, visual beauty, and rock-solid concurrency.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Cinemas & Venues</h5>
            <ul className="space-y-2">
              <li><span className="hover:text-rose-400 transition cursor-pointer">PVR ICON IMAX 3D</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">INOX INSIGNIA Multiplex</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">Cinépolis VIP Lounge</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">Prasads Large Screen</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-rose-400 transition">Now Showing Movies</Link></li>
              <li><Link to="/?category=event" className="hover:text-rose-400 transition">Live Concerts & Events</Link></li>
              <li><Link to="/my-bookings" className="hover:text-rose-400 transition">Booking History</Link></li>
              <li><Link to="/profile" className="hover:text-rose-400 transition">My Membership</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Enterprise Tech</h5>
            <div className="space-y-1 text-[11px] text-slate-400">
              <p>• Redis Distributed Seat Lock (SET NX EX)</p>
              <p>• PostgreSQL Row-Level Locking (`FOR UPDATE`)</p>
              <p>• Multi-user Real-Time WebSockets</p>
              <p>• Idempotent Payment Confirmation</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 BookMySeat Inc. All rights reserved. Crafted for cinema lovers.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
