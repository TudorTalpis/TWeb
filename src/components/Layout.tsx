import { Navbar } from "@/components/Navbar";
import { useI18n } from "@/store/I18nContext";
import { Zap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
    const { t } = useI18n();
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
                                <Zap className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-display text-sm font-bold text-foreground">ServeHub</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("footer.copy")}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <a href="#" className="link-underline hover:text-foreground transition-colors">{t("footer.privacy")}</a>
                            <a href="#" className="link-underline hover:text-foreground transition-colors">{t("footer.terms")}</a>
                            <a href="/about" className="link-underline hover:text-foreground transition-colors">{t("footer.about")}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
