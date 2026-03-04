import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { useAppStore } from "@/store/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Phone, Star, Image as ImageIcon } from "lucide-react";
import { generateId } from "@/lib/storage";

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const app = state.applications.find((a) => a.id === applicationId);
  const category = app ? state.categories.find((c) => c.id === app.categoryId) : null;

  if (!app) {
    return (
      <AdminPanelLayout>
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Application not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/applications")}>
            Back to Applications
          </Button>
        </div>
      </AdminPanelLayout>
    );
  }

  const handleApprove = () => {
    dispatch({ type: "UPDATE_APPLICATION", payload: { id: app.id, status: "APPROVED" } });
    const user = state.users.find((u) => u.id === app.userId);
    if (user) {
      dispatch({
        type: "ADD_PROVIDER_PROFILE",
        payload: {
          id: generateId(),
          userId: user.id,
          name: app.name,
          slug: app.slug,
          description: app.description,
          categoryId: app.categoryId,
          avatar: app.avatar || "",
          coverPhoto: "",
          galleryPhotos: app.galleryPhotos || [],
          phone: app.phone,
          location: app.location,
          defaultServiceBufferMinutes: 0,
          autoConfirm: false,
          rating: 5.0,
          reviewCount: 0,
          featured: false,
          sponsored: false,
          blocked: false,
        },
      });
      const updatedUsers = state.users.map((u) => (u.id === user.id ? { ...u, role: "PROVIDER" as const } : u));
      dispatch({ type: "SET_STATE", payload: { ...state, users: updatedUsers } });
    }
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: generateId(),
        userId: app.userId,
        type: "application_approved",
        title: "Application Approved!",
        message: `Your provider application "${app.name}" has been approved.`,
        read: false,
        createdAt: new Date().toISOString(),
        linkTo: "/provider/dashboard",
      },
    });
    navigate("/admin/applications");
  };

  const handleReject = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;

    dispatch({ type: "UPDATE_APPLICATION", payload: { id: app.id, status: "REJECTED", rejectReason: trimmedReason } });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: generateId(),
        userId: app.userId,
        type: "application_rejected",
        title: "Application Rejected",
        message: `Your provider application "${app.name}" was rejected. Reason: ${trimmedReason}`,
        read: false,
        createdAt: new Date().toISOString(),
        linkTo: "/become-provider",
      },
    });
    navigate("/admin/applications");
  };

  return (
    <AdminPanelLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/admin/applications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>

        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          <div className="h-40 bg-secondary" />
          <div className="-mt-10 px-6 pb-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-muted">
              {app.avatar ? (
                <img src={app.avatar} alt={app.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">{app.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{app.name}</h1>
              <Badge variant={app.status === "PENDING" ? "outline" : app.status === "APPROVED" ? "default" : "destructive"}>
                {app.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{app.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {app.location || "No location"}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {app.phone || "No phone"}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4" /> {category?.name ?? "Unknown category"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gallery Preview</h2>
          {app.galleryPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gallery photos uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {app.galleryPhotos.map((photo, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl border">
                  <img src={photo} alt={`${app.name} gallery ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            This is the provider mockup preview shown before approval.
          </div>
        </div>

        {app.status === "PENDING" && (
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Decision</h2>
            {!showReject ? (
              <div className="mt-4 flex gap-3">
                <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={handleApprove}>
                  Accept
                </Button>
                <Button variant="destructive" onClick={() => setShowReject(true)}>
                  Reject
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">Rejection reason (required, visible to applicant):</p>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this request is rejected..."
                  className="min-h-[120px]"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowReject(false); setReason(""); }}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>
                    Confirm Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default ApplicationDetail;
