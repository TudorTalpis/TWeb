import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { generateId } from "@/lib/storage";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";

const AdminApplications = () => {
  const { state, dispatch } = useAppStore();
  const pending = state.applications.filter((a) => a.status === "PENDING");
  const resolved = state.applications.filter((a) => a.status !== "PENDING");

  const handleApprove = (app: typeof state.applications[0]) => {
    dispatch({ type: "UPDATE_APPLICATION", payload: { id: app.id, status: "APPROVED" } });
    const user = state.users.find((u) => u.id === app.userId);
    if (user) {
      dispatch({ type: "ADD_PROVIDER_PROFILE", payload: {
        id: generateId(), userId: user.id, name: app.name, slug: app.slug,
        description: app.description,
        categoryId: app.categoryId, avatar: app.avatar || "", coverPhoto: "",
        galleryPhotos: app.galleryPhotos || [],
        phone: app.phone, location: app.location,
        rating: 5.0, reviewCount: 0, featured: false, sponsored: false, blocked: false,
      }});
      const updatedUsers = state.users.map((u) => u.id === user.id ? { ...u, role: "PROVIDER" as const } : u);
      dispatch({ type: "SET_STATE", payload: { ...state, users: updatedUsers, applications: state.applications.map((a2) => a2.id === app.id ? { ...a2, status: "APPROVED" as const } : a2) } });
    }
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { id: generateId(), userId: app.userId, type: "application_approved", title: "Application Approved!", message: `Your provider application "${app.name}" has been approved.`, read: false, createdAt: new Date().toISOString() },
    });
  };

  const handleReject = (app: typeof state.applications[0]) => {
    dispatch({ type: "UPDATE_APPLICATION", payload: { id: app.id, status: "REJECTED" } });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { id: generateId(), userId: app.userId, type: "application_rejected", title: "Application Rejected", message: `Your provider application "${app.name}" was not approved at this time.`, read: false, createdAt: new Date().toISOString() },
    });
  };

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
                    <Button size="sm" className="gap-1 rounded-full h-8 px-4 text-xs bg-success text-success-foreground hover:bg-success/90" onClick={() => handleApprove(app)}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 rounded-full h-8 px-4 text-xs" onClick={() => handleReject(app)}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
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
                <div key={app.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 opacity-60">
                  <span className="text-sm font-medium">{app.name}</span>
                  <Badge variant={app.status === "APPROVED" ? "default" : "destructive"} className="text-[10px] rounded-full">
                    {app.status}
                  </Badge>
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
