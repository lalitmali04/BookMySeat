import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, CreditCard, Film, Clapperboard, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070d] border-t border-white/[0.08] pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Highlights Studio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/[0.06] mb-12">
          <div className="flex items-center gap-4 p-5 rounded-2xl studio-glass border border-white/[0.06]">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
              <Ticket className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Real-Time Seat Locking</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Distributed Redis locks prevent double booking across concurrent sessions.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl studio-glass border border-white/[0.06]">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Turnstile E-Tickets</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">High-contrast QR passes for contactless gate entry at all auditoriums.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl studio-glass border border-white/[0.06]">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Idempotent Transactions</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Zero double-charging guarantee backed by atomic database transactions.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-600/30">
                <Clapperboard className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">Book<span className="text-rose-500">My</span>Seat</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Premium cinema and live event ticketing engine built for studio-grade speed, visual immersion, and distributed concurrency.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Cinemas & Formats</h5>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-rose-400 transition cursor-pointer">IMAX 3D Laser Auditorium</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">Dolby Atmos Prime Arena</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">4DX Motion & Environment</span></li>
              <li><span className="hover:text-rose-400 transition cursor-pointer">Director's Cut VIP Lounges</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-rose-400 transition">Now Showing Blockbusters</Link></li>
              <li><Link to="/?category=event" className="hover:text-rose-400 transition">Live Concerts & Stadium Shows</Link></li>
              <li><Link to="/my-bookings" className="hover:text-rose-400 transition">Digital Ticket Wallet</Link></li>
              <li><Link to="/profile" className="hover:text-rose-400 transition">Loyalty & Rewards Hub</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Enterprise Stack</h5>
            <div className="space-y-1 text-[11px] text-slate-400">
              <p>• Redis Lock Engine (`SET NX EX`)</p>
              <p>• PostgreSQL Row-Level Locks (`FOR UPDATE`)</p>
              <p>• Three.js WebGL Cinematic Background</p>
              <p>• Real-Time Socket.IO Synchronization</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 BookMySeat Platform Inc. Crafted with cinema perfection.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Admission</span>
            <span className="hover:text-white transition cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
