import { Navbar } from "@/components/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background bg-grid">
            <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
            <Navbar />
            <main className="relative flex-1 z-10">{children}</main>
            <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm py-10">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-glow">
                                <span className="text-xs font-bold text-white">S</span>
                            </div>
                            <span className="font-display text-sm font-bold text-foreground">ServeHub</span>
                        </div>
                        <p className="text-xs text-muted-foreground">© 2026 ServeHub — Premium Service Marketplace</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <a href="#" className="link-underline hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="link-underline hover:text-foreground transition-colors">Terms</a>
                            <a href="/about" className="link-underline hover:text-foreground transition-colors">About</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
