import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/AppContext";
import { Check, Camera, ImagePlus, X, Link as LinkIcon, MapPin, Phone } from "lucide-react";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";

const ProviderProfilePage = () => {
  const {state, currentProvider, dispatch } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: currentProvider?.name || "",
    slug: currentProvider?.slug || "",
    description: currentProvider?.description || "",
    phone: currentProvider?.phone || "",
    location: currentProvider?.location || "",
    avatar: currentProvider?.avatar || "",
    coverPhoto: currentProvider?.coverPhoto || "",
    galleryPhotos: currentProvider?.galleryPhotos || [] as string[],
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  if (!currentProvider) return <p className="p-8 text-center text-muted-foreground">No provider profile found.</p>;

  const slugTaken = form.slug.trim().length > 0 &&
    form.slug.trim().toLowerCase() !== currentProvider.slug.toLowerCase() &&
    state.providerProfiles.some((p) => p.slug.toLowerCase() === form.slug.trim().toLowerCase());

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && form.galleryPhotos.length < 6) {
      setForm({ ...form, galleryPhotos: [...form.galleryPhotos, newPhotoUrl.trim()] });
      setNewPhotoUrl("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setForm({ ...form, galleryPhotos: form.galleryPhotos.filter((_, i) => i !== index) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugTaken) return;
    dispatch({ type: "UPDATE_PROVIDER_PROFILE", payload: { id: currentProvider.id, ...form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = currentProvider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <ProviderPanelLayout>
      <div className="max-w-2xl space-y-6">
        {/* Cover Photo Preview */}
        <div className="relative rounded-2xl overflow-hidden border h-40 bg-gradient-to-br from-primary/10 to-accent/10">
          {form.coverPhoto ? (
            <img src={form.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
              <Camera className="h-10 w-10" />
            </div>
          )}
          {/* Avatar overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="h-20 w-20 rounded-2xl border-4 border-background overflow-hidden bg-card shadow-elevated flex items-center justify-center">
              {form.avatar ? (
                <img src={form.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground/40">{initials}</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Details</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Business Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" /> Custom URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">mysite.com/</span>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                    className="rounded-xl" maxLength={50}
                  />
                </div>
                {slugTaken && <p className="text-xs text-destructive mt-1">This slug is already taken.</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Profile Photo URL</label>
                  <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="rounded-xl" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cover Photo URL</label>
                  <Input value={form.coverPhoto} onChange={(e) => setForm({ ...form, coverPhoto: e.target.value })} className="rounded-xl" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Gallery ({form.galleryPhotos.length}/6)</label>
                <div className="grid grid-cols-3 gap-2">
                  {form.galleryPhotos.map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border group">
                      <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.galleryPhotos.length < 6 && (
                  <div className="mt-2 flex gap-2">
                    <Input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} className="rounded-xl" placeholder="Paste image URL..." />
                    <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1 shrink-0" onClick={handleAddPhoto} disabled={!newPhotoUrl.trim()}>
                      <ImagePlus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="rounded-xl gradient-primary text-primary-foreground gap-2 h-11 w-full" disabled={slugTaken}>
              {saved && <Check className="h-4 w-4" />} {saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </ProviderPanelLayout>
  );
};

export default ProviderProfilePage;
