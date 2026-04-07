import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";

const PANEL_CLASS = "rounded-3xl border border-border/60 bg-card p-5 shadow-card";

type Business = {
  id: string;
  name: string;
  owner: string;
  submittedAt?: string;
  status: "pending" | "approved" | "restricted" | "rejected";
  rating?: number;
  reports?: number;
};

type OwnerRequest = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  requestedAt: string;
};

const PENDING: Business[] = [
  { id: "b1", name: "Sunrise Spa", owner: "Aisha Khan", submittedAt: "2024-11-10", status: "pending" },
  { id: "b2", name: "Harbor Hotel", owner: "Daniel Park", submittedAt: "2024-11-12", status: "pending" },
  { id: "b3", name: "Bamboo Bistro", owner: "Marta Rossi", submittedAt: "2024-11-15", status: "pending" },
];

const ACTIVE: Business[] = [
  { id: "a1", name: "Lotus Massage", owner: "Renee Young", status: "approved", rating: 4.7, reports: 0 },
  { id: "a2", name: "Seaside Restaurant", owner: "Carlos M.", status: "restricted", rating: 4.1, reports: 3 },
  { id: "a3", name: "Glow Beauty", owner: "Priya Singh", status: "approved", rating: 4.9, reports: 1 },
];

const REQUESTS: OwnerRequest[] = [
  {
    id: "r1",
    name: "Liam Turner",
    email: "liam@example.com",
    businessName: "Turner Therapy",
    requestedAt: "2024-11-09",
  },
  { id: "r2", name: "Sofia Li", email: "sofia@example.com", businessName: "Li Wellness", requestedAt: "2024-11-14" },
];

function StatusBadge({ status }: { status: Business["status"] }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
    case "approved":
      return <Badge className="bg-success/10 text-success">Approved</Badge>;
    case "restricted":
      return <Badge className="bg-accent/10 text-accent">Restricted</Badge>;
    case "rejected":
      return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function Admin(): JSX.Element {
  return (
    <AdminPanelLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage businesses, review submissions, and handle owner requests.
          </p>
        </section>

        <section className={PANEL_CLASS}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Pending Business Requests</h3>
              <p className="text-xs text-muted-foreground">Review and take action on newly submitted businesses.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Business</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {PENDING.map((b) => (
                  <tr key={b.id} className="text-muted-foreground">
                    <td className="py-3">
                      <div className="flex items-center gap-3 text-foreground">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                            alt={`${b.name} image`}
                          />
                          <AvatarFallback>{b.name.split(" ")[0][0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{b.name}</div>
                      </div>
                    </td>
                    <td className="py-3">{b.owner}</td>
                    <td className="py-3">{b.submittedAt}</td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" className="h-7 px-3 text-[10px]">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px]">
                          Reject
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px]">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px]">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={PANEL_CLASS}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Active Businesses</h3>
              <p className="text-xs text-muted-foreground">Overview of approved businesses and reports.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Business</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Reports</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {ACTIVE.map((b) => (
                  <tr key={b.id} className="text-muted-foreground">
                    <td className="py-3 text-foreground font-medium">{b.name}</td>
                    <td className="py-3">{b.owner}</td>
                    <td className="py-3">{b.rating?.toFixed(1)}</td>
                    <td className="py-3">{b.reports ?? 0}</td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === "restricted" ? (
                          <Button variant="secondary" size="sm" className="h-7 px-3 text-[10px]">
                            Remove Restriction
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px]">
                            Restrict
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px]">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px]">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={PANEL_CLASS}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Owner Verification Requests</h3>
              <p className="text-xs text-muted-foreground">
                Approve or reject requests to become verified business owners.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REQUESTS.map((r) => (
              <Card key={r.id} className="rounded-2xl border border-border/60 bg-background/40 shadow-card">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                          alt={`${r.name} avatar`}
                        />
                        <AvatarFallback>{r.name.split(" ")[0][0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.requestedAt}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Requested business: <span className="font-medium text-foreground">{r.businessName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="h-7 px-3 text-[10px]">
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px]">
                      Reject
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-3 text-[10px]">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AdminPanelLayout>
  );
}
