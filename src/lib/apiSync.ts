/**
 * API Integration Helper
 *
 * This module provides functions to sync the AppContext state with the backend API.
 * It allows gradually migrating from localStorage to API-based data fetching.
 */

import type {
  AppState,
  AppAction,
  Category,
  ProviderProfile,
  Service,
  Availability,
  TimeOff,
  Booking,
  ProviderApplication,
  Review,
  AppNotification,
  AppUser,
} from "@/types";
import {
  categoriesApi,
  providersApi,
  servicesApi,
  availabilityApi,
  timeOffApi,
  bookingsApi,
  applicationsApi,
  reviewsApi,
  notificationsApi,
  usersApi,
} from "@/api";

/**
 * Fetches all data from the backend API and returns an AppState object.
 * Use this to initialize the app state from the API instead of localStorage.
 */
export async function fetchAppStateFromAPI(): Promise<Partial<AppState>> {
  const [
    categories,
    providers,
    services,
    availability,
    timeoff,
    bookings,
    applications,
    reviews,
    notifications,
    users,
  ] = await Promise.all([
    categoriesApi.getAll().catch(() => []),
    providersApi.getAll().catch(() => []),
    servicesApi.getAll().catch(() => []),
    availabilityApi.getAll().catch(() => []),
    timeOffApi.getAll().catch(() => []),
    bookingsApi.getAll().catch(() => []),
    applicationsApi.getAll().catch(() => []),
    reviewsApi.getAll().catch(() => []),
    notificationsApi.getAll().catch(() => []),
    usersApi.getAll().catch(() => []),
  ]);

  return {
    categories: categories as Category[],
    providerProfiles: providers as ProviderProfile[],
    services: services as Service[],
    availability: availability as Availability[],
    timeoff: timeoff as TimeOff[],
    bookings: bookings as Booking[],
    applications: applications as ProviderApplication[],
    reviews: reviews as Review[],
    notifications: notifications as AppNotification[],
    users: users as AppUser[],
  };
}

/**
 * Creates a data sync function that can be dispatched to update state.
 * Returns an action that can be dispatched to set the state from API data.
 */
export function createSetStateFromAPIAction(data: Partial<AppState>): AppAction {
  return {
    type: "SET_STATE",
    payload: {
      session: { userId: null, role: "GUEST" },
      users: [],
      providerProfiles: [],
      categories: [],
      services: [],
      availability: [],
      timeoff: [],
      bookings: [],
      applications: [],
      notifications: [],
      reviews: [],
      ...data,
    } as AppState,
  };
}
