import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationState {
  from?: string;
}

const Unauthorized401 = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Lock className="h-7 w-7" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-warning">HTTP 401</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Unauthorized</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        You need to sign in to continue.
        {state?.from ? ` Requested path: ${state.from}` : ""}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/auth/login">
          <Button className="rounded-xl bg-primary text-primary-foreground">Go to Login</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="rounded-xl">
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized401;
