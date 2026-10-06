import {
  Movie,
  TheatreWithShows,
  ShowSeatMapResponse,
  CheckoutValidationResponse,
  Booking,
  User
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Generate or get unique lock session token for current browser session
export function getUserLockToken(): string {
  let token = sessionStorage.getItem('bms_user_lock_token');
  if (!token) {
    token = 'lock_session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('bms_user_lock_token', token);
  }
  return token;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bms_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-lock-token': getUserLockToken()
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Request failed with status ' + res.status);
  }
  return data;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse<{ success: boolean; token: string; user: User }>(res);
  },

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; token: string; user: User }>(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; user: User }>(res);
  },

  // Movies
  async getMovies(params?: { category?: string; genre?: string; language?: string; search?: string; status?: string; trending?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.genre) query.set('genre', params.genre);
    if (params?.language) query.set('language', params.language);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.trending) query.set('trending', 'true');

    const res = await fetch(`${API_BASE}/movies?${query.toString()}`);
    return handleResponse<{ success: boolean; count: number; movies: Movie[] }>(res);
  },

  async getMovieById(id: string) {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    return handleResponse<{ success: boolean; movie: Movie }>(res);
  },

  // Theatres & Shows
  async getShowsForMovie(movieId: string, date: string, city?: string) {
    const query = new URLSearchParams({ movieId, date });
    if (city) query.set('city', city);
    const res = await fetch(`${API_BASE}/shows?${query.toString()}`);
    return handleResponse<{ success: boolean; date: string; theatres: TheatreWithShows[] }>(res);
  },

  // Seats & Temporary Locking
  async getShowSeats(showId: string) {
    const res = await fetch(`${API_BASE}/seats/${showId}`, {
      headers: getAuthHeader()
    });
    return handleResponse<ShowSeatMapResponse>(res);
  },

  async lockSeats(showId: string, seatIds: string[]) {
    const res = await fetch(`${API_BASE}/seats/lock`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        showId,
        seatIds,
        userLockToken: getUserLockToken()
      })
    });
    return handleResponse<{ success: boolean; lockedSeats: string[]; ttl: number; expiresAt: number }>(res);
  },

  async unlockSeats(showId: string, seatIds: string[]) {
    const res = await fetch(`${API_BASE}/seats/unlock`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        showId,
        seatIds,
        userLockToken: getUserLockToken()
      })
    });
    return handleResponse<{ success: boolean; releasedSeats: string[] }>(res);
  },

  // Checkout & Bookings
  async validateCheckout(showId: string, seatIds: string[]) {
    const res = await fetch(`${API_BASE}/bookings/validate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        showId,
        seatIds,
        userLockToken: getUserLockToken()
      })
    });
    return handleResponse<{ success: boolean; checkout: CheckoutValidationResponse }>(res);
  },

  async confirmBooking(params: {
    showId: string;
    seatIds: string[];
    paymentMethod: string;
    idempotencyKey: string;
  }) {
    const res = await fetch(`${API_BASE}/bookings/confirm`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        ...params,
        userLockToken: getUserLockToken()
      })
    });
    return handleResponse<{ success: boolean; message: string; booking: Booking }>(res);
  },

  async getUserBookings() {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; bookings: Booking[] }>(res);
  },

  async getBookingById(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; booking: Booking }>(res);
  },

  async cancelBooking(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; message: string; bookingId: string }>(res);
  },

  // Admin
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; analytics: any }>(res);
  },

  async createMovie(data: Partial<Movie>) {
    const res = await fetch(`${API_BASE}/admin/movies`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; message: string; movieId: string }>(res);
  },

  async deleteMovie(id: string) {
    const res = await fetch(`${API_BASE}/admin/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async createShow(data: any) {
    const res = await fetch(`${API_BASE}/admin/shows`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; message: string; showId: string }>(res);
  },

  async getAllBookingsAdmin() {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean; bookings: Booking[] }>(res);
  }
};
