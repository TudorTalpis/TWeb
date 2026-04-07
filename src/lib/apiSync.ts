/**
 * API Integration Helper
 *
 * This module provides functions to sync the AppContext state with the backend API.
 * It allows gradual migration from localStorage to API-based data fetching.
 */

import type { AppState, AppAction } from "@/types";
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
    categories: categories as any,
    providerProfiles: providers as any,
    services: services as any,
    availability: availability as any,
    timeoff: timeoff as any,
    bookings: bookings as any,
    applications: applications as any,
    reviews: reviews as any,
    notifications: notifications as any,
    users: users as any,
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
