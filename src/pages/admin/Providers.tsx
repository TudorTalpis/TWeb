import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Ban, Award, Megaphone, Eye } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminProviders = () => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const providers = state.providerProfiles;

  return (
    <AdminPanelLayout>
      <div className="max-w-3xl">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {providers.length} Provider{providers.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-2">
          {providers.map((p) => {
            const category = state.categories.find((c) => c.id === p.categoryId);
            return (
              <div key={p.id} className={`rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated ${p.blocked ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      {p.featured && <Badge variant="outline" className="border-primary/40 text-primary text-[10px] rounded-full px-2">Featured</Badge>}
                      {p.sponsored && <Badge className="gradient-accent text-accent-foreground border-0 text-[10px] rounded-full px-2">Sponsored</Badge>}
                      {p.blocked && <Badge variant="destructive" className="text-[10px] rounded-full px-2">Blocked</Badge>}
                    </div>
                    <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-3">
                      {category && <span>{category.name}</span>}
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {p.rating}</span>
                      <span>{p.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/providers/${p.id}`)} className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Manage Provider</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_FEATURED", payload: p.id })} className={`h-8 w-8 p-0 rounded-lg ${p.featured ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                          <Award className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle Featured</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_SPONSORED", payload: p.id })} className={`h-8 w-8 p-0 rounded-lg ${p.sponsored ? "text-accent bg-accent/10" : "text-muted-foreground"}`}>
                          <Megaphone className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle Sponsored</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_BLOCKED", payload: p.id })} className={`h-8 w-8 p-0 rounded-lg ${p.blocked ? "text-destructive bg-destructive/10" : "text-muted-foreground"}`}>
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
          {providers.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-center text-muted-foreground text-sm">No providers yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminProviders;
