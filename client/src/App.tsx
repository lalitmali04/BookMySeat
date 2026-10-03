import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CityModal } from './components/CityModal';
import { AuthModal } from './components/AuthModal';
import { SpidermanScene } from './components/SpidermanScene';

import { HomePage } from './pages/HomePage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';

export const App: React.FC = () => {
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthProvider>
      <CityProvider>
        <Router>
          <div className="relative flex flex-col min-h-screen bg-[#05070d] text-slate-100 antialiased selection:bg-rose-600 selection:text-white film-grain overflow-x-hidden">
            {/* Global 3D Spider-Man WebGL Background Canvas */}
            <SpidermanScene />

            <Navbar onOpenAuth={handleOpenAuth} />
            
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MovieDetailsPage />} />
                <Route path="/seat-selection/:showId" element={<SeatSelectionPage />} />
                <Route path="/checkout/:showId" element={<CheckoutPage onOpenAuth={handleOpenAuth} />} />
                <Route path="/confirmation/:id" element={<BookingConfirmationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage onOpenAuth={handleOpenAuth} />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Modals */}
            <CityModal />
            <AuthModal
              isOpen={authModalState.isOpen}
              onClose={handleCloseAuth}
              initialMode={authModalState.mode}
            />
          </div>
        </Router>
      </CityProvider>
    </AuthProvider>
  );
};

export default App;
