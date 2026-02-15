import { useAppStore } from "@/store/AppContext";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const userId = state.session.userId;
  const notifications = state.notifications.filter((n) => n.userId === userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (n: (typeof notifications)[0]) => {
    if (!n.read) dispatch({ type: "MARK_NOTIFICATION_READ", payload: n.id });
    if (n.linkTo) navigate(n.linkTo);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })} className="text-xs gap-1.5 rounded-full">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                n.read ? "bg-card opacity-50" : "bg-card shadow-card border-primary/15 hover:shadow-elevated"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
                {n.read && <Check className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
