import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import type { Role } from "@/types";

interface RouteGuardProps {
  roles: Role[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({ roles, children, redirectTo = "/auth/login" }: RouteGuardProps) {
  const { state } = useAppStore();
  if (!roles.includes(state.session.role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
