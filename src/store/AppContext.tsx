import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react";
import type { AppState, AppAction, Role } from "@/types";
import { saveState, loadState } from "@/lib/storage";
import { createSeedData } from "@/data/seed";
import { isHourOccupied } from "@/lib/booking";
import { normalizeCategory } from "@/lib/categories";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STATE":
      return { ...action.payload };
    case "ADD_CATEGORY": {
      const normalized = normalizeCategory(action.payload.name);
      const exists = state.categories.some(
        (category) =>
          category.id === action.payload.id || normalizeCategory(category.name) === normalized,
      );
      if (exists) return state;
      return { ...state, categories: [...state.categories, action.payload] };
    }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
            c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
            u.id === action.payload.id ? { ...u, ...action.payload } : u
        ),
      };

    case "LOGIN": {
      const user = state.users.find((u) => u.id === action.payload.userId);
      if (!user) return state;
      return { ...state, session: { userId: user.id, role: user.role } };
    }
    case "LOGOUT":
      return { ...state, session: { userId: null, role: "GUEST" } };

    case "UPDATE_PROVIDER_PROFILE":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case "ADD_SERVICE":
      return { ...state, services: [...state.services, action.payload] };
    case "UPDATE_SERVICE":
      return {
        ...state,
        services: state.services.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
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
          state.bookings
        )
      ) {
        return state;
      }
      return { ...state, bookings: [...state.bookings, action.payload] };
    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
            b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
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
              : a
        ),
      };

    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
            n.id === action.payload ? { ...n, read: true } : n
        ),
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
            p.id === action.payload ? { ...p, featured: !p.featured } : p
        ),
      };
    case "TOGGLE_SPONSORED":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
            p.id === action.payload ? { ...p, sponsored: !p.sponsored } : p
        ),
      };
    case "TOGGLE_BLOCKED":
      return {
        ...state,
        providerProfiles: state.providerProfiles.map((p) =>
            p.id === action.payload ? { ...p, blocked: !p.blocked } : p
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

function getInitialState(): AppState {
  const seed = createSeedData();
  const saved = loadState();
  if (saved && saved.users && saved.users.length > 0) {
    type RawProviderProfile = Partial<AppState["providerProfiles"][number]> & { categoryId?: string };
    type RawApplication = Partial<AppState["applications"][number]> & { categoryId?: string };
    type RawService = Partial<AppState["services"][number]>;
    type RawUser = Partial<AppState["users"][number]>;

    // Merge seed users (with passwords) with saved user data (without passwords for security)
    // Passwords are intentionally NOT stored in localStorage for security
    const seedById = new Map(seed.users.map((u) => [u.id, u]));
    const savedUsers = saved.users as RawUser[];
    const users = savedUsers.map((u) => {
      const seedUser = seedById.get(u.id!);
      // Always use seed user's password since we don't persist passwords
      return { 
        ...(seedUser ?? u), 
        phone: (seedUser?.phone ?? u.phone ?? ""),
        password: seedUser?.password ?? "" 
      };
    });
    for (const seedUser of seed.users) {
      if (!savedUsers.some((u) => u.id === seedUser.id)) users.push(seedUser);
    }
    const providerProfiles = (saved.providerProfiles ?? seed.providerProfiles).map((p: RawProviderProfile) => {
      const parsedDefaultBuffer = Number(p.defaultServiceBufferMinutes);
      const categoryIds = Array.isArray(p.categoryIds)
        ? p.categoryIds.filter(Boolean)
        : p.categoryId
          ? [p.categoryId]
          : [];
      const pendingCategoryNames = Array.isArray(p.pendingCategoryNames)
        ? p.pendingCategoryNames.filter((name: unknown) => typeof name === "string" && name.trim().length > 0)
        : [];
      return {
        ...p,
        categoryIds,
        pendingCategoryNames,
        defaultServiceBufferMinutes: Number.isFinite(parsedDefaultBuffer) ? Math.max(0, parsedDefaultBuffer) : 0,
        autoConfirm: p.autoConfirm ?? false,
      };
    });
    const applications = (saved.applications ?? seed.applications ?? []).map((a: RawApplication) => {
      const categoryIds = Array.isArray(a.categoryIds)
        ? a.categoryIds.filter(Boolean)
        : a.categoryId
          ? [a.categoryId]
          : [];
      return { ...a, categoryIds };
    });
    const services = (saved.services ?? seed.services).map((s: RawService) => {
      const hasCustomBuffer = s.bufferMinutes !== null && s.bufferMinutes !== undefined && s.bufferMinutes !== "";
      const parsedBuffer = Number(s.bufferMinutes);
      return {
        ...s,
        bufferMinutes: hasCustomBuffer && Number.isFinite(parsedBuffer) ? Math.max(0, parsedBuffer) : null,
      };
    });
    return { ...seed, ...saved, users, providerProfiles, services, applications };
  }
  return seed;
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentUser: ReturnType<typeof getCurrentUser>;
  currentProvider: ReturnType<typeof getProvider>;
  hasRole: (roles: Role[]) => boolean;
  resetData: () => void;
}

function getCurrentUser(state: AppState) {
  if (!state.session.userId) return null;
  return state.users.find((u) => u.id === state.session.userId) ?? null;
}

function getProvider(state: AppState) {
  if (!state.session.userId) return null;
  return state.providerProfiles.find((p) => p.userId === state.session.userId) ?? null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Listen for storage changes from other tabs (e.g. admin approving an application)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      const relevantKeys = [
        "app_session", "app_users", "app_provider_profiles",
        "app_services", "app_availability", "app_timeoff",
        "app_bookings", "app_notifications", "app_reviews", "app_categories",
      ];
      if (!relevantKeys.includes(e.key)) return;

      try {
        const saved = loadState();
        if (!saved) return;

        const currentState = stateRef.current;
        const merged: AppState = {
          ...currentState,
          ...(saved as Partial<AppState>),
          session: currentState.session.userId
            ? currentState.session
            : (saved.session ?? currentState.session),
        };

        // Re-resolve user's actual role from the updated users array
        if (merged.session.userId) {
          const updatedUser = merged.users.find((u) => u.id === merged.session.userId);
          if (updatedUser && updatedUser.role !== merged.session.role) {
            merged.session = { userId: updatedUser.id, role: updatedUser.role };
          }
        }

        dispatch({ type: "SET_STATE", payload: merged });
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentUser = getCurrentUser(state);
  const currentProvider = getProvider(state);
  // Use the user's actual role from the database, not the stale session role
  const hasRole = (roles: Role[]) => roles.includes(currentUser?.role ?? state.session.role);

  const resetData = () => {
    const fresh = createSeedData();
    dispatch({ type: "SET_STATE", payload: fresh });
  };

  return (
      <AppContext.Provider value={{ state, dispatch, currentUser, currentProvider, hasRole, resetData }}>
        {children}
      </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}
