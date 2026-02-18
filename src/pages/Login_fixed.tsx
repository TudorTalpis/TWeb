import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PASSWORD_RULES = [
  { id: "length", label: "Minimum 4 characters", test: (v: string) => v.length >= 4 },
  { id: "number", label: "Contains a number", test: (v: string) => /\d/.test(v) },
  { id: "maxlen", label: "Maximum 20 characters", test: (v: string) => v.length <= 20 },
];

const Login = (): JSX.Element => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const passedRules = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const allRulesPassed = passedRules.every((r) => r.passed);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!allRulesPassed) {
      setError("Password does not meet the requirements.");
      return;
    }

    const user = state.users.find((u) => u.name.toLowerCase() === trimmedName.toLowerCase());
    if (!user) {
      setError("No account found with that name.");
      return;
    }
    if (user.password !== password) {
      setError("Incorrect password.");
      return;
    }

    dispatch({ type: "LOGIN", payload: { userId: user.id } });
    toast.success(`Welcome back, ${user.name}!`);
    navigate("/");
  };

  const handleGoogleLogin = () => {
    const user = state.users.find((u) => u.role === "USER");
    if (user) {
      dispatch({ type: "LOGIN", payload: { userId: user.id } });
      toast.success(`Signed in with Google as ${user.name}`);
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
          <Shield className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="mt-2 text-muted-foreground text-sm">Enter your credentials to access your account</p>
      </div>

      <div className="w-full space-y-6">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-3 rounded-xl text-sm font-medium"
          onClick={handleGoogleLogin}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); setTouched(true); }}
                className="h-11 rounded-xl pr-10"
                autoComplete="current-password"
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={rule.passed ? "text-green-600" : "text-muted-foreground"}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-medium">Sign In</Button>
        </form>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo accounts (password: 1234)</p>
          <div className="flex flex-wrap gap-1.5">
            {state.users.map((u: any) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setName(u.name); setPassword("1234"); setTouched(true); setError(""); }}
                className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
              >
                {u.name.split(" ")[0]}
                <Badge variant="outline" className="text-[9px] capitalize px-1 py-0">{u.role}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
