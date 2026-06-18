import { useState } from "react";
import {
  Bell, CheckCheck, Inbox, MessageSquare, DollarSign, Star, AlertCircle,
  CheckCircle2, Package, User, Zap, X
} from "lucide-react";

/* Instagram-style gradient presets */
const IG_GRAD: Record<string, string> = {
  request: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
  message: "linear-gradient(135deg, #405de6, #5851db, #833ab4, #c13584)",
  payment: "linear-gradient(135deg, #11998e, #38ef7d)",
  review:  "linear-gradient(135deg, #f7971e, #ffd200)",
  alert:   "linear-gradient(135deg, #f953c6, #b91d73)",
  parts:   "linear-gradient(135deg, #7F00FF, #E100FF)",
  profile: "linear-gradient(135deg, #4facfe, #00f2fe)",
};

const NOTIFICATIONS = [
  {
    id: "n1", group: "today", type: "request", read: false,
    icon: Inbox, color: "#fff", bg: IG_GRAD.request,
    title: "New Repair Request",
    message: "Sarah Mitchell requested iPhone 15 Pro Max screen replacement — $180 budget",
    time: "12 min ago", action: "View Request", actionColor: "#fd1d1d",
  },
  {
    id: "n2", group: "today", type: "message", read: false,
    icon: MessageSquare, color: "#fff", bg: IG_GRAD.message,
    title: "New Message",
    message: "Daniel Wagner: \"Is my phone ready? Any updates on the repair?\"",
    time: "45 min ago", action: "Reply", actionColor: "#833ab4",
  },
  {
    id: "n3", group: "today", type: "payment", read: true,
    icon: DollarSign, color: "#fff", bg: IG_GRAD.payment,
    title: "Payment Received",
    message: "Lily Chen paid $380 for iPad Pro screen replacement — JOB-879",
    time: "2h ago", action: "View Receipt", actionColor: "#11998e",
  },
  {
    id: "n4", group: "today", type: "review", read: false,
    icon: Star, color: "#fff", bg: IG_GRAD.review,
    title: "New 5-Star Review",
    message: "Michael Chen left a 5-star review: \"Fast, reliable, and affordable. My MacBook is running like new again.\"",
    time: "3h ago", action: "View Review", actionColor: "#f7971e",
  },
  {
    id: "n5", group: "today", type: "alert", read: true,
    icon: AlertCircle, color: "#fff", bg: IG_GRAD.alert,
    title: "Job Due Soon",
    message: "JOB-882 (Daniel Wagner — iPhone 14 Plus) is due today at 5:00 PM",
    time: "4h ago", action: "View Job", actionColor: "#f953c6",
  },
  {
    id: "n6", group: "earlier", type: "parts", read: true,
    icon: Package, color: "#fff", bg: IG_GRAD.parts,
    title: "Parts Arrived",
    message: "Replacement parts for JOB-880 (iPhone 13 mini battery + camera) have arrived",
    time: "Yesterday, 3PM", action: "View Job", actionColor: "#7F00FF",
  },
  {
    id: "n7", group: "earlier", type: "request", read: true,
    icon: Inbox, color: "#fff", bg: IG_GRAD.request,
    title: "Request Expired",
    message: "Request REQ-1035 from Kevin Park expired — you didn't respond within 24 hours",
    time: "Yesterday, 11AM", action: null, actionColor: "#fd1d1d",
  },
  {
    id: "n8", group: "earlier", type: "payment", read: true,
    icon: DollarSign, color: "#fff", bg: IG_GRAD.payment,
    title: "Weekly Payout",
    message: "Your weekly earnings of $3,240 have been processed and will arrive in 1-2 business days",
    time: "Jun 14, 9AM", action: "View Earnings", actionColor: "#11998e",
  },
  {
    id: "n9", group: "earlier", type: "profile", read: true,
    icon: User, color: "#fff", bg: IG_GRAD.profile,
    title: "Profile Milestone",
    message: "Congratulations! You've completed 200 repairs and earned the Expert Technician badge 🎉",
    time: "Jun 13, 2PM", action: "View Profile", actionColor: "#4facfe",
  },
  {
    id: "n10", group: "earlier", type: "review", read: true,
    icon: Star, color: "#fff", bg: IG_GRAD.review,
    title: "New 5-Star Review",
    message: "Sarah Johnson left a 5-star review: \"Alex fixed my iPhone screen in under an hour. Absolutely professional!\"",
    time: "Jun 13, 12PM", action: "View Review", actionColor: "#f7971e",
  },
];

const FILTERS = ["All", "Requests", "Messages", "Payments", "Reviews", "Alerts"];

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filterFn = (n: typeof NOTIFICATIONS[0]) => {
    if (activeFilter === "All") return true;
    const map: Record<string, string[]> = {
      "Requests": ["request"],
      "Messages": ["message"],
      "Payments": ["payment"],
      "Reviews": ["review"],
      "Alerts": ["alert", "parts"],
    };
    return map[activeFilter]?.includes(n.type);
  };

  const todayNotifs = notifications.filter(n => n.group === "today" && filterFn(n));
  const earlierNotifs = notifications.filter(n => n.group === "earlier" && filterFn(n));

  return (
    <div style={{ padding: "24px", maxWidth: 780 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700 }}>Notification Center</span>
            {unreadCount > 0 && (
              <span style={{
                background: "#FF6B00", color: "#fff",
                borderRadius: 20, fontSize: 11, fontWeight: 700,
                padding: "2px 9px",
              }}>{unreadCount} new</span>
            )}
          </div>
          <div style={{ color: "#606060", fontSize: 13, marginTop: 4 }}>Stay on top of your repair workflow</div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
              borderRadius: 9, padding: "8px 16px",
              color: "#FF6B00", fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.1)"; }}
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? "rgba(255,107,0,0.14)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeFilter === f ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 20, padding: "5px 14px",
              color: activeFilter === f ? "#FF6B00" : "#707070",
              fontSize: 12, fontWeight: activeFilter === f ? 600 : 400, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >{f}</button>
        ))}
      </div>

      {/* Today */}
      {todayNotifs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#606060", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>TODAY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayNotifs.map(notif => (
              <NotifCard key={notif.id} notif={notif} onDismiss={dismiss} onMarkRead={markRead} />
            ))}
          </div>
        </div>
      )}

      {/* Earlier */}
      {earlierNotifs.length > 0 && (
        <div>
          <div style={{ color: "#606060", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>EARLIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {earlierNotifs.map(notif => (
              <NotifCard key={notif.id} notif={notif} onDismiss={dismiss} onMarkRead={markRead} />
            ))}
          </div>
        </div>
      )}

      {todayNotifs.length === 0 && earlierNotifs.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Bell size={40} color="#2A2A2A" style={{ marginBottom: 12 }} />
          <div style={{ color: "#505050", fontSize: 14 }}>No notifications in this category</div>
        </div>
      )}
    </div>
  );
}

function NotifCard({
  notif, onDismiss, onMarkRead
}: {
  notif: typeof NOTIFICATIONS[0];
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = notif.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onMarkRead(notif.id)}
      style={{
        display: "flex", gap: 14, padding: "16px 18px",
        background: notif.read ? "#111111" : "#131111",
        border: `1px solid ${notif.read ? "rgba(255,255,255,0.07)" : "rgba(255,107,0,0.15)"}`,
        borderRadius: 12, cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: notif.read ? "none" : "0 0 16px rgba(255,107,0,0.06)",
        position: "relative",
      }}
    >
      {!notif.read && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 32, background: "#FF6B00",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 8px rgba(255,107,0,0.5)",
        }} />
      )}

      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: notif.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
      }}>
        <Icon size={18} color="#fff" strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: notif.read ? "#D0D0D0" : "#F0F0F0", fontSize: 13, fontWeight: 600 }}>{notif.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#505050", fontSize: 11 }}>{notif.time}</span>
            {hovered && (
              <button
                onClick={e => { e.stopPropagation(); onDismiss(notif.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#505050", padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div style={{ color: "#808080", fontSize: 12, lineHeight: 1.5 }}>{notif.message}</div>
        {notif.action && (
          <button
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: 8, background: "transparent",
              border: `1px solid ${(notif as any).actionColor ?? notif.color}40`,
              borderRadius: 7, padding: "4px 12px",
              color: (notif as any).actionColor ?? notif.color,
              fontSize: 11, fontWeight: 600,
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => { const c = (notif as any).actionColor ?? notif.color; (e.currentTarget as HTMLButtonElement).style.background = `${c}18`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >{notif.action}</button>
        )}
      </div>
    </div>
  );
}
