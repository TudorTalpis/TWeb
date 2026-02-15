import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Briefcase, ShieldCheck } from "lucide-react";

const demoAccounts = [
  { id: "user1", label: "Alex Johnson", role: "USER" as const, icon: User, desc: "Book services, manage bookings" },
  { id: "prov1", label: "Maria Garcia", role: "PROVIDER" as const, icon: Briefcase, desc: "Manage services & schedule" },
  { id: "admin1", label: "Admin User", role: "ADMIN" as const, icon: ShieldCheck, desc: "Approve providers, full control" },
];

const Login = () => {
  const { dispatch } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    dispatch({ type: "LOGIN", payload: { userId } });
    navigate("/");
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
          <Shield className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Demo Login</h1>
        <p className="mt-2 text-muted-foreground text-sm">Select an account to explore different roles</p>
      </div>
      <div className="w-full space-y-3">
        {demoAccounts.map((acc) => (
          <button
            key={acc.id}
            onClick={() => handleLogin(acc.id)}
            className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <acc.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{acc.label}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{acc.role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{acc.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Login;
