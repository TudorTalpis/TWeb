// API DTOs matching backend response shapes
import type { Role, BookingStatus, ApplicationStatus, NotificationType } from "../types";

// ============ AUTH DTOs ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  isDemo: boolean;
}

// ============ USER DTOs ============
export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// ============ CATEGORY DTOs ============
export interface CategoryDto {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface CreateCategoryDto {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  description?: string;
  color?: string;
}

// ============ PROVIDER DTOs ============
export interface ProviderProfileDto {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  categoryIds: string[];
  pendingCategoryNames: string[];
  avatar: string;
  coverPhoto: string;
  galleryPhotos: string[];
  phone: string;
  location: string;
  defaultServiceBufferMinutes: number;
  autoConfirm: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
  sponsored: boolean;
  blocked: boolean;
}

// ============ SERVICE DTOs ============
export interface ServiceDto {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  bufferMinutes: number | null;
  categoryId: string;
}

export interface CreateServiceDto {
  providerId: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  bufferMinutes?: number;
  categoryId: string;
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  bufferMinutes?: number | null;
  categoryId?: string;
}

// ============ AVAILABILITY DTOs ============
export interface AvailabilityDto {
  id: string;
  providerId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  bufferMinutes: number;
  isBlocked?: boolean;
}

// ============ TIME OFF DTOs ============
export interface TimeOffDto {
  id: string;
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface CreateTimeOffDto {
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

// ============ BOOKING DTOs ============
export interface BookingDto {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  userName: string;
  userPhone?: string;
}

export interface CreateBookingDto {
  userId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  userPhone?: string;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  userPhone?: string;
}

// ============ APPLICATION DTOs ============
export interface ProviderApplicationDto {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  categoryIds: string[];
  phone: string;
  location: string;
  avatar: string;
  galleryPhotos: string[];
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface CreateApplicationDto {
  userId: string;
  name: string;
  slug: string;
  description: string;
  categoryIds: string[];
  phone: string;
  location: string;
  avatar: string;
  galleryPhotos: string[];
}

export interface UpdateApplicationDto {
  status: ApplicationStatus;
  rejectReason?: string;
}

// ============ REVIEW DTOs ============
export interface ReviewDto {
  id: string;
  bookingId: string;
  providerId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface CreateReviewDto {
  bookingId: string;
  providerId: string;
  userId: string;
  rating: number;
  comment: string;
  userName: string;
}

// ============ NOTIFICATION DTOs ============
export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string;
}
