import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { ProviderCard } from "@/components/ProviderCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type SortOption = "relevance" | "name" | "price_low" | "price_high" | "reviews" | "newest";

const Categories = () => {
  const { state } = useAppStore();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCat = params.get("cat");
  const searchQuery = params.get("q") || "";

  const setSearchQuery = (q: string) => {
    const newParams = new URLSearchParams(params);
    if (q) {
      newParams.set("q", q);
    } else {
      newParams.delete("q");
    }
    setParams(newParams, { replace: true });
  };
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const handleCategoryChange = (catId: string) => {
    if (selectedCat === catId) {
      navigate("/categories");
    } else {
      navigate(`/categories?cat=${catId}`);
    }
  };

  // Filter providers
  let providers = state.providerProfiles.filter(
    (p) => !p.blocked && (!selectedCat || p.categoryId === selectedCat)
  );

  // Search by name
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    providers = providers.filter((p) => p.name.toLowerCase().includes(q));
  }

  // Sort
  const getMinPrice = (providerId: string) => {
    const services = state.services.filter((s) => s.providerId === providerId);
    return services.length > 0 ? Math.min(...services.map((s) => s.price)) : Infinity;
  };

  providers = [...providers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price_low":
        return getMinPrice(a.id) - getMinPrice(b.id);
      case "price_high":
        return getMinPrice(b.id) - getMinPrice(a.id);
      case "reviews":
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
    }
  });

  const activeCat = state.categories.find((c) => c.id === selectedCat);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-8">{t("providers.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Categories list sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border bg-card p-5 shadow-card sticky top-20">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("providers.categories")}</h2>
            <div className="divide-y divide-border">
              {state.categories.map((c) => {
                const count = state.providerProfiles.filter(
                  (p) => !p.blocked && p.categoryId === c.id
                ).length;
                const isSelected = selectedCat === c.id;
                return (
                  <label
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleCategoryChange(c.id)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Providers grid */}
        <div className="lg:col-span-4">
          {/* Filter / Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("providers.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t("providers.relevance")}</SelectItem>
                <SelectItem value="name">{t("providers.nameAZ")}</SelectItem>
                <SelectItem value="price_low">{t("providers.priceLow")}</SelectItem>
                <SelectItem value="price_high">{t("providers.priceHigh")}</SelectItem>
                <SelectItem value="reviews">{t("providers.bestReviewed")}</SelectItem>
                <SelectItem value="newest">{t("providers.newest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeCat ? (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                {providers.length} {t("providers.title").toLowerCase()} {t("providers.inCategory")} {activeCat.name}
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
              </div>
              {providers.length === 0 && (
                <p className="text-muted-foreground py-12 text-center text-sm">{t("providers.noProviders")}</p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                {providers.length} {t("providers.title").toLowerCase()}
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
              </div>
              {providers.length === 0 && (
                <p className="text-muted-foreground py-12 text-center text-sm">{t("providers.noProviders")}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
