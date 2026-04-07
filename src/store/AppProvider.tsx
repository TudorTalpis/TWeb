import React, { useReducer, useEffect, useState, type ReactNode } from "react";
import type { AppState } from "@/types";
import { saveState, loadState } from "@/lib/storage";
import { createSeedData } from "@/data/seed";
import { appReducer } from "./appReducer";
import { AppContext } from "./AppContext";
import type { Currency } from "@/lib/currency";
import { DEFAULT_RATES } from "@/lib/currency";

function getInitialState(): AppState {
  const seed = createSeedData();
  const saved = loadState();
  if (saved && saved.users && saved.users.length > 0) {
    type RawProviderProfile = Partial<AppState["providerProfiles"][number]> & { categoryId?: string };
    type RawApplication = Partial<AppState["applications"][number]> & { categoryId?: string };
    type RawService = Partial<AppState["services"][number]>;
    type RawUser = Partial<AppState["users"][number]>;

    const seedById = new Map(seed.users.map((u) => [u.id, u]));
    const savedUsers = saved.users as RawUser[];
    const users = savedUsers.map((u) => {
      const seedUser = seedById.get(u.id!);
      return {
        ...(seedUser ?? u),
        phone: seedUser?.phone ?? u.phone ?? "",
        password: seedUser?.password ?? "",
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  const [currency, setCurrency] = useState<Currency>("MDL");
  const exchangeRates = DEFAULT_RATES;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = getCurrentUser(state);
  const currentProvider = getProvider(state);
  const hasRole = (roles: Role[]) => roles.includes(currentUser?.role ?? state.session.role);

  const resetData = () => {
    const fresh = createSeedData();
    dispatch({ type: "SET_STATE", payload: fresh });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        currentUser,
        currentProvider,
        hasRole,
        resetData,
        currency,
        setCurrency,
        exchangeRates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function getCurrentUser(state: AppState) {
  if (!state.session.userId) return null;
  return state.users.find((u) => u.id === state.session.userId) ?? null;
}

function getProvider(state: AppState) {
  if (!state.session.userId) return null;
  return state.providerProfiles.find((p) => p.userId === state.session.userId) ?? null;
}
