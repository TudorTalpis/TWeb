import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProviderProfile } from "@/types";
import { useAppStore } from "@/store/AppContext";

// Soft gradient backgrounds for provider fallback
const gradients = [
  "from-primary/20 via-primary/10 to-secondary",
  "from-accent/20 via-accent/10 to-secondary",
  "from-warning/20 via-warning/10 to-secondary",
  "from-primary/15 via-secondary to-accent/15",
  "from-success/20 via-success/10 to-secondary",
  "from-destructive/10 via-secondary to-primary/10",
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
      className="group block rounded-xl border bg-card shadow-card overflow-hidden transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5"
    >
      {/* Image / gradient area */}
      <div className="relative h-28 overflow-hidden">
        {provider.coverPhoto || (provider.galleryPhotos && provider.galleryPhotos.length > 0) ? (
          <img
            src={provider.coverPhoto || provider.galleryPhotos[0]}
            alt={provider.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary/20 select-none">{initials}</span>
            </div>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex gap-1">
          {provider.sponsored && (
            <Badge className="gradient-accent text-accent-foreground border-0 text-[9px] px-1.5 py-0 h-4 rounded-full shadow-sm">Sponsored</Badge>
          )}
          {provider.featured && (
            <Badge className="bg-card/90 backdrop-blur-sm text-primary border-0 text-[9px] px-1.5 py-0 h-4 rounded-full shadow-sm">Featured</Badge>
          )}
        </div>

        {/* Rating top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-card/90 backdrop-blur-sm px-2 py-0.5 shadow-sm">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="text-[11px] font-bold text-foreground">{provider.rating}</span>
          <span className="text-[9px] text-muted-foreground">({provider.reviewCount})</span>
        </div>

        {/* Small avatar bottom-left */}
        {provider.avatar && (
          <div className="absolute -bottom-3 left-3">
            <div className="h-8 w-8 rounded-lg border-2 border-background overflow-hidden bg-card shadow-sm">
              <img src={provider.avatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>

      {/* Info below */}
      <div className="p-3 pt-4">
        <h3 className="font-semibold text-xs text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
          {provider.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" /> {provider.location}
        </p>
        {category && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{category.name}</p>
        )}
      </div>
    </Link>
  );
}
