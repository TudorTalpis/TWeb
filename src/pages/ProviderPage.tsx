import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Star, MapPin, Clock, DollarSign, ArrowLeft, Phone, Briefcase, AlertCircle, Image, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryNames } from "@/lib/categories";
import { getEffectiveServiceBufferMinutes } from "@/lib/services";
import { useAppStore } from "@/store/AppContext";
import NotFound from "@/pages/NotFound";

const ProviderPage = () => {
  const { providerSlug } = useParams();
  const { state, hasRole } = useAppStore();

  const provider = state.providerProfiles.find((p) => p.slug === providerSlug)
      || state.providerProfiles.find((p) => p.id === providerSlug);

  const categoryNames = provider ? getCategoryNames(state.categories, provider.categoryIds) : [];
  const services = provider ? state.services.filter((s) => s.providerId === provider.id) : [];
  const reviews = provider ? state.reviews.filter((r) => r.providerId === provider.id) : [];
  const [activeTab, setActiveTab] = useState<"services" | "gallery" | "about">("services");

  if (!provider) return <NotFound />;
  if (provider.blocked) {
    return <Navigate to="/error/403" state={{ from: `/providers/${providerSlug}` }} replace />;
  }

  const initials = provider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
      <div className="animate-fade-in">
        {/* Hero header */}
        <div className="relative">
          {provider.coverPhoto ? (
              <div className="h-60 sm:h-80 overflow-hidden">
                <img src={provider.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/20" />
              </div>
          ) : (
              <div className="h-60 sm:h-80 bg-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />
              </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-6xl px-4 pb-6">
              <Link to="/" className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/80 px-3 py-1.5 text-xs text-foreground shadow-card backdrop-blur-sm transition-colors hover:bg-card">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Avatar */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-border/60 overflow-hidden bg-card shadow-elevated">
                  {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.name} className="h-full w-full object-cover" />
                  ) : (
                      <span className="font-display text-2xl font-bold text-muted-foreground/40">{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{provider.name}</h1>
                    {provider.sponsored && <Badge className="bg-accent text-accent-foreground border-0 rounded-full px-2.5 text-xs">Sponsored</Badge>}
                    {provider.featured && <Badge className="bg-primary/10 text-primary border border-primary/30 rounded-full px-2.5 text-xs">Featured</Badge>}
                  </div>
                  <div className="mt-3 max-w-3xl rounded-2xl border border-border/30 bg-card/82 p-3 shadow-card backdrop-blur-sm sm:p-4">
                    <p className="text-sm leading-relaxed text-foreground/95">{provider.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground">{provider.rating}</span>
                        <span>({provider.reviewCount} reviews)</span>
                      </span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {provider.location}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-primary" /> {provider.phone}</span>
                      {categoryNames.map((name) => (
                        <Badge key={name} className="rounded-full border-border/50 bg-secondary text-muted-foreground px-2.5 text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-16 z-10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex gap-1" role="tablist" aria-label="Provider sections">
              <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")} icon={<Briefcase className="h-4 w-4" />} label={`Services (${services.length})`} />
              {(provider.galleryPhotos?.length ?? 0) > 0 && (
                  <TabButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<Image className="h-4 w-4" />} label={`Gallery (${provider.galleryPhotos.length})`} />
              )}
              <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Star className="h-4 w-4" />} label={`About${reviews.length > 0 ? ` (${reviews.length})` : ""}`} />
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          {activeTab === "services" && (
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {services.map((svc) => {
                  const effectiveBuffer = getEffectiveServiceBufferMinutes(svc, provider);
                  return (
                    <div key={svc.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-card card-hover group">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">{svc.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{svc.description}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign className="h-3 w-3 text-primary" />{svc.price}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {svc.duration} min
                            {effectiveBuffer > 0
                              ? ` + ${effectiveBuffer} min buffer`
                              : ""}
                          </span>
                        </div>
                      </div>
                      {(hasRole(["USER", "PROVIDER"]) || state.session.role === "GUEST") && (
                          <Link to={`/book/${provider.id}/${svc.id}`} className="ml-4">
                            <Button size="sm" className="rounded-xl bg-primary text-white h-9 px-4 text-xs font-semibold">
                              <Zap className="h-3 w-3 mr-1" />Book
                            </Button>
                          </Link>
                      )}
                    </div>
                  );
                })}
                {services.length === 0 && (
                    <p className="text-center text-muted-foreground py-12 col-span-full text-sm">No services listed yet.</p>
                )}
              </div>
          )}

          {activeTab === "gallery" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(provider.galleryPhotos || []).map((url, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 shadow-card">
                      <img src={url} alt={`${provider.name} gallery ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                ))}
              </div>
          )}

          {activeTab === "about" && (
              <div className="max-w-4xl space-y-6">
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
                  <h3 className="font-display font-semibold mb-3">About {provider.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{provider.description}</p>
                  <div className="mt-5 space-y-0 divide-y divide-border/50 text-sm">
                    {[
                      { label: "Location", value: provider.location },
                      { label: "Phone", value: provider.phone },
                      { label: "Categories", value: categoryNames.join(", ") || "Uncategorized" },
                      { label: "Services", value: services.length },
                    ].map((row) => (
                        <div key={row.label} className="flex justify-between py-2.5">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-foreground">{row.value}</span>
                        </div>
                    ))}
                  </div>
                </div>

                {reviews.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-semibold">Reviews & Ratings</h3>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-bold text-lg text-foreground">{(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {reviews.map((review) => (
                            <div key={review.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                              <div className="flex items-start justify-between mb-2.5">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-border/50 bg-secondary/20 p-8 text-center">
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
          role="tab"
          aria-selected={active}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
          }`}
      >
        {icon} {label}
      </button>
  );
}

export default ProviderPage;


