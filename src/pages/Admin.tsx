import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CONTAINER = "max-w-6xl mx-auto px-6";

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
  { id: "a1", name: "Lotus Massage", owner: "Renée Young", status: "approved", rating: 4.7, reports: 0 },
  { id: "a2", name: "Seaside Restaurant", owner: "Carlos M.", status: "restricted", rating: 4.1, reports: 3 },
  { id: "a3", name: "Glow Beauty", owner: "Priya Singh", status: "approved", rating: 4.9, reports: 1 },
];

const REQUESTS: OwnerRequest[] = [
  { id: "r1", name: "Liam Turner", email: "liam@example.com", businessName: "Turner Therapy", requestedAt: "2024-11-09" },
  { id: "r2", name: "Sofia Li", email: "sofia@example.com", businessName: "Li Wellness", requestedAt: "2024-11-14" },
];

function StatusBadge({ status }: { status: Business["status"] }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-slate-700">Pending</Badge>;
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>;
    case "restricted":
      return <Badge className="bg-yellow-100 text-yellow-800">Restricted</Badge>;
    case "rejected":
      return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function Admin(): JSX.Element {
  return (
    <main className="bg-white text-slate-900">
      <header className={`${CONTAINER} py-10`}>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage businesses, review submissions and handle owner requests.</p>
        </div>
      </header>

      <section className="border-t">
        <div className={`${CONTAINER} py-10`}> 
          <article aria-labelledby="pending-heading">
            <div className="flex items-center justify-between">
              <h2 id="pending-heading" className="text-xl font-semibold">Pending Business Requests</h2>
              <p className="text-sm text-slate-500">Review and take action on newly submitted businesses.</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] divide-y table-auto">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Business</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Owner</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Submitted</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PENDING.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop`} alt={`${b.name} image`} />
                            <AvatarFallback>{b.name.split(" ")[0][0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900">{b.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{b.owner}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{b.submittedAt}</td>
                      <td className="px-4 py-4"> <StatusBadge status={b.status} /> </td>
                      <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                        <Button size="sm" className="px-3">Approve</Button>
                        <Button variant="destructive" size="sm" className="px-3">Reject</Button>
                        <Button variant="outline" size="sm" className="px-3">Edit</Button>
                        <Button variant="destructive" size="sm" className="px-3">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className={`${CONTAINER} py-10`}> 
          <article aria-labelledby="active-heading">
            <div className="flex items-center justify-between">
              <h2 id="active-heading" className="text-xl font-semibold">Active Businesses</h2>
              <p className="text-sm text-slate-500">Overview of approved businesses and reports.</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] divide-y table-auto">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Business</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Owner</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Rating</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Reports</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ACTIVE.map((b) => (
                    <tr key={b.id} className="hover:bg-white">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{b.name}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{b.owner}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{b.rating?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{b.reports ?? 0}</td>
                      <td className="px-4 py-4"> <StatusBadge status={b.status} /> </td>
                      <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                        {b.status === "restricted" ? (
                          <Button variant="secondary" size="sm" className="px-3">Remove Restriction</Button>
                        ) : (
                          <Button variant="destructive" size="sm" className="px-3">Restrict</Button>
                        )}
                        <Button variant="outline" size="sm" className="px-3">Edit</Button>
                        <Button variant="destructive" size="sm" className="px-3">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} py-10`}> 
          <article aria-labelledby="owners-heading">
            <div className="flex items-center justify-between">
              <h2 id="owners-heading" className="text-xl font-semibold">Owner Verification Requests</h2>
              <p className="text-sm text-slate-500">Approve or reject requests to become verified business owners.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REQUESTS.map((r) => (
                <Card key={r.id} className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop`} alt={`${r.name} avatar`} />
                          <AvatarFallback>{r.name.split(" ")[0][0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{r.name}</div>
                          <div className="text-xs text-slate-500">{r.email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">{r.requestedAt}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 text-sm text-slate-700">Requested business: <span className="font-medium">{r.businessName}</span></div>
                    <div className="flex gap-2">
                      <Button size="sm">Approve</Button>
                      <Button variant="destructive" size="sm">Reject</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
