import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CONTAINER = "max-w-6xl mx-auto px-6";

function Hero() {
  return (
    <header className={`${CONTAINER} py-16` }>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
            Discover trusted local businesses, book with confidence
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-prose">
            We connect people with vetted hotels, salons, studios and service providers — bringing
            transparent reviews, verified listings and seamless discovery under one roof.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="shadow-sm" aria-label="Explore businesses">
              Explore Businesses
            </Button>
            <Button variant="outline" size="lg" aria-label="Partner with us">
              Partner With Us
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-gradient-to-tr from-slate-50 to-white">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1400&auto=format&fit=crop"
              alt="Local businesses on a map and customers browsing listings"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Story() {
  const milestones = [
    { year: "2019", text: "Founded to help local businesses get discovered." },
    { year: "2021", text: "Reached 10k+ verified listings across categories." },
    { year: "2023", text: "Launched partner tools to drive bookings and reviews." },
  ];

  return (
    <section aria-labelledby="our-story" className={`${CONTAINER} py-16`}>
      <div className="max-w-3xl">
        <h2 id="our-story" className="text-2xl font-bold text-slate-900">
          Our story
        </h2>
        <p className="mt-4 text-slate-600">
          We started as a simple idea: make it easier for local businesses to be found by
          customers who care about quality and trust. Today we power thousands of meaningful
          connections every month.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {milestones.map((m) => (
          <article key={m.year} className="rounded-2xl border p-6 bg-white shadow-sm">
            <header className="flex items-baseline gap-3">
              <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                {m.year}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{m.text.split('.')[0]}</h3>
            </header>
            <p className="mt-3 text-slate-600 text-sm">{m.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MissionVision() {
  return (
    <section aria-labelledby="mission-vision" className="bg-slate-50">
      <div className={`${CONTAINER} py-16`}>
        <h2 id="mission-vision" className="text-2xl font-bold text-slate-900">
          Mission &amp; Vision
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                Make local discovery effortless, transparent and reliable for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We prioritize trust and clarity — verifying listings, surfacing real feedback and
                helping users make confident decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
              <CardDescription>
                A world where local businesses thrive through fair visibility and great
                experiences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We envision a vibrant local economy where discovery tools empower small business
                owners and delight customers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Values() {
  const items = [
    {
      title: "Trust & Transparency",
      desc: "Verified listings, clear reviews and open policies.",
      icon: (
        <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 1v11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 21h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Quality Experiences",
      desc: "Highlighting consistently great providers and guest feedback.",
      icon: (
        <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 17l-5 3 1-6-4-4 6-1L12 3l2 6 6 1-4 4 1 6z" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Local Business Empowerment",
      desc: "Tools and insights to help businesses grow sustainably.",
      icon: (
        <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12h18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M6 6v12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Seamless Discovery",
      desc: "Search, compare and book with minimal friction.",
      icon: (
        <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M10 6h8M10 12h8M10 18h8M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="values" className={`${CONTAINER} py-16`}>
      <h2 id="values" className="text-2xl font-bold text-slate-900">
        Our values
      </h2>
      <p className="mt-3 text-slate-600 max-w-prose">Principles that guide our product and partnerships.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <article
            key={it.title}
            className="group rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-slate-100 p-2">{it.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
            </div>
            <p className="mt-3 text-slate-600 text-sm">{it.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Browse categories", desc: "Find hotels, salons, restaurants and services curated for quality." },
    { title: "Compare providers", desc: "Read reviews, view photos and check verified badges and pricing." },
    { title: "Book confidently", desc: "Reserve, contact providers, and leave feedback to help others." },
  ];

  return (
    <section aria-labelledby="how-it-works" className="bg-slate-50">
      <div className={`${CONTAINER} py-16`}>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900">
          How it works
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title} className="rounded-2xl p-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <span className="text-sm font-medium text-slate-700">{i + 1}</span>
                  </div>
                  <CardTitle className="!text-base">{s.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  const members = [
    { name: "Aisha Khan", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", bio: "Leads product and strategy." },
    { name: "Daniel Park", role: "Head of Engineering", img: "https://images.unsplash.com/photo-1545996124-1b5d6b0d9fbd?q=80&w=800&auto=format&fit=crop", bio: "Builds scalable infrastructure." },
    { name: "Marta Rossi", role: "Community Manager", img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop", bio: "Supports partners and quality." },
  ];

  return (
    <section aria-labelledby="team" className={`${CONTAINER} py-16`}>
      <h2 id="team" className="text-2xl font-bold text-slate-900">Team</h2>
      <p className="mt-3 text-slate-600 max-w-prose">A small, focused team dedicated to building trust between customers and businesses.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <article key={m.name} className="flex flex-col items-start gap-4 rounded-2xl border p-6 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={m.img} alt={`${m.name} headshot`} />
                <AvatarFallback>{m.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{m.name}</h3>
                <p className="text-sm text-slate-600">{m.role}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{m.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-slate-900 text-white">
      <div className={`${CONTAINER} py-16 text-center`}>
        <h2 className="text-2xl font-bold">Start discovering trusted local businesses</h2>
        <p className="mt-3 text-slate-300 max-w-prose mx-auto">Explore verified listings and book with confidence today.</p>
        <div className="mt-8">
          <Button size="lg" className="shadow-md">Explore Businesses</Button>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage(): JSX.Element {
  return (
    <main className="bg-white text-slate-900">
      <Hero />
      <Story />
      <MissionVision />
      <Values />
      <HowItWorks />
      <Team />
      <CTA />
    </main>
  );
}
