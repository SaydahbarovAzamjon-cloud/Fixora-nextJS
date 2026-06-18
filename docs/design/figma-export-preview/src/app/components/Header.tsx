import { useState } from "react";
import { Search, Bell, Settings, ChevronDown, Plus, MessageSquare } from "lucide-react";
import type { Page } from "./Sidebar";
import { OG, OG_GLOW, OG_GLOW_H } from "./ui/gradient";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  requests: "Incoming Requests",
  jobs: "Active Jobs",
  messages: "Messages",
  notifications: "Notifications",
  profile: "Public Profile",
  analytics: "Analytics",
  earnings: "Earnings",
  settings: "Settings",
  help: "Help & Support",
};

interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ activePage, onNavigate }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      position: "fixed", top: 0, left: 240, right: 0, height: 60,
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16, zIndex: 40,
    }}>
      {/* Page title */}
      <div style={{ flex: "0 0 auto" }}>
        <h1 style={{ color: "#F0F0F0", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
          {PAGE_TITLES[activePage]}
        </h1>
      </div>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 380, marginLeft: 16,
        display: "flex", alignItems: "center",
        background: searchFocused ? "#1A1A1A" : "#141414",
        border: `1px solid ${searchFocused ? "rgba(255,107,0,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10, padding: "0 12px", gap: 8,
        boxShadow: searchFocused ? "0 0 0 3px rgba(255,107,0,0.1)" : "none",
        transition: "all 0.2s ease",
      }}>
        <Search size={14} color={searchFocused ? "#FF6B00" : "#505050"} />
        <input
          placeholder="Search jobs, clients, devices..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "#E0E0E0", fontSize: 13, width: "100%", padding: "8px 0",
          }}
        />
        <kbd style={{
          background: "#252525", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 5, padding: "2px 6px", fontSize: 10, color: "#606060",
          fontFamily: "inherit", lineHeight: "14px",
        }}>⌘K</kbd>
      </div>

      <div style={{ flex: 1 }} />

      {/* New Quote button — gradient */}
      <button
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: OG,
          border: "none", borderRadius: 9, padding: "7px 14px",
          color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: "pointer",
          boxShadow: OG_GLOW,
          transition: "box-shadow 0.2s ease",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = OG_GLOW_H; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = OG_GLOW; }}
      >
        <Plus size={13} strokeWidth={2.5} />
        New Quote
      </button>

      {/* Icon buttons */}
      {[
        { icon: MessageSquare, label: "Messages", badge: 2, page: "messages" as Page },
        { icon: Bell, label: "Notifications", badge: 9, page: "notifications" as Page },
      ].map(({ icon: Icon, label, badge, page }) => (
        <button
          key={label}
          onClick={() => onNavigate(page)}
          title={label}
          style={{
            position: "relative",
            width: 36, height: 36, borderRadius: 9,
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#606060",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,0,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#606060";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <Icon size={15} strokeWidth={1.8} />
          {badge > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: OG,
              color: "#fff",
              borderRadius: 20, fontSize: 9, fontWeight: 700,
              padding: "1px 5px", lineHeight: "13px",
              border: "1.5px solid #0A0A0A",
              boxShadow: "0 0 8px rgba(255,90,0,0.5)",
            }}>{badge > 9 ? "9+" : badge}</span>
          )}
        </button>
      ))}

      {/* Settings */}
      <button
        onClick={() => onNavigate("settings")}
        title="Settings"
        style={{
          width: 36, height: 36, borderRadius: 9,
          background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#606060", transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.1)";
          (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,0,0.3)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#606060";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        <Settings size={15} strokeWidth={1.8} />
      </button>

      {/* Profile dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "5px 10px 5px 5px", cursor: "pointer",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: OG,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            boxShadow: "0 0 10px rgba(255,90,0,0.4)",
          }}>AK</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Alex Kim</div>
            <div style={{ color: "#505050", fontSize: 10 }}>Pro Technician</div>
          </div>
          <ChevronDown size={12} color="#505050" />
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)",
            background: "#161616", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: 6, minWidth: 180,
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)", zIndex: 100,
          }}>
            {[
              { label: "View Profile", page: "profile" as Page },
              { label: "Settings", page: "settings" as Page },
            ].map(({ label, page }) => (
              <button
                key={label}
                onClick={() => { onNavigate(page); setDropdownOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 12px", borderRadius: 8,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#C0C0C0", fontSize: 13, transition: "all 0.1s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#C0C0C0";
                }}
              >{label}</button>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "4px 0" }} />
            <button style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "8px 12px", borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              color: "#EF4444", fontSize: 13,
            }}>Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
}
