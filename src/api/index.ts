import { apiClient } from "../lib/apiClient";
import type {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  UserDto,
  UpdateUserDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ProviderProfileDto,
  ServiceDto,
  CreateServiceDto,
  UpdateServiceDto,
  AvailabilityDto,
  TimeOffDto,
  CreateTimeOffDto,
  BookingDto,
  CreateBookingDto,
  UpdateBookingDto,
  ProviderApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  ReviewDto,
  CreateReviewDto,
  NotificationDto,
  CreateNotificationDto,
} from "./types";

// ============ AUTH API ============
export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  signUp: (data: SignUpRequest) => apiClient.post<AuthResponse>("/auth/signup", data).then((r) => r.data),
};

// ============ USERS API ============
export const usersApi = {
  getAll: () => apiClient.get<UserDto[]>("/users").then((r) => r.data),

  getById: (id: string) => apiClient.get<UserDto>(`/users/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateUserDto) => apiClient.put<UserDto>(`/users/${id}`, data).then((r) => r.data),
};

// ============ CATEGORIES API ============
export const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>("/categories").then((r) => r.data),

  getById: (id: string) => apiClient.get<CategoryDto>(`/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryDto) => apiClient.post<CategoryDto>("/categories", data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryDto) =>
    apiClient.put<CategoryDto>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`).then((r) => r.data),
};

// ============ PROVIDERS API ============
export const providersApi = {
  getAll: () => apiClient.get<ProviderProfileDto[]>("/providers").then((r) => r.data),

  getById: (id: string) => apiClient.get<ProviderProfileDto>(`/providers/${id}`).then((r) => r.data),

  getBySlug: (slug: string) => apiClient.get<ProviderProfileDto>(`/providers/slug/${slug}`).then((r) => r.data),

  getByUserId: (userId: string) => apiClient.get<ProviderProfileDto>(`/providers/user/${userId}`).then((r) => r.data),

  create: (data: ProviderProfileDto) => apiClient.post<ProviderProfileDto>("/providers", data).then((r) => r.data),

  update: (id: string, data: ProviderProfileDto) =>
    apiClient.put<ProviderProfileDto>(`/providers/${id}`, data).then((r) => r.data),

  toggleFeatured: (id: string) => apiClient.patch<ProviderProfileDto>(`/providers/${id}/featured`).then((r) => r.data),

  toggleSponsored: (id: string) =>
    apiClient.patch<ProviderProfileDto>(`/providers/${id}/sponsored`).then((r) => r.data),

  toggleBlocked: (id: string) => apiClient.patch<ProviderProfileDto>(`/providers/${id}/blocked`).then((r) => r.data),
};

// ============ SERVICES API ============
export const servicesApi = {
  getAll: () => apiClient.get<ServiceDto[]>("/services").then((r) => r.data),

  getById: (id: string) => apiClient.get<ServiceDto>(`/services/${id}`).then((r) => r.data),

  getByProviderId: (providerId: string) =>
    apiClient.get<ServiceDto[]>(`/services/provider/${providerId}`).then((r) => r.data),

  create: (data: CreateServiceDto) => apiClient.post<ServiceDto>("/services", data).then((r) => r.data),

  update: (id: string, data: UpdateServiceDto) =>
    apiClient.put<ServiceDto>(`/services/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/services/${id}`).then((r) => r.data),
};

// ============ AVAILABILITY API ============
export const availabilityApi = {
  getAll: () => apiClient.get<AvailabilityDto[]>("/availability").then((r) => r.data),

  getByProviderId: (providerId: string) =>
    apiClient.get<AvailabilityDto[]>(`/availability/provider/${providerId}`).then((r) => r.data),

  setForProvider: (providerId: string, data: AvailabilityDto[]) =>
    apiClient.put<AvailabilityDto[]>(`/availability/provider/${providerId}`, data).then((r) => r.data),
};

// ============ TIME OFF API ============
export const timeOffApi = {
  getAll: () => apiClient.get<TimeOffDto[]>("/timeoff").then((r) => r.data),

  getByProviderId: (providerId: string) =>
    apiClient.get<TimeOffDto[]>(`/timeoff/provider/${providerId}`).then((r) => r.data),

  create: (data: CreateTimeOffDto) => apiClient.post<TimeOffDto>("/timeoff", data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/timeoff/${id}`).then((r) => r.data),
};

// ============ BOOKINGS API ============
export const bookingsApi = {
  getAll: () => apiClient.get<BookingDto[]>("/bookings").then((r) => r.data),

  getById: (id: string) => apiClient.get<BookingDto>(`/bookings/${id}`).then((r) => r.data),

  getByUserId: (userId: string) => apiClient.get<BookingDto[]>(`/bookings/user/${userId}`).then((r) => r.data),

  getByProviderId: (providerId: string) =>
    apiClient.get<BookingDto[]>(`/bookings/provider/${providerId}`).then((r) => r.data),

  create: (data: CreateBookingDto) => apiClient.post<BookingDto>("/bookings", data).then((r) => r.data),

  update: (id: string, data: UpdateBookingDto) =>
    apiClient.put<BookingDto>(`/bookings/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/bookings/${id}`).then((r) => r.data),
};

// ============ APPLICATIONS API ============
export const applicationsApi = {
  getAll: () => apiClient.get<ProviderApplicationDto[]>("/applications").then((r) => r.data),

  getById: (id: string) => apiClient.get<ProviderApplicationDto>(`/applications/${id}`).then((r) => r.data),

  create: (data: CreateApplicationDto) =>
    apiClient.post<ProviderApplicationDto>("/applications", data).then((r) => r.data),

  update: (id: string, data: UpdateApplicationDto) =>
    apiClient.put<ProviderApplicationDto>(`/applications/${id}`, data).then((r) => r.data),
};

// ============ REVIEWS API ============
export const reviewsApi = {
  getAll: () => apiClient.get<ReviewDto[]>("/reviews").then((r) => r.data),

  getByProviderId: (providerId: string) =>
    apiClient.get<ReviewDto[]>(`/reviews/provider/${providerId}`).then((r) => r.data),

  create: (data: CreateReviewDto) => apiClient.post<ReviewDto>("/reviews", data).then((r) => r.data),
};

// ============ NOTIFICATIONS API ============
export const notificationsApi = {
  getAll: () => apiClient.get<NotificationDto[]>("/notifications").then((r) => r.data),

  getByUserId: (userId: string) =>
    apiClient.get<NotificationDto[]>(`/notifications/user/${userId}`).then((r) => r.data),

  create: (data: CreateNotificationDto) => apiClient.post<NotificationDto>("/notifications", data).then((r) => r.data),

  markAsRead: (id: string) => apiClient.patch<NotificationDto>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: (userId: string) =>
    apiClient.patch<NotificationDto[]>(`/notifications/user/${userId}/read-all`).then((r) => r.data),
};
