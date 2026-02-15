import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, Plus, Star, Ban, Award, Megaphone, Edit2, X } from "lucide-react";
import { generateId } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import type { Service } from "@/types";

const AdminProviderDetail = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();

  const provider = state.providerProfiles.find((p) => p.id === providerId);
  const providerServices = state.services.filter((s) => s.providerId === providerId);
  const providerBookings = state.bookings.filter((b) => b.providerId === providerId);
  const providerReviews = state.reviews.filter((r) => r.providerId === providerId);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: provider?.name ?? "",
    description: provider?.description ?? "",
    phone: provider?.phone ?? "",
    location: provider?.location ?? "",
    categoryId: provider?.categoryId ?? "",
  });

  // Service editing
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [addingService, setAddingService] = useState(false);

  if (!provider) {
    return (
      <AdminPanelLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Provider not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/providers")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Providers
          </Button>
        </div>
      </AdminPanelLayout>
    );
  }

  const category = state.categories.find((c) => c.id === provider.categoryId);

  const saveProfile = () => {
    dispatch({
      type: "UPDATE_PROVIDER_PROFILE",
      payload: { id: provider.id, ...profileForm },
    });
    setEditingProfile(false);
    toast({ title: "Profile updated" });
  };

  const startEditService = (svc: Service) => {
    setEditingServiceId(svc.id);
    setServiceForm({ ...svc });
    setAddingService(false);
  };

  const startAddService = () => {
    setAddingService(true);
    setEditingServiceId(null);
    setServiceForm({
      title: "",
      description: "",
      price: 0,
      duration: 60,
      categoryId: provider.categoryId,
      providerId: provider.id,
    });
  };

  const saveService = () => {
    if (addingService) {
      dispatch({
        type: "ADD_SERVICE",
        payload: {
          id: generateId(),
          providerId: provider.id,
          title: serviceForm.title || "Untitled",
          description: serviceForm.description || "",
          price: serviceForm.price || 0,
          duration: serviceForm.duration || 60,
          categoryId: serviceForm.categoryId || provider.categoryId,
        },
      });
      toast({ title: "Service added" });
    } else if (editingServiceId) {
      dispatch({
        type: "UPDATE_SERVICE",
        payload: { id: editingServiceId, ...serviceForm },
      });
      toast({ title: "Service updated" });
    }
    setEditingServiceId(null);
    setAddingService(false);
  };

  const deleteService = (id: string) => {
    dispatch({ type: "DELETE_SERVICE", payload: id });
    toast({ title: "Service deleted" });
  };

  const revenue = providerBookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => {
      const svc = state.services.find((s) => s.id === b.serviceId);
      return sum + (svc?.price ?? 0);
    }, 0);

  return (
    <AdminPanelLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/providers")} className="gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All Providers
        </Button>

        {/* Provider header */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              {editingProfile ? (
                <div className="space-y-3 max-w-lg">
                  <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Name" />
                  <Textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} placeholder="Description" rows={3} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Phone" />
                    <Input value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="Location" />
                  </div>
                  <Select value={profileForm.categoryId} onValueChange={(v) => setProfileForm({ ...profileForm, categoryId: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {state.categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfile} className="gap-1"><Save className="h-3.5 w-3.5" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-xl font-bold">{provider.name}</h2>
                    {provider.featured && <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">Featured</Badge>}
                    {provider.sponsored && <Badge className="gradient-accent text-accent-foreground border-0 text-[10px]">Sponsored</Badge>}
                    {provider.blocked && <Badge variant="destructive" className="text-[10px]">Blocked</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {category && <span>{category.name}</span>}
                    <span>{provider.location}</span>
                    <span>{provider.phone}</span>
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {provider.rating} ({provider.reviewCount})</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-1">
              {!editingProfile && (
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="gap-1 text-xs">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_FEATURED", payload: provider.id })} className={`h-8 w-8 p-0 ${provider.featured ? "text-primary" : "text-muted-foreground"}`}>
                <Award className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_SPONSORED", payload: provider.id })} className={`h-8 w-8 p-0 ${provider.sponsored ? "text-accent" : "text-muted-foreground"}`}>
                <Megaphone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_BLOCKED", payload: provider.id })} className={`h-8 w-8 p-0 ${provider.blocked ? "text-destructive" : "text-muted-foreground"}`}>
                <Ban className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t">
            {[
              { label: "Services", value: providerServices.length },
              { label: "Bookings", value: providerBookings.length },
              { label: "Reviews", value: providerReviews.length },
              { label: "Revenue", value: `$${revenue}` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Services ({providerServices.length})</h3>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={startAddService}>
              <Plus className="h-3.5 w-3.5" /> Add Service
            </Button>
          </div>

          {addingService && (
            <ServiceForm form={serviceForm} setForm={setServiceForm} onSave={saveService} onCancel={() => setAddingService(false)} />
          )}

          <div className="space-y-2">
            {providerServices.map((svc) =>
              editingServiceId === svc.id ? (
                <ServiceForm key={svc.id} form={serviceForm} setForm={setServiceForm} onSave={saveService} onCancel={() => setEditingServiceId(null)} />
              ) : (
                <div key={svc.id} className="flex items-center justify-between rounded-xl border bg-secondary/30 p-4">
                  <div>
                    <p className="text-sm font-medium">{svc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">${svc.price} · {svc.duration}min</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEditService(svc)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteService(svc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            )}
            {providerServices.length === 0 && !addingService && (
              <p className="text-center text-muted-foreground text-sm py-6">No services.</p>
            )}
          </div>
        </div>

        {/* Bookings */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-sm mb-4">Bookings ({providerBookings.length})</h3>
          {providerBookings.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No bookings.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Service</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {providerBookings.map((b) => {
                    const svc = state.services.find((s) => s.id === b.serviceId);
                    return (
                      <tr key={b.id} className="text-xs">
                        <td className="py-2.5">{b.userName}</td>
                        <td className="py-2.5">{svc?.title ?? "—"}</td>
                        <td className="py-2.5">{b.date}</td>
                        <td className="py-2.5">{b.startTime}–{b.endTime}</td>
                        <td className="py-2.5">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            b.status === "COMPLETED" ? "bg-success/15 text-success" :
                            b.status === "CONFIRMED" ? "bg-primary/15 text-primary" :
                            "bg-destructive/15 text-destructive"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-sm mb-4">Reviews ({providerReviews.length})</h3>
          {providerReviews.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {providerReviews.map((r) => (
                <div key={r.id} className="rounded-xl border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.userName}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPanelLayout>
  );
};

function ServiceForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: Partial<Service>;
  setForm: (f: Partial<Service>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border bg-secondary/30 p-4 mb-3 space-y-3">
      <Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service title" />
      <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: +e.target.value })} placeholder="Price ($)" />
        <Input type="number" value={form.duration ?? 60} onChange={(e) => setForm({ ...form, duration: +e.target.value })} placeholder="Duration (min)" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="gap-1"><Save className="h-3.5 w-3.5" /> Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
      </div>
    </div>
  );
}

export default AdminProviderDetail;
