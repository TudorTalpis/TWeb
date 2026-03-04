import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Ban, Award, Megaphone, Eye } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PANEL_CLASS = "rounded-3xl border border-border/60 bg-card p-5 shadow-card";

const AdminProviders = () => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const providers = state.providerProfiles;
  const activeProviders = providers.filter((provider) => !provider.blocked).length;
  const blockedProviders = providers.filter((provider) => provider.blocked).length;

  return (
    <AdminPanelLayout>
      <div className="space-y-6">
        <section className={cn(PANEL_CLASS, "p-6")}>
          <h2 className="font-display text-2xl font-bold">Providers</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage featured placement, sponsored visibility, and account access.</p>
        </section>

        <section className={PANEL_CLASS}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {providers.length} Provider{providers.length !== 1 ? "s" : ""}
            </h3>
            <div className="flex items-center gap-2 text-[11px]">
              <Badge variant="outline" className="rounded-full border-success/30 bg-success/10 text-success">{activeProviders} active</Badge>
              <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 text-destructive">{blockedProviders} blocked</Badge>
            </div>
          </div>

          {providers.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No providers yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => {
                const category = state.categories.find((item) => item.id === provider.categoryId);
                return (
                  <div
                    key={provider.id}
                    className={cn(
                      "rounded-2xl border border-border/60 bg-background/40 p-5 transition-all duration-200 hover:shadow-elevated",
                      provider.blocked && "opacity-60",
                    )}
                  >
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold">{provider.name}</h4>
                          {provider.featured && (
                            <Badge variant="outline" className="rounded-full border-primary/40 px-2 text-[10px] text-primary">Featured</Badge>
                          )}
                          {provider.sponsored && (
                            <Badge className="rounded-full border-0 bg-accent/15 px-2 text-[10px] text-accent">Sponsored</Badge>
                          )}
                          {provider.blocked && (
                            <Badge className="rounded-full border-0 bg-destructive/15 px-2 text-[10px] text-destructive">Blocked</Badge>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {category && <span>{category.name}</span>}
                          <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {provider.rating}</span>
                          <span>{provider.location}</span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/providers/${provider.id}`)} className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Manage Provider</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dispatch({ type: "TOGGLE_FEATURED", payload: provider.id })}
                              className={cn(
                                "h-8 w-8 rounded-lg p-0",
                                provider.featured ? "bg-primary/10 text-primary" : "text-muted-foreground",
                              )}
                            >
                              <Award className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Toggle Featured</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dispatch({ type: "TOGGLE_SPONSORED", payload: provider.id })}
                              className={cn(
                                "h-8 w-8 rounded-lg p-0",
                                provider.sponsored ? "bg-accent/10 text-accent" : "text-muted-foreground",
                              )}
                            >
                              <Megaphone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Toggle Sponsored</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dispatch({ type: "TOGGLE_BLOCKED", payload: provider.id })}
                              className={cn(
                                "h-8 w-8 rounded-lg p-0",
                                provider.blocked ? "bg-destructive/10 text-destructive" : "text-muted-foreground",
                              )}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Toggle Block</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminProviders;
