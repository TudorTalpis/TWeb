import { Link } from "react-router-dom";
import { ArrowRight, Search as SearchIcon, TrendingUp, Shield, Clock, Zap, Star } from "lucide-react";
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
        <section className="relative overflow-hidden px-4 py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/60" />
          <div className="absolute inset-0 bg-radial-glow opacity-80" />
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-4xl text-center">

            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl leading-[1.1]">
              {t("home.hero.title1")}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow">
              {t("home.hero.title2")}
            </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/categories">
                <Button size="lg" className="gap-2 rounded-xl gradient-primary text-white h-12 px-8 text-sm font-semibold btn-glow shadow-glow transition-all hover:scale-105">
                  <SearchIcon className="h-4 w-4" /> {t("home.browseServices")}
                </Button>
              </Link>
              {!hasRole(["PROVIDER", "ADMIN"]) && (
                  <Link to="/become-provider">
                    <Button size="lg" variant="outline" className="gap-2 rounded-xl h-12 px-8 text-sm border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all">
                      {t("home.becomeProvider")} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
              )}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: Shield, label: t("home.verified"), color: "text-primary" },
                { icon: Clock, label: t("home.instant"), color: "text-accent" },
                { icon: TrendingUp, label: t("home.topRated"), color: "text-warning" },
              ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-muted-foreground">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="relative z-10 border-y border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <div className="grid grid-cols-3 divide-x divide-border/50 text-center">
              {[
                { value: `${activeProviders.length}+`, label: t("home.stats.providers") },
                { value: `${state.categories.length}`, label: t("home.stats.categories") },
                { value: "4.9★", label: t("home.stats.rating") },
              ].map((stat) => (
                  <div key={stat.label} className="px-4 py-1">
                    <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsored */}
        {sponsored.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
              <SectionHeader title={t("home.sponsored")} badge={t("home.stats.badge.promoted")} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sponsored.map((p) => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
              <SectionHeader title={t("home.featured")} badge={t("home.stats.badge.featured")} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </section>
        )}

        {/* Categories */}
        <section className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <SectionHeader title={t("home.categories")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {state.categories.map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        </section>

        {/* All Providers */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title={t("home.allProviders")} className="mb-0" />
            <Link to="/categories" className="flex items-center gap-1.5 text-sm text-primary font-medium link-underline hover:text-primary/80 transition-colors">
              {t("home.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProviders.map((p) => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>

        {/* CTA Banner */}
        {!hasRole(["PROVIDER", "ADMIN"]) && (
            <section className="mx-auto max-w-6xl px-4 pb-16">
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-8 sm:p-12 text-center shadow-elevated">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <Star className="h-8 w-8 text-primary mx-auto mb-4 relative" />
                <h2 className="relative font-display text-2xl font-bold sm:text-3xl mb-3">{t("home.cta.title")}</h2>
                <p className="relative text-muted-foreground text-sm mb-6 max-w-md mx-auto">{t("home.cta.desc")}</p>
                <Link to="/become-provider">
                  <Button className="rounded-xl gradient-primary text-white px-8 h-11 font-semibold btn-glow shadow-glow">
                    {t("home.becomeProvider")} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </section>
        )}
      </div>
  );
};

function SectionHeader({ title, className = "", badge }: { title: string; className?: string; badge?: string }) {
  return (
      <div className={`flex items-center gap-3 mb-6 ${className}`}>
        <h2 className="font-display text-xl font-bold sm:text-2xl text-foreground">{title}</h2>
        {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{badge}</span>
        )}
      </div>
  );
}

export default Index;
