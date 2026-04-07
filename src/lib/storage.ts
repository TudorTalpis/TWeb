import type { AppState, AppUser } from "@/types";

const KEYS = {
  session: "app_session",
  users: "app_users",
  providerProfiles: "app_provider_profiles",
  categories: "app_categories",
  services: "app_services",
  availability: "app_availability",
  timeoff: "app_timeoff",
  bookings: "app_bookings",
  applications: "app_provider_applications",
  notifications: "app_notifications",
  reviews: "app_reviews",
} as const;

type PersistedKey = keyof typeof KEYS;

/** Strip sensitive fields before persistence */
function sanitizeUser(user: AppUser): Omit<AppUser, "password"> & { password?: never } {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function saveState(state: AppState) {
  for (const [key, storageKey] of Object.entries(KEYS) as Array<[PersistedKey, (typeof KEYS)[PersistedKey]]>) {
    // Sanitize users before saving to remove passwords
    const data = key === "users" ? (state[key] as AppUser[]).map(sanitizeUser) : state[key];
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export function loadState(): Partial<AppState> | null {
  try {
    const session = localStorage.getItem(KEYS.session);
    if (!session) return null;
    const result: Partial<AppState> = {};
    for (const [key, storageKey] of Object.entries(KEYS) as Array<[PersistedKey, (typeof KEYS)[PersistedKey]]>) {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        result[key] = JSON.parse(raw) as AppState[PersistedKey];
      }
    }
    return result;
  } catch {
    return null;
  }
}

export function clearState() {
  for (const storageKey of Object.values(KEYS)) {
    localStorage.removeItem(storageKey);
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
