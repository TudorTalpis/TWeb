import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CONTAINER = "mx-auto w-full max-w-6xl px-4";

const values = [
  { title: "Trust", description: "Verified providers and transparent ratings.", icon: ShieldCheck },
  { title: "Quality", description: "High standards for listings and service details.", icon: CheckCircle2 },
  { title: "Discovery", description: "Clear search, filters, and category browsing.", icon: Compass },
  { title: "Community", description: "Helping clients and providers build long-term trust.", icon: Users },
];

const steps = [
  "Browse providers and categories",
  "Compare services and reviews",
  "Book confidently with clear status updates",
];

const team = [
  { name: "Aisha Khan", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" },
  { name: "Daniel Park", role: "Head of Engineering", image: "https://images.unsplash.com/photo-1545996124-1b5d6b0d9fbd?q=80&w=800&auto=format&fit=crop" },
  { name: "Marta Rossi", role: "Community Manager", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop" },
];

const About = () => {
  return (
    <div className="animate-fade-in">
      <section className="border-b border-border/50 py-14 sm:py-20">
        <div className={`${CONTAINER} grid items-center gap-8 lg:grid-cols-2`}>
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> About ServeHub
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              A marketplace where clients and providers connect with confidence
            </h1>
            <p className="mt-4 max-w-prose text-sm text-muted-foreground sm:text-base">
              ServeHub helps people discover trusted local providers, compare services, and book with clear expectations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/categories">
                <Button className="h-10 rounded-xl px-5">
                  Explore Providers <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/become-provider">
                <Button variant="outline" className="h-10 rounded-xl px-5">Become a Provider</Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1400&auto=format&fit=crop"
              alt="Marketplace experience"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className={`${CONTAINER} grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {values.map((value) => (
            <Card key={value.title} className="rounded-2xl border-border/60 bg-card">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/70 text-primary">
                  <value.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/50 bg-secondary/20 py-14 sm:py-16">
        <div className={`${CONTAINER} grid gap-6 md:grid-cols-2`}>
          <Card className="rounded-2xl border-border/60 bg-card">
            <CardHeader>
              <CardTitle>Mission</CardTitle>
              <CardDescription>Make service discovery transparent, fast, and reliable.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We focus on clear profiles, real reviews, and straightforward booking flows that reduce friction for both clients and providers.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/60 bg-card">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>From discovery to booking in three simple steps.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className={CONTAINER}>
          <h2 className="font-display text-2xl font-bold">Team</h2>
          <p className="mt-2 text-sm text-muted-foreground">The people building a better service marketplace experience.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <Card key={member.name} className="rounded-2xl border-border/60 bg-card">
                <CardContent className="flex items-center gap-3 p-5">
                  <Avatar>
                    <AvatarImage src={member.image} alt={member.name} loading="lazy" />
                    <AvatarFallback>{member.name.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;