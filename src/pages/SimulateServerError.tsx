import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runMockService, type MockServiceMode } from "@/lib/mockService";

const VALID_MODES: MockServiceMode[] = ["ok", "failed", "throw"];

const SimulateServerError = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = params.get("mode") ?? "throw";
  const mode = (VALID_MODES.includes(modeParam as MockServiceMode) ? modeParam : "throw") as MockServiceMode;

  useEffect(() => {
    let cancelled = false;

    const simulate = async () => {
      try {
        const result = await runMockService(mode);
        if (cancelled) return;

        if (result.status === "failed") {
          navigate("/error/500", {
            replace: true,
            state: { source: "/simulate/500", details: result.message },
          });
          return;
        }
      } catch (error) {
        if (cancelled) return;
        navigate("/error/500", {
          replace: true,
          state: {
            source: "/simulate/500",
            details: error instanceof Error ? error.message : "Unknown service error",
          },
        });
      }
    };

    void simulate();
    return () => {
      cancelled = true;
    };
  }, [mode, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h1 className="mt-4 text-xl font-semibold">Running mock service simulation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mode: <span className="font-medium text-foreground">{mode}</span>
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/simulate/500?mode=failed">
          <Button variant="outline" className="rounded-xl">
            Simulate failed status
          </Button>
        </Link>
        <Link to="/simulate/500?mode=throw">
          <Button variant="outline" className="rounded-xl">
            Simulate exception
          </Button>
        </Link>
        <Link to="/">
          <Button className="rounded-xl bg-primary text-primary-foreground">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default SimulateServerError;
