import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, DollarSign, ArrowLeft, Phone, Briefcase, AlertCircle, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/AppContext";

const ProviderPage = () => {
  const { providerSlug } = useParams();
  const { state, hasRole } = useAppStore();

  // Find provider by slug first, then by ID for backward compatibility
  const provider = state.providerProfiles.find((p) => p.slug === providerSlug)
    || state.providerProfiles.find((p) => p.id === providerSlug);

  const category = provider ? state.categories.find((c) => c.id === provider.categoryId) : null;
  const services = provider ? state.services.filter((s) => s.providerId === provider.id) : [];
  const reviews = provider ? state.reviews.filter((r) => r.providerId === provider.id) : [];
  const [activeTab, setActiveTab] = useState<"services" | "gallery" | "about">("services");

  if (!provider) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Provider not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block text-sm">Go home</Link>
      </div>
    );
  }

  const initials = provider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in">
      {/* Hero header with cover photo */}
      <div className="relative">
        {provider.coverPhoto ? (
          <div className="h-56 sm:h-72 overflow-hidden">
            <img src={provider.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ) : (
          <div className="h-56 sm:h-72 gradient-hero" />
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-6xl px-4 pb-6">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-background overflow-hidden bg-card shadow-elevated">
                {provider.avatar ? (
                  <img src={provider.avatar} alt={provider.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground/40">{initials}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{provider.name}</h1>
                  {provider.sponsored && <Badge className="gradient-accent text-accent-foreground border-0 rounded-full px-2.5">Sponsored</Badge>}
                  {provider.featured && <Badge className="bg-white/15 text-white border-0 rounded-full px-2.5">Featured</Badge>}
                </div>
                <p className="mt-2 text-white/75 text-sm leading-relaxed max-w-xl">{provider.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-white/70 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-white">{provider.rating}</span>
                    <span>({provider.reviewCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {provider.location}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {provider.phone}</span>
                  {category && <Badge className="bg-white/15 text-white border-0 rounded-full px-2.5 text-xs">{category.name}</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-1 border-b -mt-px">
          <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")} icon={<Briefcase className="h-4 w-4" />} label={`Services (${services.length})`} />
          {(provider.galleryPhotos?.length ?? 0) > 0 && (
            <TabButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<Image className="h-4 w-4" />} label={`Gallery (${provider.galleryPhotos.length})`} />
          )}
          <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Star className="h-4 w-4" />} label={`About${reviews.length > 0 ? ` (${reviews.length})` : ""}`} />
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === "services" && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{svc.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{svc.description}</p>
                  <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground"><DollarSign className="h-3 w-3" />{svc.price}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{svc.duration} min</span>
                  </div>
                </div>
                {(hasRole(["USER", "PROVIDER"]) || state.session.role === "GUEST") && (
                  <Link to={`/book/${provider.id}/${svc.id}`} className="ml-4">
                    <Button size="sm" className="rounded-full gradient-primary text-primary-foreground h-8 px-4 text-xs font-medium">Book Now</Button>
                  </Link>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-center text-muted-foreground py-12 col-span-full text-sm">No services listed yet.</p>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(provider.galleryPhotos || []).map((url, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border shadow-card">
                <img src={url} alt={`${provider.name} gallery ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl space-y-8">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold mb-3">About {provider.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{provider.description}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{provider.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{provider.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{category?.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Services</span>
                  <span className="font-medium">{services.length}</span>
                </div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Reviews & Ratings</h3>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold text-lg">{(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border bg-card/50 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{review.userName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-1">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No reviews yet. Book and share your experience!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      {icon} {label}
    </button>
  );
}

export default ProviderPage;
