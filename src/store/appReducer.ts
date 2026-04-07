import type { AppState, AppAction } from "@/types";
import { normalizeCategory } from "@/lib/categories";
import { isHourOccupied } from "@/lib/booking";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STATE":
      return { ...action.payload };
    case "ADD_CATEGORY": {
      const normalized = normalizeCategory(action.payload.name);
      const exists = state.categories.some(
        (category) => category.id === action.payload.id || normalizeCategory(category.name) === normalized,
      );
      if (exists) return state;
      return { ...state, categories: [...state.categories, action.payload] };
    }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)),
      };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? { ...u, ...action.payload } : u)),
      };

    case "LOGIN": {
      const user = state.users.find((u) => u.id === action.payload.userId);
      if (!user) {
        return { ...state, session: { userId: action.payload.userId, role: "USER" } };
      }
      return { ...state, session: { userId: user.id, role: user.role } };
    }
    case "LOGOUT":
      return { ...state, session: { userId: null, role: "GUEST" } };

    case "UPDATE_PROVIDER_PROFILE":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p,
        ),
      };

    case "ADD_SERVICE":
      return { ...state, services: [...state.services, action.payload] };
    case "UPDATE_SERVICE":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload } : s)),
      };
    case "DELETE_SERVICE":
      return { ...state, services: state.services.filter((s) => s.id !== action.payload) };

    case "SET_AVAILABILITY":
      return { ...state, availability: action.payload };
    case "ADD_TIMEOFF":
      return { ...state, timeoff: [...state.timeoff, action.payload] };
    case "DELETE_TIMEOFF":
      return { ...state, timeoff: state.timeoff.filter((t) => t.id !== action.payload) };

    case "ADD_BOOKING":
      if (state.providerProfiles.some((provider) => provider.id === action.payload.providerId && provider.blocked)) {
        return state;
      }
      if (
        isHourOccupied(
          action.payload.providerId,
          action.payload.date,
          action.payload.startTime,
          action.payload.endTime,
          state.bookings,
        )
      ) {
        return state;
      }
      return { ...state, bookings: [...state.bookings, action.payload] };
    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.payload.id ? { ...b, ...action.payload } : b)),
      };
    case "DELETE_BOOKING":
      return { ...state, bookings: state.bookings.filter((b) => b.id !== action.payload) };

    case "ADD_APPLICATION":
      return { ...state, applications: [...state.applications, action.payload] };
    case "UPDATE_APPLICATION":
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.payload.id
            ? {
                ...a,
                status: action.payload.status,
                rejectReason: action.payload.status === "REJECTED" ? action.payload.rejectReason : undefined,
              }
            : a,
        ),
      };

    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "TOGGLE_FEATURED":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
          p.id === action.payload ? { ...p, featured: !p.featured } : p,
        ),
      };
    case "TOGGLE_SPONSORED":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
          p.id === action.payload ? { ...p, sponsored: !p.sponsored } : p,
        ),
      };
    case "TOGGLE_BLOCKED":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
          p.id === action.payload ? { ...p, blocked: !p.blocked } : p,
        ),
      };

    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "ADD_PROVIDER_PROFILE":
      return { ...state, providerProfiles: [...state.providerProfiles, action.payload] };
    case "ADD_REVIEW":
      return { ...state, reviews: [...state.reviews, action.payload] };

    default:
      return state;
  }
}
