export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  totalBookings?: number;
  membershipTier?: string;
  loyaltyPoints?: number;
}

export interface CastMember {
  name: string;
  role: string;
  image: string;
}

export interface Movie {
  id: string;
  title: string;
  poster_url: string;
  backdrop_url: string;
  trailer_url: string;
  rating: number;
  votes: number;
  duration: string;
  release_date: string;
  language: string;
  genres: string[];
  description: string;
  cast_list: CastMember[];
  director: string;
  is_trending: boolean;
  is_now_showing: boolean;
  is_upcoming: boolean;
  category: 'movie' | 'event';
  availableDates?: string[];
  theatresCount?: number;
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  facilities: string[];
}

export interface Screen {
  id: string;
  theatre_id: string;
  name: string;
  format: string;
  total_seats: number;
}

export interface ShowSlot {
  id: string;
  screenId: string;
  screenName: string;
  format: string;
  startTime: string;
  endTime: string;
  date: string;
  language: string;
  totalSeats: number;
  availableSeats: number;
  statusBadge: 'Available' | 'Filling Fast' | 'Almost Full' | 'Sold Out';
  minPrice: number;
}

export interface TheatreWithShows {
  theatreId: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  facilities: string[];
  shows: ShowSlot[];
}

export interface Seat {
  seatId: string;
  showSeatId: string;
  rowLabel: string;
  seatNumber: number;
  category: 'RECLINER' | 'PRIME' | 'CLASSIC';
  price: number;
  status: 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED' | 'DISABLED';
  isLockedByMe: boolean;
  remainingTtl: number;
}

export interface SeatCategoryGroup {
  category: string;
  price: number;
  rows: Record<string, Seat[]>;
}

export interface ShowDetails {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  language: string;
  format: string;
  movie: Movie;
  theatre: Theatre;
  screen: Screen;
}

export interface ShowSeatMapResponse {
  success: boolean;
  show: ShowDetails;
  stats: {
    totalSeats: number;
    available: number;
    booked: number;
    locked: number;
  };
  lockTtlSeconds: number;
  categories: SeatCategoryGroup[];
}

export interface BookingItem {
  id: string;
  booking_id: string;
  show_seat_id: string;
  seat_label: string;
  price: number;
  category: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  show_id: string;
  total_amount: number;
  convenience_fee: number;
  tax: number;
  final_amount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  payment_status: 'COMPLETED' | 'REFUNDED' | 'FAILED';
  payment_id: string;
  idempotency_key: string;
  created_at: string;
  items: BookingItem[];
  show?: ShowDetails;
  movie?: Movie;
  theatre?: Theatre;
  screen?: Screen;
  user?: User;
}

export interface CheckoutValidationResponse {
  showId: string;
  items: {
    seatId: string;
    seatLabel: string;
    category: string;
    price: number;
  }[];
  baseAmount: number;
  convenienceFee: number;
  tax: number;
  finalAmount: number;
  currency: string;
}
