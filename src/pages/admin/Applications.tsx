import { Link } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { cn } from "@/lib/utils";
import { getCategoryNames } from "@/lib/categories";

const PANEL_CLASS = "rounded-3xl border border-border/60 bg-card p-5 shadow-card";

const AdminApplications = () => {
  const { state } = useAppStore();
  const pending = state.applications.filter((application) => application.status === "PENDING");
  const resolved = state.applications.filter((application) => application.status !== "PENDING");

  const getCategories = (ids: string[]) => getCategoryNames(state.categories, ids).join(", ") || "Unknown category";

  return (
    <AdminPanelLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Applications</h2>
          <p className="text-sm text-muted-foreground">Review pending requests and track resolved provider applications.</p>
        </section>

        <section className={PANEL_CLASS}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending ({pending.length})</h3>
            <Badge variant="outline" className="rounded-full border-warning/40 bg-warning/10 text-[10px] text-warning">
              Needs review
            </Badge>
          </div>

          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No pending applications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((application) => (
                <div key={application.id} className="rounded-2xl border border-border/60 bg-background/40 p-5">
                  <h4 className="text-sm font-semibold">{application.name}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{application.description}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {getCategories(application.categoryIds)} - {application.location} - {application.phone}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/admin/applications/${application.id}`}>
                      <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full px-4 text-xs">
                        <Info className="h-3 w-3" /> Info
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {resolved.length > 0 && (
          <section className={PANEL_CLASS}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resolved ({resolved.length})</h3>
            <div className="space-y-2">
              {resolved.map((application) => (
                <div key={application.id} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{application.name}</span>
                    <Badge
                      className={cn(
                        "rounded-full px-2 text-[10px]",
                        application.status === "APPROVED"
                          ? "border-0 bg-success/15 text-success"
                          : "border-0 bg-destructive/15 text-destructive",
                      )}
                    >
                      {application.status}
                    </Badge>
                  </div>
                  {application.status === "REJECTED" && application.rejectReason && (
                    <p className="mt-2 text-xs text-destructive">Reason: {application.rejectReason}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default AdminApplications;
