import { Link } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";

const AdminApplications = () => {
  const { state } = useAppStore();
  const pending = state.applications.filter((a) => a.status === "PENDING");
  const resolved = state.applications.filter((a) => a.status !== "PENDING");

  const getCategory = (id: string) => state.categories.find((c) => c.id === id)?.name || id;

  return (
    <AdminPanelLayout>
      <div className="max-w-2xl space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pending ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-muted-foreground text-sm">No pending applications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((app) => (
                <div key={app.id} className="rounded-2xl border bg-card p-5 shadow-card">
                  <h3 className="font-semibold text-sm">{app.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{app.description}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {getCategory(app.categoryId)} · {app.location} · {app.phone}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/admin/applications/${app.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 rounded-full h-8 px-4 text-xs">
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
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Resolved</h2>
            <div className="space-y-2">
              {resolved.map((app) => (
                <div key={app.id} className="rounded-xl border bg-card px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{app.name}</span>
                    <Badge variant={app.status === "APPROVED" ? "default" : "destructive"} className="text-[10px] rounded-full">
                      {app.status}
                    </Badge>
                  </div>
                  {app.status === "REJECTED" && app.rejectReason && (
                    <p className="mt-2 text-xs text-destructive">Reason: {app.rejectReason}</p>
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
