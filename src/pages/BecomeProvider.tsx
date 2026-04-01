import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/AppContext";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { createCategoryFromName, findCategoryByName } from "@/lib/categories";
import { generateId } from "@/lib/storage";
import { Check, X, Link as LinkIcon, Upload } from "lucide-react";

const BecomeProvider = () => {
  const { state, dispatch, currentUser } = useAppStore();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const latestApplication = currentUser
    ? state.applications
        .filter((a) => a.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : undefined;
  const blockingApplication =
    latestApplication && latestApplication.status !== "REJECTED" ? latestApplication : undefined;
  const latestRejectedApplication =
    latestApplication && latestApplication.status === "REJECTED" ? latestApplication : undefined;

  // Check slug uniqueness
  const slugTaken = slug.trim().length > 0 && state.providerProfiles.some(
      (p) => p.slug.toLowerCase() === slug.trim().toLowerCase()
  );

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && galleryPhotos.length < 6) {
      setGalleryPhotos([...galleryPhotos, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setGalleryPhotos(galleryPhotos.filter((_, i) => i !== index));
  };

  const handleCreateCategory = (name: string) => {
    const existing = findCategoryByName(state.categories, name);
    if (existing) return existing.id;
    const created = createCategoryFromName(name, state.categories);
    dispatch({ type: "ADD_CATEGORY", payload: created });
    return created.id;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name || !description || categoryIds.length === 0 || !slug.trim() || slugTaken || !avatar.trim() || galleryPhotos.length === 0) return;
    dispatch({
      type: "ADD_APPLICATION",
      payload: {
        id: generateId(), userId: currentUser.id, name, slug: slug.trim(),
        description, categoryIds, phone, location,
        avatar: avatar.trim(), galleryPhotos,
        status: "PENDING", createdAt: new Date().toISOString(),
      },
    });
    state.users.filter((u) => u.role === "ADMIN").forEach((admin) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(), userId: admin.id, type: "application_submitted",
          title: "New Provider Application",
          message: `${currentUser.name} applied to become a provider: ${name}`,
          read: false, createdAt: new Date().toISOString(),
          linkTo: "/admin/applications",
        },
      });
    });
    setSubmitted(true);
  };

  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: "/become-provider" }} replace />;
  }

  if (blockingApplication) {
    return (
        <div className="container mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">Application {blockingApplication.status === "PENDING" ? "Submitted" : blockingApplication.status.toLowerCase()}</h1>
          <p className="text-muted-foreground text-sm">Your application for "{blockingApplication.name}" is currently <strong>{blockingApplication.status}</strong>.</p>
        </div>
    );
  }

  if (submitted) {
    return (
        <div className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground text-sm">An admin will review your application shortly.</p>
        </div>
    );
  }

  const isValid = name && description && categoryIds.length > 0 && slug.trim() && !slugTaken && avatar.trim() && galleryPhotos.length > 0;

  return (
      <div className="container mx-auto max-w-2xl px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Become a Provider</h1>
        <p className="text-sm text-muted-foreground mb-8">Fill out your profile information and add photos to get started.</p>
        {latestRejectedApplication?.rejectReason && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">Last rejection reason</p>
            <p className="mt-1 text-sm text-destructive/90">{latestRejectedApplication.rejectReason}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h2>
            <div>
              <label className="text-sm font-medium">Business Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="mt-1 rounded-xl" placeholder="e.g. Alina's Nail Studio" />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" /> Custom URL Slug *
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">mysite.com/</span>
                <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    required maxLength={50} className="rounded-xl"
                    placeholder="AlinaNails"
                />
              </div>
              {slugTaken && <p className="text-xs text-destructive mt-1">This slug is already taken.</p>}
              {slug && !slugTaken && <p className="text-xs text-success mt-1">✓ Available</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={500} className="mt-1 rounded-xl min-h-[100px]" placeholder="Tell clients about your services..." />
            </div>
            <div>
              <CategoryMultiSelect
                label="Categories *"
                placeholder="Select or create categories"
                options={state.categories}
                value={categoryIds}
                onChange={setCategoryIds}
                onCreate={handleCreateCategory}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Type to search, press Enter to create a new category, or select multiple.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className="mt-1 rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} className="mt-1 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Photos *</h2>

            <div>
              <label className="text-sm font-medium">Profile Photo *</label>
              <div className="mt-2 flex items-center gap-4">
                {avatar ? (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border group">
                      <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" />
                      <button
                          type="button"
                          onClick={() => setAvatar("")}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                ) : (
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/50 mt-1">Upload</span>
                      <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setAvatar(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }}
                      />
                    </label>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Gallery Photos * (at least 1, up to 6)</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {galleryPhotos.map((url, i) => (
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
                {galleryPhotos.length < 6 && (
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/50 mt-1">Add Photo</span>
                      <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.slice(0, 6 - galleryPhotos.length).forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = (ev) =>
                                  setGalleryPhotos((prev) => prev.length < 6 ? [...prev, ev.target?.result as string] : prev);
                              reader.readAsDataURL(file);
                            });
                            e.target.value = "";
                          }}
                      />
                    </label>
                )}
              </div>
            </div>

          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl h-11" disabled={!isValid}>
            Submit Application
          </Button>
        </form>
      </div>
  );
};

export default BecomeProvider;

