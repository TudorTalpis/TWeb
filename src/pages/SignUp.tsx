import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    UserPlus,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreedToTerms?: string;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_STRENGTH_RULES = [
    {
        id: "length",
        label: "At least 8 characters",
        test: (v: string) => v.length >= 8,
    },
    {
        id: "uppercase",
        label: "One uppercase letter",
        test: (v: string) => /[A-Z]/.test(v),
    },
    {
        id: "number",
        label: "One number",
        test: (v: string) => /\d/.test(v),
    },
];

function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {};

    if (!values.fullName.trim()) {
        errors.fullName = "Full name is required.";
    } else if (values.fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!values.email.trim()) {
        errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(values.email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (!values.password) {
        errors.password = "Password is required.";
    } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
    } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = "Passwords do not match.";
    }

    // Terms checkbox is optional — no error thrown, but submit is blocked if unchecked
    // (handled separately in the submit handler)

    return errors;
}

// ─── SignUp component ─────────────────────────────────────────────────────────

const SignUp = (): JSX.Element => {
    const [values, setValues] = useState<FormValues>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreedToTerms: false,
    });

    // Track which fields have been touched (blurred) to show inline errors only after interaction
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

    // Show/hide toggles for password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Whether the form has been submitted successfully
    const [submitted, setSubmitted] = useState(false);

    const errors = validate(values);
    const isFormValid =
        Object.keys(errors).length === 0 && values.agreedToTerms;

    const passwordRules = PASSWORD_STRENGTH_RULES.map((rule) => ({
        ...rule,
        passed: rule.test(values.password),
    }));

    // ── Handlers ────────────────────────────────────────────────────────────────

    const handleChange = (field: keyof FormValues) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof FormValues) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched to reveal any hidden errors
        const allTouched = Object.fromEntries(
            Object.keys(values).map((k) => [k, true])
        ) as Partial<Record<keyof FormValues, boolean>>;
        setTouched(allTouched);

        if (!isFormValid) return;

        // No API call — demo only
        setSubmitted(true);
    };

    const handleReset = () => {
        setValues({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreedToTerms: false,
        });
        setTouched({});
        setSubmitted(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    // ── Success screen ───────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 animate-fade-in">
                <div className="w-full rounded-2xl border bg-card p-8 shadow-elevated text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">You're all set!</h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Account created locally{" "}
                            <span className="font-medium text-primary">(demo UI only)</span>.
                            No data was stored or sent anywhere.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-muted/30 px-4 py-3 text-left space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Submitted as
                        </p>
                        <p className="text-sm font-medium">{values.fullName}</p>
                        <p className="text-sm text-muted-foreground">{values.email}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleReset}
                            className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-medium"
                        >
                            Start over
                        </Button>
                        <Link
                            to="/auth/login"
                            className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                        >
                            Go to Sign In →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form ────────────────────────────────────────────────────────────────

    return (
        <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                    <UserPlus className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="mt-2 text-muted-foreground text-sm">
                    Join thousands of users — it's free
                </p>
            </div>

            {/* Card */}
            <div className="w-full rounded-2xl border bg-card shadow-elevated">
                <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

                    {/* ── Full Name ──────────────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="e.g. Alex Johnson"
                            value={values.fullName}
                            onChange={handleChange("fullName")}
                            onBlur={handleBlur("fullName")}
                            className={`h-11 rounded-xl transition-colors ${touched.fullName && errors.fullName
                                    ? "border-destructive focus-visible:ring-destructive/30"
                                    : ""
                                }`}
                            autoComplete="name"
                            maxLength={100}
                            aria-describedby={touched.fullName && errors.fullName ? "fullName-error" : undefined}
                            aria-invalid={!!(touched.fullName && errors.fullName)}
                        />
                        {touched.fullName && errors.fullName && (
                            <FieldError id="fullName-error" message={errors.fullName} />
                        )}
                    </div>

                    {/* ── Email ─────────────────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={values.email}
                            onChange={handleChange("email")}
                            onBlur={handleBlur("email")}
                            className={`h-11 rounded-xl transition-colors ${touched.email && errors.email
                                    ? "border-destructive focus-visible:ring-destructive/30"
                                    : ""
                                }`}
                            autoComplete="email"
                            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                            aria-invalid={!!(touched.email && errors.email)}
                        />
                        {touched.email && errors.email && (
                            <FieldError id="email-error" message={errors.email} />
                        )}
                    </div>

                    {/* ── Password ──────────────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                value={values.password}
                                onChange={handleChange("password")}
                                onBlur={handleBlur("password")}
                                className={`h-11 rounded-xl pr-10 transition-colors ${touched.password && errors.password
                                        ? "border-destructive focus-visible:ring-destructive/30"
                                        : ""
                                    }`}
                                autoComplete="new-password"
                                aria-describedby="password-rules"
                                aria-invalid={!!(touched.password && errors.password)}
                            />
                            <PasswordToggle
                                show={showPassword}
                                onToggle={() => setShowPassword((p) => !p)}
                            />
                        </div>

                        {/* Strength checklist — shown once user starts typing */}
                        {values.password.length > 0 && (
                            <div id="password-rules" className="space-y-1 pt-1">
                                {passwordRules.map((rule) => (
                                    <div key={rule.id} className="flex items-center gap-2 text-xs">
                                        {rule.passed ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        )}
                                        <span className={rule.passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {touched.password && errors.password && values.password.length === 0 && (
                            <FieldError id="password-error" message={errors.password} />
                        )}
                    </div>

                    {/* ── Confirm Password ──────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repeat your password"
                                value={values.confirmPassword}
                                onChange={handleChange("confirmPassword")}
                                onBlur={handleBlur("confirmPassword")}
                                className={`h-11 rounded-xl pr-10 transition-colors ${touched.confirmPassword && errors.confirmPassword
                                        ? "border-destructive focus-visible:ring-destructive/30"
                                        : ""
                                    }`}
                                autoComplete="new-password"
                                aria-describedby={
                                    touched.confirmPassword && errors.confirmPassword
                                        ? "confirmPassword-error"
                                        : undefined
                                }
                                aria-invalid={!!(touched.confirmPassword && errors.confirmPassword)}
                            />
                            <PasswordToggle
                                show={showConfirmPassword}
                                onToggle={() => setShowConfirmPassword((p) => !p)}
                            />
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <FieldError id="confirmPassword-error" message={errors.confirmPassword} />
                        )}
                    </div>

                    {/* ── Terms checkbox ─────────────────────────────────────────────── */}
                    <div className="flex items-start gap-3 pt-1">
                        <input
                            id="agreedToTerms"
                            type="checkbox"
                            checked={values.agreedToTerms}
                            onChange={handleChange("agreedToTerms")}
                            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
                            aria-describedby="terms-label"
                        />
                        <label
                            id="terms-label"
                            htmlFor="agreedToTerms"
                            className="text-sm text-muted-foreground leading-relaxed cursor-pointer select-none"
                        >
                            I agree to the{" "}
                            <span className="text-primary font-medium hover:underline cursor-pointer">
                                Terms of Service
                            </span>{" "}
                            and{" "}
                            <span className="text-primary font-medium hover:underline cursor-pointer">
                                Privacy Policy
                            </span>
                        </label>
                    </div>

                    {/* ── Submit ────────────────────────────────────────────────────── */}
                    <Button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        Create account
                    </Button>

                    {/* Already have an account link */}
                    <p className="text-center text-sm text-muted-foreground pt-1">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="font-medium text-primary hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline field error message */
function FieldError({ id, message }: { id: string; message: string }) {
    return (
        <div id={id} role="alert" className="flex items-center gap-1.5 text-xs text-destructive mt-0.5">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}

/** Eye / EyeOff toggle for password inputs */
function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={show ? "Hide password" : "Show password"}
        >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    );
}

export default SignUp;
