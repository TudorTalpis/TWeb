import { useContext } from "react";
import { AppContext } from "./AppContext";

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}

export function useCurrentUser() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside AppProvider");
  return ctx.currentUser;
}
