import type { ListingType } from "@/lib/constants";

export interface User {
  id: number;
  email: string;
  commercial_register_number?: string | null;
  created_at: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: ListingType;
  city: string;
  country: string;
  address: string;
  lat: number | null;
  lng: number | null;
  size_sqm: number;
  slots: number;
  price_sqm: number;
  currency: string;
  amenities: string[];
  images: string[];
  videos: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  free_cancel: boolean;
  insurance: boolean;
  created_at: string;
  updated_at: string;
  owner_email?: string;
  booking_count?: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  size_sqm: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  city?: string;
  type?: string;
  images?: string[];
  address?: string;
  price_sqm?: number;
  renter_email?: string;
  owner_id?: number;
}

export interface Review {
  id: number;
  booking_id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardStats {
  listings: { total: number; active: number };
  bookings: { total: number; pending: number; confirmed: number };
  revenue: number;
  avg_rating: number;
  review_count: number;
}
