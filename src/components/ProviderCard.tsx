import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProviderProfile } from "@/types";
import { useAppStore } from "@/store/AppContext";

const gradients = [
  "from-primary/30 via-primary/15 to-card",
  "from-accent/30 via-accent/15 to-card",
  "from-warning/30 via-warning/15 to-card",
  "from-primary/20 via-card to-accent/20",
  "from-success/25 via-success/10 to-card",
  "from-destructive/20 via-card to-primary/20",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export function ProviderCard({ provider }: { provider: ProviderProfile }) {
  const { state } = useAppStore();
  const category = state.categories.find((c) => c.id === provider.categoryId);
  const initials = provider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const gradient = getGradient(provider.id);
  const linkTo = provider.slug ? `/${provider.slug}` : `/providers/${provider.id}`;

  return (
      <Link
          to={linkTo}
          className="group block rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden card-hover relative"
      >
        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px hsl(249 89% 68% / 0.2)" }} />

        {/* Image / gradient area */}
        <div className="relative h-32 overflow-hidden">
          {provider.coverPhoto || (provider.galleryPhotos && provider.galleryPhotos.length > 0) ? (
              <img
                  src={provider.coverPhoto || provider.galleryPhotos[0]}
                  alt={provider.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : (
              <div className={`h-full w-full bg-gradient-to-br ${gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground/10 select-none font-display">{initials}</span>
                </div>
              </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex gap-1">
            {provider.sponsored && (
                <Badge className="gradient-accent text-accent-foreground border-0 text-[9px] px-2 py-0 h-4.5 rounded-full shadow-glow-accent font-semibold">Sponsored</Badge>
            )}
            {provider.featured && (
                <Badge className="bg-card/80 backdrop-blur-sm text-primary border border-primary/30 text-[9px] px-2 py-0 h-4.5 rounded-full font-semibold">Featured</Badge>
            )}
          </div>

          {/* Rating top-right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-sm px-2 py-0.5 border border-border/40">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="text-[11px] font-bold text-foreground">{provider.rating}</span>
            <span className="text-[9px] text-muted-foreground">({provider.reviewCount})</span>
          </div>

          {/* Small avatar bottom-left */}
          {provider.avatar && (
              <div className="absolute -bottom-3 left-3">
                <div className="h-8 w-8 rounded-xl border-2 border-card overflow-hidden bg-card shadow-card">
                  <img src={provider.avatar} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
          )}
        </div>

        {/* Info below */}
        <div className="p-3 pt-4">
          <h3 className="font-display font-semibold text-xs text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {provider.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 flex-shrink-0" /> {provider.location}
          </p>
          {category && (
              <p className="mt-0.5 text-[11px] text-primary/70">{category.name}</p>
          )}
        </div>
      </Link>
  );
}
