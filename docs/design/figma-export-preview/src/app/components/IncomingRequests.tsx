import { useState } from "react";
import {
  Search, Filter, Smartphone, Tablet, Laptop, Clock, MapPin,
  Star, ChevronRight, X, CheckCircle2, XCircle, MessageSquare,
  Camera, AlertTriangle, DollarSign, User, Zap
} from "lucide-react";

const REQUESTS = [
  {
    id: "REQ-1042", client: "Sarah Mitchell", avatar: "SM", rating: 4.9,
    device: "iPhone 15 Pro Max", deviceType: "phone",
    issue: "Cracked screen replacement — OLED display completely shattered after drop",
    description: "Dropped my phone from about 5 feet. The screen is completely cracked and the display has black spots. The phone still turns on but the touch screen barely works in some areas.",
    urgency: "high", budget: "$180", location: "San Francisco, CA",
    time: "12 min ago", distance: "2.4 mi",
    photos: 3, warranty: true,
    tags: ["Screen Repair", "OLED", "Express"],
  },
  {
    id: "REQ-1041", client: "James Torres", avatar: "JT", rating: 4.6,
    device: "MacBook Pro 14\" M3", deviceType: "laptop",
    issue: "Battery replacement + fan making grinding noise on startup",
    description: "The battery drains extremely fast now — can't hold charge for more than 1 hour. Also the fan started making a loud grinding noise when the laptop boots up. Concerned about overheating.",
    urgency: "medium", budget: "$280", location: "Oakland, CA",
    time: "34 min ago", distance: "5.1 mi",
    photos: 2, warranty: false,
    tags: ["Battery", "Fan Repair", "MacBook"],
  },
  {
    id: "REQ-1040", client: "Priya Kapoor", avatar: "PK", rating: 5.0,
    device: "iPad Air 5th Gen", deviceType: "tablet",
    issue: "Charging port completely non-functional, won't charge",
    description: "The iPad stopped charging about a week ago. I've tried multiple cables and chargers — none work. The device shows no sign of charging even with different lightning cables.",
    urgency: "low", budget: "$120", location: "Berkeley, CA",
    time: "1h ago", distance: "7.8 mi",
    photos: 1, warranty: true,
    tags: ["Charging Port", "iPad"],
  },
  {
    id: "REQ-1039", client: "Marcus Lane", avatar: "ML", rating: 4.7,
    device: "Apple Watch Ultra 2", deviceType: "phone",
    issue: "Cracked sapphire crystal screen, touchscreen unresponsive",
    description: "Cracked the Apple Watch screen during a trail run. The glass has a visible crack across the center and the touchscreen stopped working entirely. Everything else functions normally.",
    urgency: "medium", budget: "$220", location: "Palo Alto, CA",
    time: "2h ago", distance: "18.2 mi",
    photos: 4, warranty: false,
    tags: ["Screen Repair", "Apple Watch", "Sapphire"],
  },
  {
    id: "REQ-1038", client: "Elena Russo", avatar: "ER", rating: 4.8,
    device: "iPhone 13 mini", deviceType: "phone",
    issue: "Camera module replaced needed — front and rear both blurry",
    description: "Both cameras started producing extremely blurry photos about 2 months ago. Cleaned the lens multiple times but no improvement. Suspected internal camera module issue.",
    urgency: "low", budget: "$160", location: "San Jose, CA",
    time: "3h ago", distance: "12.4 mi",
    photos: 5, warranty: false,
    tags: ["Camera Repair", "iPhone 13"],
  },
];

const urgencyStyle = (u: string) =>
  u === "high" ? { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Urgent" }
  : u === "medium" ? { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Medium" }
  : { color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Low" };

const DevIcon = (t: string) => t === "tablet" ? Tablet : t === "laptop" ? Laptop : Smartphone;

const FILTERS = ["All", "Urgent", "Nearby", "High Budget", "iPhone", "MacBook", "iPad"];

export default function IncomingRequests() {
  const [selected, setSelected] = useState(REQUESTS[0]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = REQUESTS.filter(r =>
    r.device.toLowerCase().includes(search.toLowerCase()) ||
    r.client.toLowerCase().includes(search.toLowerCase()) ||
    r.issue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Left panel */}
      <div style={{
        width: 380, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        background: "#0D0D0D",
      }}>
        {/* Search + filters */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1A1A1A",
            border: `1px solid ${searchFocused ? "rgba(255,107,0,0.4)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, padding: "0 12px", marginBottom: 10,
            boxShadow: searchFocused ? "0 0 0 3px rgba(255,107,0,0.1)" : "none",
            transition: "all 0.2s",
          }}>
            <Search size={13} color={searchFocused ? "#FF6B00" : "#505050"} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search requests..."
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#E0E0E0", fontSize: 12, width: "100%", padding: "9px 0",
              }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X size={12} color="#505050" /></button>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                background: activeFilter === f ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeFilter === f ? "rgba(255,107,0,0.35)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 20, padding: "4px 10px",
                color: activeFilter === f ? "#FF6B00" : "#707070",
                fontSize: 11, fontWeight: activeFilter === f ? 600 : 400, cursor: "pointer",
                transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filtered.map(req => {
            const ug = urgencyStyle(req.urgency);
            const Icon = DevIcon(req.deviceType);
            const isSelected = selected.id === req.id;
            return (
              <div
                key={req.id}
                onClick={() => setSelected(req)}
                style={{
                  padding: "14px", borderRadius: 11, marginBottom: 6, cursor: "pointer",
                  background: isSelected ? "rgba(255,107,0,0.08)" : "transparent",
                  border: `1px solid ${isSelected ? "rgba(255,107,0,0.25)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.15s",
                  boxShadow: isSelected ? "0 0 16px rgba(255,107,0,0.1)" : "none",
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: "#1C1C1C",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={16} color="#707070" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{req.client}</span>
                      <span style={{ color: "#404040", fontSize: 10 }}>•</span>
                      <span style={{ color: "#505050", fontSize: 11 }}>{req.id}</span>
                    </div>
                    <div style={{ color: "#808080", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.device}</div>
                  </div>
                  <span style={{
                    background: ug.bg, color: ug.color, borderRadius: 20,
                    fontSize: 9, fontWeight: 700, padding: "2px 7px",
                    letterSpacing: "0.05em", textTransform: "uppercase" as const, flexShrink: 0,
                  }}>{ug.label}</span>
                </div>
                <div style={{ color: "#707070", fontSize: 12, lineHeight: 1.4, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{req.issue}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#FF6B00", fontSize: 14, fontWeight: 700 }}>{req.budget}</span>
                    <span style={{ color: "#404040", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} /> {req.distance}
                    </span>
                  </div>
                  <span style={{ color: "#505050", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={10} /> {req.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right detail panel */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0A0A0A" }}>
        <div style={{ padding: "24px", maxWidth: 720 }}>
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ color: "#606060", fontSize: 12, marginBottom: 4 }}>{selected.id} • {selected.time}</div>
                <h2 style={{ color: "#F0F0F0", margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{selected.issue.split("—")[0].trim()}</h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {(() => {
                  const ug = urgencyStyle(selected.urgency);
                  return (
                    <span style={{ background: ug.bg, color: ug.color, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700 }}>{ug.label}</span>
                  );
                })()}
              </div>
            </div>
            {/* Tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.tags.map(tag => (
                <span key={tag} style={{
                  background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)",
                  color: "#FF9A3C", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Client + Device grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {/* Client */}
            <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 18 }}>
              <div style={{ color: "#606060", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>CLIENT</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#fff",
                }}>{selected.avatar}</div>
                <div>
                  <div style={{ color: "#E0E0E0", fontSize: 15, fontWeight: 700 }}>{selected.client}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}>{selected.rating}</span>
                    <span style={{ color: "#505050", fontSize: 11 }}>client rating</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#606060", fontSize: 12 }}>
                  <MapPin size={12} /> {selected.location}
                </div>
                <div style={{ color: "#404040" }}>•</div>
                <div style={{ color: "#606060", fontSize: 12 }}>{selected.distance} away</div>
              </div>
            </div>

            {/* Device info */}
            <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 18 }}>
              <div style={{ color: "#606060", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>DEVICE</div>
              {(() => {
                const Icon = DevIcon(selected.deviceType);
                return (
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: "#1A1A1A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={22} color="#FF6B00" />
                    </div>
                    <div>
                      <div style={{ color: "#E0E0E0", fontSize: 15, fontWeight: 700 }}>{selected.device}</div>
                      <div style={{ color: "#606060", fontSize: 12, marginTop: 2 }}>
                        {selected.warranty ? <span style={{ color: "#22C55E" }}>✓ In Warranty</span> : <span style={{ color: "#EF4444" }}>✗ Out of Warranty</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "#1A1A1A", borderRadius: 8, padding: "4px 10px", color: "#808080", fontSize: 11 }}>
                  <Camera size={11} style={{ display: "inline", marginRight: 4 }} />{selected.photos} photos
                </span>
                <span style={{ background: "#1A1A1A", borderRadius: 8, padding: "4px 10px", color: "#FF6B00", fontSize: 11, fontWeight: 700 }}>{selected.budget}</span>
              </div>
            </div>
          </div>

          {/* Issue description */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 18 }}>
            <div style={{ color: "#606060", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10 }}>ISSUE DESCRIPTION</div>
            <p style={{ color: "#C0C0C0", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{selected.description}</p>
          </div>

          {/* Photo placeholders */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ color: "#606060", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>DAMAGE PHOTOS ({selected.photos})</div>
            <div style={{ display: "flex", gap: 10 }}>
              {Array.from({ length: selected.photos }).map((_, i) => (
                <div key={i} style={{
                  width: 100, height: 100, borderRadius: 10,
                  background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", gap: 6,
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,107,0,0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  <Camera size={20} color="#404040" />
                  <span style={{ color: "#404040", fontSize: 10 }}>Photo {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{
              flex: 1, padding: "14px 24px", borderRadius: 12,
              background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
              border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 0 24px rgba(255,107,0,0.4)",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 36px rgba(255,107,0,0.6)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(255,107,0,0.4)"; }}
            >
              <CheckCircle2 size={16} /> Accept & Send Quote
            </button>
            <button style={{
              padding: "14px 24px", borderRadius: 12,
              background: "transparent", border: "1px solid rgba(59,130,246,0.3)",
              color: "#3B82F6", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <MessageSquare size={16} /> Message Client
            </button>
            <button style={{
              padding: "14px 20px", borderRadius: 12,
              background: "transparent", border: "1px solid rgba(239,68,68,0.25)",
              color: "#EF4444", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <XCircle size={16} /> Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
