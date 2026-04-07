import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { useAppStore } from "@/store/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Phone, Star, Image as ImageIcon, ExternalLink } from "lucide-react";
import { generateId } from "@/lib/storage";
import { getCategoryNames } from "@/lib/categories";

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const app = state.applications.find((a) => a.id === applicationId);
  const categoryNames = app ? getCategoryNames(state.categories, app.categoryIds) : [];

  // Find the provider profile created from this application (for approved applications)
  const linkedProvider = app?.status === "APPROVED"
    ? state.providerProfiles.find(
        (p) => p.userId === app.userId && p.slug === app.slug
      )
    : null;

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
    // Build the new provider profile
    const newProviderProfile = {
      id: generateId(),
      userId: app.userId,
      name: app.name,
      slug: app.slug,
      description: app.description,
      categoryIds: app.categoryIds,
      pendingCategoryNames: [],
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
    };

    // Update application status
    const updatedApplications = state.applications.map((a) =>
      a.id === app.id ? { ...a, status: "APPROVED" as const, rejectReason: undefined } : a
    );

    // Update user role
    const updatedUsers = state.users.map((u) =>
      u.id === app.userId ? { ...u, role: "PROVIDER" as const } : u
    );

    // Also update the session if this user is currently logged in
    const updatedSession =
      state.session.userId === app.userId
        ? { userId: app.userId, role: "PROVIDER" as const }
        : state.session;

    // Apply all changes atomically to avoid stale state issues
    dispatch({
      type: "SET_STATE",
      payload: {
        ...state,
        session: updatedSession,
        applications: updatedApplications,
        providerProfiles: [...state.providerProfiles, newProviderProfile],
        users: updatedUsers,
      },
    });

    // Notify the applicant
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
        linkTo: "/dashboard",
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
      <div className="animate-fade-in mx-auto max-w-5xl space-y-6">
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
                <Star className="h-4 w-4" /> {categoryNames.join(", ") || "Unknown category"}
              </span>
            </div>
          </div>
        </div>

        {/* Approved - View Provider */}
        {app.status === "APPROVED" && linkedProvider && (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-6 shadow-card">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-success flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Provider Active
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This application has been approved. You can view and manage the provider's page below.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to={`/admin/providers/${linkedProvider.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs border-success/30 text-success hover:bg-success/5 hover:text-success hover:border-success/50">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Manage Provider
                  </Button>
                </Link>
                <Link to={`/providers/${app.slug}`}>
                  <Button size="sm" className="gap-1.5 rounded-full text-xs bg-success text-success-foreground hover:bg-success/90">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Public Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

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
            {app.status === "APPROVED"
              ? "These are the provider's current gallery photos."
              : "This is the provider mockup preview shown before approval."}
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
