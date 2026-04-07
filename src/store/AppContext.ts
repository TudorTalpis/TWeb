import React, { createContext } from "react";
import type { AppState, AppAction, Role } from "@/types";
import type { Currency, ExchangeRates } from "@/lib/currency";

function _getCurrentUser(state: AppState) {
  if (!state.session.userId) return null;
  return state.users.find((u) => u.id === state.session.userId) ?? null;
}

function _getProvider(state: AppState) {
  if (!state.session.userId) return null;
  return state.providerProfiles.find((p) => p.userId === state.session.userId) ?? null;
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentUser: ReturnType<typeof _getCurrentUser>;
  currentProvider: ReturnType<typeof _getProvider>;
  hasRole: (roles: Role[]) => boolean;
  resetData: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRates: ExchangeRates;
}

export const AppContext = createContext<AppContextValue | null>(null);
