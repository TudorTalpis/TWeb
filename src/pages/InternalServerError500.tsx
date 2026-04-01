import { Link, useLocation } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationState {
  source?: string;
  details?: string;
}

const InternalServerError500 = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <ServerCrash className="h-7 w-7" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-destructive">HTTP 500</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Internal Server Error</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The application received a failed response from a mocked service.
      </p>
      {(state?.source || state?.details) && (
        <div className="mt-4 rounded-xl border bg-card/60 px-4 py-3 text-left text-xs text-muted-foreground">
          {state?.source && <p>Source: {state.source}</p>}
          {state?.details && <p>Details: {state.details}</p>}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/simulate/500?mode=throw">
          <Button className="rounded-xl bg-primary text-primary-foreground">Retry Simulation</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="rounded-xl">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default InternalServerError500;

