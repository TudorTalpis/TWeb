import { Navbar } from "@/components/Navbar";
import { useI18n } from "@/store/I18nContext";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
    const { t } = useI18n();
    return (
        <div className="flex min-h-screen flex-col bg-background bg-grid">
            <Navbar />
            <main className="relative flex-1 z-10">{children}</main>
            <footer className="relative z-10 border-t border-border/50 bg-card py-10">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                                <Zap className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-display text-sm font-bold text-foreground">ServeHub</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("footer.copy")}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <Link to="/about" className="link-underline hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
                            <Link to="/about" className="link-underline hover:text-foreground transition-colors">{t("footer.terms")}</Link>
                            <Link to="/about" className="link-underline hover:text-foreground transition-colors">{t("footer.about")}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
