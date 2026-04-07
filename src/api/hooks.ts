import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  usersApi,
  categoriesApi,
  providersApi,
  servicesApi,
  availabilityApi,
  timeOffApi,
  bookingsApi,
  applicationsApi,
  reviewsApi,
  notificationsApi,
} from "../api";
import type {
  LoginRequest,
  SignUpRequest,
  UpdateUserDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ProviderProfileDto,
  CreateServiceDto,
  UpdateServiceDto,
  AvailabilityDto,
  CreateTimeOffDto,
  CreateBookingDto,
  UpdateBookingDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  CreateReviewDto,
  CreateNotificationDto,
} from "./types";

const QUERY_KEYS = {
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    detail: (id: string) => ["categories", id] as const,
  },
  providers: {
    all: ["providers"] as const,
    detail: (id: string) => ["providers", id] as const,
    slug: (slug: string) => ["providers", "slug", slug] as const,
    byUser: (userId: string) => ["providers", "user", userId] as const,
  },
  services: {
    all: ["services"] as const,
    detail: (id: string) => ["services", id] as const,
    byProvider: (providerId: string) => ["services", "provider", providerId] as const,
  },
  availability: {
    all: ["availability"] as const,
    byProvider: (providerId: string) => ["availability", "provider", providerId] as const,
  },
  timeoff: {
    all: ["timeoff"] as const,
    byProvider: (providerId: string) => ["timeoff", "provider", providerId] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    detail: (id: string) => ["bookings", id] as const,
    byUser: (userId: string) => ["bookings", "user", userId] as const,
    byProvider: (providerId: string) => ["bookings", "provider", providerId] as const,
  },
  applications: {
    all: ["applications"] as const,
    detail: (id: string) => ["applications", id] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    byProvider: (providerId: string) => ["reviews", "provider", providerId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    byUser: (userId: string) => ["notifications", "user", userId] as const,
  },
};

// ============ AUTH HOOKS ============
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
  });
}

// ============ USERS HOOKS ============
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.all,
    queryFn: () => usersApi.getAll(),
  });
}

export function useUser(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id!),
    queryFn: () => usersApi.getById(id!),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => usersApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(data.id) });
    },
  });
}

// ============ CATEGORIES HOOKS ============
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: () => categoriesApi.getAll(),
  });
}

export function useCategory(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.detail(id!),
    queryFn: () => categoriesApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
    },
  });
}

// ============ PROVIDERS HOOKS ============
export function useProviders() {
  return useQuery({
    queryKey: QUERY_KEYS.providers.all,
    queryFn: () => providersApi.getAll(),
  });
}

export function useProvider(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.detail(id!),
    queryFn: () => providersApi.getById(id!),
    enabled: !!id,
  });
}

export function useProviderBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.slug(slug!),
    queryFn: () => providersApi.getBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProviderByUserId(userId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.byUser(userId!),
    queryFn: () => providersApi.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProviderProfileDto) => providersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all });
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProviderProfileDto }) => providersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all });
    },
  });
}

export function useToggleFeaturedProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all });
    },
  });
}

export function useToggleSponsoredProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.toggleSponsored(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all });
    },
  });
}

export function useToggleBlockedProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.toggleBlocked(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all });
    },
  });
}

// ============ SERVICES HOOKS ============
export function useServices() {
  return useQuery({
    queryKey: QUERY_KEYS.services.all,
    queryFn: () => servicesApi.getAll(),
  });
}

export function useService(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.services.detail(id!),
    queryFn: () => servicesApi.getById(id!),
    enabled: !!id,
  });
}

export function useServicesByProvider(providerId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.services.byProvider(providerId!),
    queryFn: () => servicesApi.getByProviderId(providerId!),
    enabled: !!providerId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
    },
  });
}

// ============ AVAILABILITY HOOKS ============
export function useAvailability() {
  return useQuery({
    queryKey: QUERY_KEYS.availability.all,
    queryFn: () => availabilityApi.getAll(),
  });
}

export function useAvailabilityByProvider(providerId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.availability.byProvider(providerId!),
    queryFn: () => availabilityApi.getByProviderId(providerId!),
    enabled: !!providerId,
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: AvailabilityDto[] }) =>
      availabilityApi.setForProvider(providerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availability.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.availability.byProvider(variables.providerId),
      });
    },
  });
}

// ============ TIME OFF HOOKS ============
export function useTimeOff() {
  return useQuery({
    queryKey: QUERY_KEYS.timeoff.all,
    queryFn: () => timeOffApi.getAll(),
  });
}

export function useTimeOffByProvider(providerId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.timeoff.byProvider(providerId!),
    queryFn: () => timeOffApi.getByProviderId(providerId!),
    enabled: !!providerId,
  });
}

export function useCreateTimeOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeOffDto) => timeOffApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.timeoff.all });
    },
  });
}

export function useDeleteTimeOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeOffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.timeoff.all });
    },
  });
}

// ============ BOOKINGS HOOKS ============
export function useBookings() {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.all,
    queryFn: () => bookingsApi.getAll(),
  });
}

export function useBooking(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.detail(id!),
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });
}

export function useBookingsByUser(userId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.byUser(userId!),
    queryFn: () => bookingsApi.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useBookingsByProvider(providerId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.byProvider(providerId!),
    queryFn: () => bookingsApi.getByProviderId(providerId!),
    enabled: !!providerId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDto }) => bookingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    },
  });
}

// ============ APPLICATIONS HOOKS ============
export function useApplications() {
  return useQuery({
    queryKey: QUERY_KEYS.applications.all,
    queryFn: () => applicationsApi.getAll(),
  });
}

export function useApplication(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.detail(id!),
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationDto) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications.all });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationDto }) => applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications.all });
    },
  });
}

// ============ REVIEWS HOOKS ============
export function useReviews() {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.all,
    queryFn: () => reviewsApi.getAll(),
  });
}

export function useReviewsByProvider(providerId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.byProvider(providerId!),
    queryFn: () => reviewsApi.getByProviderId(providerId!),
    enabled: !!providerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all });
    },
  });
}

// ============ NOTIFICATIONS HOOKS ============
export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: () => notificationsApi.getAll(),
  });
}

export function useNotificationsByUser(userId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.byUser(userId!),
    queryFn: () => notificationsApi.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => notificationsApi.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}
