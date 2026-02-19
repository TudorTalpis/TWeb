import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/storage";

const PASSWORD_RULES = [
    { id: "length", label: "Minimum 4 characters", test: (v: string) => v.length >= 4 },
    { id: "number", label: "Contains a number", test: (v: string) => /\d/.test(v) },
    { id: "maxlen", label: "Maximum 20 characters", test: (v: string) => v.length <= 20 },
];

const SignUp = (): JSX.Element => {
    const { state, dispatch } = useAppStore();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    const passedRules = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
    const allRulesPassed = passedRules.every((r) => r.passed);
    const passwordsMatch = password === confirm;

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            setError("Please enter your full name.");
            return;
        }
        if (trimmedName.length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Check for duplicate name or email
        const nameTaken = state.users.some(
            (u: any) => u.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (nameTaken) {
            setError("An account with that name already exists.");
            return;
        }
        const emailTaken = state.users.some(
            (u: any) => u.email.toLowerCase() === trimmedEmail
        );
        if (emailTaken) {
            setError("An account with that email already exists.");
            return;
        }

        if (!allRulesPassed) {
            setError("Password does not meet the requirements.");
            return;
        }
        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        const newUser = {
            id: generateId(),
            name: trimmedName,
            email: trimmedEmail,
            password,
            role: "USER" as const,
        };

        dispatch({ type: "ADD_USER", payload: newUser });
        dispatch({ type: "LOGIN", payload: { userId: newUser.id } });
        toast.success(`Welcome, ${newUser.name}! Your account has been created.`);
        navigate("/");
    };

    return (
        <div className="container mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-16 animate-fade-in">
            <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                    <UserPlus className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="mt-2 text-muted-foreground text-sm">Sign up to start booking services</p>
            </div>

            <form onSubmit={handleSignUp} className="w-full space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="e.g. Alex Johnson"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        className="h-11 rounded-xl"
                        autoComplete="name"
                        maxLength={100}
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="e.g. alex@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        className="h-11 rounded-xl"
                        autoComplete="email"
                        maxLength={255}
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); setTouched(true); }}
                            className="h-11 rounded-xl pr-10"
                            autoComplete="new-password"
                            maxLength={20}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {touched && password.length > 0 && (
                        <div className="space-y-1 pt-1">
                            {passedRules.map((rule) => (
                                <div key={rule.id} className="flex items-center gap-2 text-xs">
                                    {rule.passed ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    <span className={rule.passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>{rule.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={confirm}
                            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                            className="h-11 rounded-xl pr-10"
                            autoComplete="new-password"
                            maxLength={20}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {touched && confirm.length > 0 && (
                        <div className="flex items-center gap-2 text-xs pt-1">
                            {passwordsMatch ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className={passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-medium">
                    Create Account
                </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
};

export default SignUp;
