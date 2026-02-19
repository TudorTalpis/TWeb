import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/storage";

const SignUp = (): JSX.Element => {
    const { state, dispatch } = useAppStore();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    const PASSWORD_RULES = [
        { id: "length", label: t("auth.rule.length"), test: (v: string) => v.length >= 8 },
        { id: "upper", label: t("auth.rule.upper"), test: (v: string) => /[A-Z]/.test(v) },
        { id: "number", label: t("auth.rule.number"), test: (v: string) => /\d/.test(v) },
        { id: "maxlen", label: t("auth.rule.maxlen"), test: (v: string) => v.length <= 128 },
    ];

    const passedRules = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
    const allRulesPassed = passedRules.every((r) => r.passed);
    const passwordsMatch = password === confirm;

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        setError("");
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedName) { setError(t("auth.error.noFullName")); return; }
        if (trimmedName.length < 2) { setError(t("auth.error.nameTooShort")); return; }
        if (!trimmedEmail) { setError(t("auth.error.noEmail")); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) { setError(t("auth.error.invalidEmail")); return; }
        const nameTaken = state.users.some((u: any) => u.name.toLowerCase() === trimmedName.toLowerCase());
        if (nameTaken) { setError(t("auth.error.nameTaken")); return; }
        const emailTaken = state.users.some((u: any) => u.email.toLowerCase() === trimmedEmail);
        if (emailTaken) { setError(t("auth.error.emailTaken")); return; }
        if (!allRulesPassed) { setError(t("auth.error.rulesNotMet")); return; }
        if (!passwordsMatch) { setError(t("auth.error.passNoMatch")); return; }

        const newUser = {
            id: generateId(),
            name: trimmedName,
            email: trimmedEmail,
            password,
            role: "USER" as const,
        };
        dispatch({ type: "ADD_USER", payload: newUser });
        dispatch({ type: "LOGIN", payload: { userId: newUser.id } });
        toast.success(`Welcome, ${newUser.name}!`);
        navigate("/");
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-16">
            <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

            <div className="relative w-full max-w-md animate-fade-in">
                <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-floating">
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow animate-glow-pulse">
                            <UserPlus className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="font-display text-2xl font-bold text-foreground">{t("auth.signUp.title")}</h1>
                        <p className="mt-2 text-muted-foreground text-sm">{t("auth.signUp.subtitle")}</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">{t("auth.field.name")}</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder={t("auth.field.namePlaceholder")}
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                className="h-11 rounded-xl bg-secondary/50 border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                autoComplete="name"
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">{t("auth.field.email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("auth.field.emailPlaceholder")}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                className="h-11 rounded-xl bg-secondary/50 border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                autoComplete="email"
                                maxLength={255}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">{t("auth.field.password")}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.field.newPasswordPlaceholder")}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); setTouched(true); }}
                                    className="h-11 rounded-xl bg-secondary/50 border-border/60 focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all"
                                    autoComplete="new-password"
                                    maxLength={128}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {touched && password.length > 0 && (
                                <div className="space-y-1 pt-1">
                                    {passedRules.map((rule) => (
                                        <div key={rule.id} className="flex items-center gap-2 text-xs">
                                            {rule.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/50" />}
                                            <span className={rule.passed ? "text-accent" : "text-muted-foreground"}>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirm" className="text-sm font-medium text-foreground/80">{t("auth.field.confirm")}</Label>
                            <div className="relative">
                                <Input
                                    id="confirm"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder={t("auth.field.confirmPlaceholder")}
                                    value={confirm}
                                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                                    className="h-11 rounded-xl bg-secondary/50 border-border/60 focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all"
                                    autoComplete="new-password"
                                    maxLength={128}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {touched && confirm.length > 0 && (
                                <div className="flex items-center gap-2 text-xs pt-1">
                                    {passwordsMatch ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/50" />}
                                    <span className={passwordsMatch ? "text-accent" : "text-muted-foreground"}>
                    {passwordsMatch ? t("auth.rule.match") : t("auth.rule.noMatch")}
                  </span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/8 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white font-semibold btn-glow shadow-glow transition-all hover:scale-[1.02]">
                            {t("auth.signUp.button")}
                        </Button>
                    </form>
                </div>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                    {t("auth.signUp.hasAccount")}{" "}
                    <Link to="/auth/login" className="text-primary font-semibold hover:text-primary/80 link-underline transition-colors">
                        {t("auth.signIn.title")}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
