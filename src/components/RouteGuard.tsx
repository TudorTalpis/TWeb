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

  if (state.session.role === "GUEST") {
    return <Navigate to="/error/401" state={{ from: location.pathname }} replace />;
  }

  if (!roles.includes(state.session.role)) {
    return <Navigate to="/error/403" state={{ from: location.pathname, requiredRoles: roles }} replace />;
  }

  return <>{children}</>;
}
