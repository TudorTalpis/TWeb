// ============ ROLES ============
export type Role = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

// ============ USER ============
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

// ============ SESSION ============
export interface AppSession {
  userId: string | null;
  role: Role;
}

// ============ CATEGORY ============
export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  color: string; // tailwind class token
}

// ============ PROVIDER ============
export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  slug: string; // custom URL slug e.g. "AlinaNails"
  description: string;
  categoryId: string;
  avatar: string;
  coverPhoto: string; // cover/banner image URL
  galleryPhotos: string[]; // up to 6 portfolio photos
  phone: string;
  location: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  sponsored: boolean;
  blocked: boolean;
}

// ============ SERVICE ============
export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
  duration: number; // minutes
  categoryId: string;
}

// ============ AVAILABILITY ============
export interface Availability {
  id: string;
  providerId: string;
  weekday: number; // 0=Sun..6=Sat
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotMinutes: number;
  bufferMinutes: number;
}

// ============ TIME OFF ============
export interface TimeOff {
  id: string;
  providerId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  reason?: string;
}

// ============ BOOKING ============
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  userName: string;
}

// ============ PROVIDER APPLICATION ============
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProviderApplication {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  phone: string;
  location: string;
  avatar: string;
  galleryPhotos: string[];
  status: ApplicationStatus;
  createdAt: string;
}

// ============ REVIEW ============
export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  userName: string;
}

// ============ NOTIFICATION ============
export type NotificationType =
  | "booking_success"
  | "new_booking"
  | "review_request"
  | "application_submitted"
  | "application_approved"
  | "application_rejected"
  | "provider_blocked"
  | "provider_unblocked";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

// ============ GLOBAL STATE ============
export interface AppState {
  session: AppSession;
  users: AppUser[];
  providerProfiles: ProviderProfile[];
  categories: Category[];
  services: Service[];
  availability: Availability[];
  timeoff: TimeOff[];
  bookings: Booking[];
  applications: ProviderApplication[];
  notifications: AppNotification[];
  reviews: Review[];
}

// ============ ACTIONS ============
export type AppAction =
  | { type: "LOGIN"; payload: { userId: string } }
  | { type: "LOGOUT" }
  | { type: "SET_STATE"; payload: AppState }
  | { type: "UPDATE_PROVIDER_PROFILE"; payload: Partial<ProviderProfile> & { id: string } }
  | { type: "ADD_SERVICE"; payload: Service }
  | { type: "UPDATE_SERVICE"; payload: Partial<Service> & { id: string } }
  | { type: "DELETE_SERVICE"; payload: string }
  | { type: "SET_AVAILABILITY"; payload: Availability[] }
  | { type: "ADD_TIMEOFF"; payload: TimeOff }
  | { type: "DELETE_TIMEOFF"; payload: string }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "UPDATE_BOOKING"; payload: Partial<Booking> & { id: string } }
  | { type: "DELETE_BOOKING"; payload: string }
  | { type: "ADD_APPLICATION"; payload: ProviderApplication }
  | { type: "UPDATE_APPLICATION"; payload: { id: string; status: ApplicationStatus } }
  | { type: "ADD_NOTIFICATION"; payload: AppNotification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "TOGGLE_FEATURED"; payload: string }
  | { type: "TOGGLE_SPONSORED"; payload: string }
  | { type: "TOGGLE_BLOCKED"; payload: string }
  | { type: "ADD_USER"; payload: AppUser }
  | { type: "ADD_PROVIDER_PROFILE"; payload: ProviderProfile }
  | { type: "ADD_REVIEW"; payload: Review };
