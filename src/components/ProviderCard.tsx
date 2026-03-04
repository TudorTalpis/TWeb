import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProviderProfile } from "@/types";
import { useAppStore } from "@/store/AppContext";

export function ProviderCard({ provider }: { provider: ProviderProfile }) {
  const { state } = useAppStore();
  const category = state.categories.find((c) => c.id === provider.categoryId);
  const initials = provider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const linkTo = provider.slug ? `/${provider.slug}` : `/providers/${provider.id}`;

  return (
      <Link
          to={linkTo}
          className="group block rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden card-hover relative"
      >
        <div className="relative h-32 overflow-hidden">
          {provider.coverPhoto || (provider.galleryPhotos && provider.galleryPhotos.length > 0) ? (
              <img
                  src={provider.coverPhoto || provider.galleryPhotos[0]}
                  alt={provider.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : (
              <div className="relative h-full w-full bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display select-none text-3xl font-bold text-muted-foreground/30">{initials}</span>
                </div>
              </div>
          )}

          <div className="absolute inset-0 bg-black/10" />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex gap-1">
            {provider.sponsored && (
                <Badge className="border-0 bg-accent text-accent-foreground text-[9px] px-2 py-0 h-4.5 rounded-full font-semibold">Sponsored</Badge>
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
