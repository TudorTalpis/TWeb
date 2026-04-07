import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Mail, Phone, User, Shield } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const PANEL_CLASS = "rounded-2xl border border-border/60 bg-card p-6 shadow-card";

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  PROVIDER: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  USER: "bg-green-500/15 text-green-500 border-green-500/30",
  GUEST: "bg-gray-500/15 text-gray-500 border-gray-500/30",
};

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();

  const user = state.users.find((u) => u.id === userId);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "USER",
  });

  if (!user) {
    return (
      <AdminPanelLayout>
        <div className="space-y-4">
          <Link to="/admin/users">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div className={PANEL_CLASS}>
            <p className="text-center text-sm text-muted-foreground">User not found.</p>
          </div>
        </div>
      </AdminPanelLayout>
    );
  }

  const providerProfile = state.providerProfiles.find((p) => p.userId === user.id);
  const userBookings = state.bookings.filter((b) => b.userId === user.id);
  const providerBookings = providerProfile ? state.bookings.filter((b) => b.providerId === providerProfile.id) : [];

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert("All fields are required!");
      return;
    }

    dispatch({
      type: "UPDATE_USER",
      payload: {
        id: user.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role as Role,
      },
    });

    navigate("/admin/users");
  };

  return (
    <AdminPanelLayout>
      <div className="animate-fade-in space-y-6">
        <Link to="/admin/users">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
        </Link>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Edit User</h2>
          <p className="text-sm text-muted-foreground">Modify user details and role</p>
        </section>

        {/* User Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={cn(PANEL_CLASS, "p-4")}>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="mt-1 text-sm font-mono text-foreground/70">{user.id}</p>
          </div>
          <div className={cn(PANEL_CLASS, "p-4")}>
            <p className="text-xs text-muted-foreground">Bookings Made</p>
            <p className="mt-1 text-2xl font-bold">{userBookings.length}</p>
          </div>
          {providerProfile && (
            <div className={cn(PANEL_CLASS, "p-4")}>
              <p className="text-xs text-muted-foreground">Bookings Received</p>
              <p className="mt-1 text-2xl font-bold">{providerBookings.length}</p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <section className={PANEL_CLASS}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            User Information
          </h3>
          <div className="space-y-4">
            {/* Preview */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  {formData.name[0] || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold">{formData.name || "User Name"}</h5>
                    <Badge className={cn("text-[10px] capitalize", ROLE_COLORS[formData.role as Role])}>
                      {formData.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.email || "email@example.com"}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label htmlFor="user-name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" /> Name *
              </label>
              <Input
                id="user-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="user-email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" /> Email *
              </label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="user-phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4" /> Phone *
              </label>
              <Input
                id="user-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+40 123 456 789"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="user-role" className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" /> Role *
              </label>
              <select
                id="user-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="USER">User</option>
                <option value="PROVIDER">Provider</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Changing roles may affect user permissions and access.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="gap-2 rounded-xl">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              <Button onClick={() => navigate("/admin/users")} variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        </section>

        {/* Provider Profile Link */}
        {providerProfile && (
          <section className={PANEL_CLASS}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Provider Profile
            </h3>
            <p className="text-sm text-muted-foreground mb-3">This user has an associated provider profile.</p>
            <Link to={`/admin/providers/${providerProfile.id}`}>
              <Button variant="outline" className="rounded-xl">
                View Provider Profile
              </Button>
            </Link>
          </section>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default AdminUserDetail;
