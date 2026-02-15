import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { AppState, AppAction, Role } from "@/types";
import { saveState, loadState } from "@/lib/storage";
import { createSeedData } from "@/data/seed";

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STATE":
      return { ...action.payload };

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
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a
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
  const saved = loadState();
  if (saved && saved.users && saved.users.length > 0) {
    return { ...createSeedData(), ...saved };
  }
  return createSeedData();
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

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = getCurrentUser(state);
  const currentProvider = getProvider(state);
  const hasRole = (roles: Role[]) => roles.includes(state.session.role);

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
