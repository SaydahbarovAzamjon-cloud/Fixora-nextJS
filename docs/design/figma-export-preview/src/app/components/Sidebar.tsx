import {
  LayoutDashboard, Inbox, Briefcase, MessageSquare, Bell,
  User, BarChart2, DollarSign, Settings, HelpCircle, Zap,
  ChevronRight, BookOpen
} from "lucide-react";

export type Page =
  | "dashboard" | "requests" | "jobs" | "messages"
  | "notifications" | "profile" | "analytics" | "earnings"
  | "settings" | "help" | "articles";

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "requests" as Page, label: "Incoming Requests", icon: Inbox, badge: 4 },
  { id: "jobs" as Page, label: "Active Jobs", icon: Briefcase, badge: 7 },
  { id: "messages" as Page, label: "Messages", icon: MessageSquare, badge: 2 },
  { id: "notifications" as Page, label: "Notifications", icon: Bell, badge: 9 },
  { id: "profile" as Page, label: "Public Profile", icon: User },
  { id: "analytics" as Page, label: "Analytics", icon: BarChart2 },
  { id: "earnings" as Page, label: "Earnings", icon: DollarSign },
  { id: "articles" as Page, label: "Write Article", icon: BookOpen },
];

const BOTTOM_NAV = [
  { id: "settings" as Page, label: "Settings", icon: Settings },
  { id: "help" as Page, label: "Help & Support", icon: HelpCircle },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: "#0D0D0D",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(255,107,0,0.4)",
            flexShrink: 0,
          }}>
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#F0F0F0", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1 }}>FIXORA</div>
            <div style={{ color: "#FF6B00", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginTop: 2 }}>TECHNICIAN</div>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 8, padding: "6px 10px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
          <span style={{ color: "#22C55E", fontSize: 11, fontWeight: 600 }}>Available for Jobs</span>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: "10px 10px" }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ color: "#404040", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", padding: "6px 10px", marginBottom: 2 }}>MAIN MENU</div>
          {NAV.map((item) => {
            const active = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "8px 10px", borderRadius: 9,
                  border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? "rgba(255,107,0,0.14)" : "transparent",
                  color: active ? "#FF6B00" : "#808080",
                  transition: "all 0.15s ease",
                  marginBottom: 1,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#D0D0D0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#808080";
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, background: "#FF6B00", borderRadius: "0 2px 2px 0",
                    boxShadow: "0 0 8px rgba(255,107,0,0.6)",
                  }} />
                )}
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, lineHeight: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: active ? "#FF6B00" : "#2A2A2A",
                    color: active ? "#fff" : "#A0A0A0",
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", lineHeight: "16px",
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {BOTTOM_NAV.map((item) => {
          const active = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "8px 10px", borderRadius: 9,
                border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "rgba(255,107,0,0.14)" : "transparent",
                color: active ? "#FF6B00" : "#808080",
                transition: "all 0.15s ease",
                marginBottom: 1, position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#D0D0D0";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#808080";
                }
              }}
            >
              {active && (
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 18, background: "#FF6B00", borderRadius: "0 2px 2px 0",
                  boxShadow: "0 0 8px rgba(255,107,0,0.6)",
                }} />
              )}
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}

        {/* Technician card */}
        <div style={{
          marginTop: 10, padding: "10px 10px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff",
          }}>AK</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Kim</div>
            <div style={{ color: "#606060", fontSize: 11, marginTop: 1 }}>Pro Technician</div>
          </div>
          <ChevronRight size={13} color="#606060" />
        </div>
      </div>
    </aside>
  );
}
