import { Link, useLocation } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

interface LocationState {
  from?: string;
  requiredRoles?: Role[];
}

const Forbidden403 = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const rolesLabel = state?.requiredRoles?.join(", ");

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <ShieldX className="h-7 w-7" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-destructive">HTTP 403</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Forbidden</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        You are authenticated, but your role does not allow access to this area.
      </p>
      {(state?.from || rolesLabel) && (
        <div className="mt-4 rounded-xl border bg-card/60 px-4 py-3 text-left text-xs text-muted-foreground">
          {state?.from && <p>Requested path: {state.from}</p>}
          {rolesLabel && <p>Required role(s): {rolesLabel}</p>}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button className="rounded-xl bg-primary text-primary-foreground">Go to Dashboard</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="rounded-xl">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Forbidden403;

