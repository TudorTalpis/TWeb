import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/useI18n";
import { ProviderCard } from "@/components/ProviderCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { getCategoryName, normalizeCategory } from "@/lib/categories";

type SortOption = "relevance" | "name" | "price_low" | "price_high" | "reviews" | "newest";

const Categories = () => {
  const { state } = useAppStore();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const selectedCat = params.get("cat");
  const searchQuery = params.get("q") || "";
  const [categoryQuery, setCategoryQuery] = useState("");

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

  const setSelectedCategoryIds = (ids: string[]) => {
    const newParams = new URLSearchParams(params);
    if (ids.length > 0) {
      newParams.set("cat", ids.join(","));
    } else {
      newParams.delete("cat");
    }
    setParams(newParams, { replace: true });
  };

  const selectedCategoryIds = useMemo(() => (selectedCat ?? "").split(",").filter(Boolean), [selectedCat]);
  const selectedCategorySet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds]);
  const selectedCategoryNames = useMemo(
    () => selectedCategoryIds.map((id) => getCategoryName(state.categories, id)),
    [selectedCategoryIds, state.categories],
  );
  const providerIdsWithServices = useMemo(
    () => new Set(state.services.map((service) => service.providerId)),
    [state.services],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    state.categories.forEach((category) => counts.set(category.id, 0));
    state.providerProfiles.forEach((provider) => {
      if (provider.blocked || !providerIdsWithServices.has(provider.id)) return;
      provider.categoryIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    });
    return counts;
  }, [state.categories, state.providerProfiles, providerIdsWithServices]);
  const sortedCategories = useMemo(
    () =>
      [...state.categories].sort((a, b) => {
        const diff = (categoryCounts.get(b.id) ?? 0) - (categoryCounts.get(a.id) ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      }),
    [state.categories, categoryCounts],
  );
  const topCategories = useMemo(() => sortedCategories.slice(0, 5), [sortedCategories]);
  const visibleCategories = useMemo(() => {
    const normalized = normalizeCategory(categoryQuery);
    if (!normalized) return topCategories;
    return sortedCategories.filter((category) => normalizeCategory(category.name).includes(normalized));
  }, [categoryQuery, sortedCategories, topCategories]);

  // Filter providers
  let providers = state.providerProfiles.filter((p) => {
    if (p.blocked || !providerIdsWithServices.has(p.id)) return false;
    if (selectedCategoryIds.length === 0) return true;
    return p.categoryIds.some((id) => selectedCategoryIds.includes(id));
  });

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

  const activeCategoryLabel = selectedCategoryNames.length > 0 ? selectedCategoryNames.join(", ") : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-8">{t("providers.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Categories list sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border bg-card p-5 shadow-card sticky top-20">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t("providers.categories")}
            </h2>
            <Input
              value={categoryQuery}
              onChange={(event) => setCategoryQuery(event.target.value)}
              placeholder="Search categories"
              className="h-9 text-sm"
            />
            <div className="mt-4 divide-y divide-border">
              {visibleCategories.map((category) => {
                const count = categoryCounts.get(category.id) ?? 0;
                const isSelected = selectedCategorySet.has(category.id);
                return (
                  <label
                    key={category.id}
                    className="flex items-center justify-between gap-3 py-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          if (isSelected) {
                            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id));
                          } else {
                            setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                          }
                        }}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </label>
                );
              })}
              {visibleCategories.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">No categories found.</p>
              )}
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

          {activeCategoryLabel ? (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                {providers.length} {t("providers.title").toLowerCase()} {t("providers.inCategory")}{" "}
                {activeCategoryLabel}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
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
