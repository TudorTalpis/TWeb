import { Navbar } from "@/components/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card/50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          © 2026 ServeHub — Service Marketplace Demo
        </div>
      </footer>
    </div>
  );
}
