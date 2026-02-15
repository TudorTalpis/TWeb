import { Link } from "react-router-dom";
import { ArrowRight, Search as SearchIcon, TrendingUp, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { ProviderCard } from "@/components/ProviderCard";
import { CategoryCard } from "@/components/CategoryCard";

const Index = () => {
  const { state, hasRole } = useAppStore();
  const { t } = useI18n();
  const activeProviders = state.providerProfiles.filter((p) => !p.blocked);
  const sponsored = activeProviders.filter((p) => p.sponsored);
  const featured = activeProviders.filter((p) => p.featured);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="gradient-hero px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl leading-tight">
            {t("home.hero.title1")}<br className="hidden sm:block" /> {t("home.hero.title2")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/75 sm:text-lg">
            {t("home.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/categories">
              <Button size="lg" variant="secondary" className="gap-2 rounded-full shadow-elevated h-11 px-6 text-sm font-medium">
                <SearchIcon className="h-4 w-4" /> {t("home.browseServices")}
              </Button>
            </Link>
            {!hasRole(["PROVIDER", "ADMIN"]) && (
              <Link to="/become-provider">
                <Button size="lg" variant="ghost" className="text-primary-foreground/90 hover:bg-primary-foreground/10 gap-2 rounded-full h-11 px-6 text-sm">
                  {t("home.becomeProvider")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Shield, label: t("home.verified") },
              { icon: Clock, label: t("home.instant") },
              { icon: TrendingUp, label: t("home.topRated") },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-primary-foreground/60">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored */}
      {sponsored.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <SectionHeader title={t("home.sponsored")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsored.map((p) => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <SectionHeader title={t("home.featured")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <SectionHeader title={t("home.categories")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {state.categories.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </section>

      {/* All Providers */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title={t("home.allProviders")} className="mb-0" />
          <Link to="/categories" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
            {t("home.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeProviders.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      </section>
    </div>
  );
};

function SectionHeader({ title, className = "" }: { title: string; className?: string }) {
  return (
    <h2 className={`mb-5 font-display text-xl font-bold sm:text-2xl ${className}`}>{title}</h2>
  );
}

export default Index;
