import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import type { Role } from "@/types";

interface RouteGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RouteGuard({ roles, children }: RouteGuardProps) {
  const { state } = useAppStore();
  const location = useLocation();

  // Resolve the user's actual role from the users array (source of truth)
  // instead of relying on the potentially stale session role
  const currentUser = state.session.userId
    ? state.users.find((u) => u.id === state.session.userId)
    : null;
  const actualRole = currentUser?.role ?? state.session.role;

  const currentProvider = state.session.userId
    ? state.providerProfiles.find((provider) => provider.userId === state.session.userId)
    : null;

  if (actualRole === "GUEST") {
    return <Navigate to="/error/401" state={{ from: location.pathname }} replace />;
  }

  if (!roles.includes(actualRole)) {
    return <Navigate to="/error/403" state={{ from: location.pathname, requiredRoles: roles }} replace />;
  }

  if (actualRole === "PROVIDER" && currentProvider?.blocked) {
    return <Navigate to="/error/403" state={{ from: location.pathname, requiredRoles: roles }} replace />;
  }

  return <>{children}</>;
}
