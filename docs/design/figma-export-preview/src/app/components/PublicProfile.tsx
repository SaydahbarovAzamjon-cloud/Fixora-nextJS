import { useState } from "react";
import {
  Star, MapPin, Shield, Award, Zap, CheckCircle2, MessageSquare,
  Phone, ExternalLink, Smartphone, Laptop, Tablet, Clock, ThumbsUp,
  BadgeCheck, Trophy, TrendingUp, ChevronRight
} from "lucide-react";
import Stories from "./Stories";

const SERVICES = [
  { name: "Screen Replacement", devices: "iPhone, iPad, MacBook", price: "From $89", time: "1–2 hrs", popular: true },
  { name: "Battery Replacement", devices: "All Apple Devices", price: "From $69", time: "45 min", popular: false },
  { name: "Water Damage Recovery", devices: "iPhone, MacBook", price: "From $149", time: "24–48 hrs", popular: false },
  { name: "Logic Board Repair", devices: "MacBook, iMac", price: "From $280", time: "2–5 days", popular: false },
  { name: "Camera Module", devices: "iPhone, iPad", price: "From $99", time: "1–3 hrs", popular: false },
  { name: "Charging Port", devices: "iPhone, iPad, MacBook", price: "From $59", time: "30–60 min", popular: false },
];

const PORTFOLIO = [
  { title: "iPhone 15 Pro Max — Screen", result: "OLED display restored", device: "phone", stars: 5, client: "Sarah M." },
  { title: "MacBook Pro 16\" — Logic Board", result: "GPU reflow + solder repair", device: "laptop", stars: 5, client: "David K." },
  { title: "iPad Pro 12.9\" — Screen", result: "Genuine Apple display", device: "tablet", stars: 5, client: "Lily C." },
  { title: "iPhone 14 Plus — Water Damage", result: "Full motherboard cleaning", device: "phone", stars: 5, client: "Daniel W." },
  { title: "MacBook Air M2 — Battery", result: "OEM battery, 100% health", device: "laptop", stars: 5, client: "Emma R." },
  { title: "Apple Watch Ultra — Screen", result: "Sapphire crystal replaced", device: "phone", stars: 4, client: "Marcus L." },
];

const REVIEWS = [
  { client: "Sarah Johnson", avatar: "SJ", rating: 5, date: "Jun 14, 2026", device: "iPhone 14 Pro", text: "Alex is an absolute professional. Fixed my cracked screen in under an hour and it looks brand new. His workspace is super clean and organized. 10/10 would highly recommend.", verified: true },
  { client: "Michael Chen", avatar: "MC", rating: 5, date: "Jun 12, 2026", device: "MacBook Pro M3", text: "Fast, reliable, and affordable. Brought in my MacBook with a dead battery and Alex had it fixed same day. Even cleaned the keyboard while he was at it!", verified: true },
  { client: "Emma Davis", avatar: "ED", rating: 4, date: "Jun 10, 2026", device: "iPad Pro", text: "Really solid repair service. The screen replacement on my iPad looks perfect. Took slightly longer than quoted but Alex communicated proactively through the app.", verified: true },
  { client: "James Park", avatar: "JP", rating: 5, date: "Jun 8, 2026", device: "iPhone 15", text: "Third time using Alex and he never disappoints. Water damage recovery on my iPhone — thought it was dead for good. He saved it completely!", verified: true },
  { client: "Priya Sharma", avatar: "PS", rating: 5, date: "Jun 5, 2026", device: "MacBook Air", text: "Exceptional service. Alex diagnosed my MacBook's charging issue quickly and fixed it at a very fair price. The 90-day warranty gave me extra confidence.", verified: true },
];

const BADGES = [
  { label: "Top Technician", icon: Trophy, color: "#F59E0B", desc: "Top 5% on FIXORA" },
  { label: "Verified Pro", icon: BadgeCheck, color: "#3B82F6", desc: "ID & skills verified" },
  { label: "200+ Repairs", icon: Zap, color: "#FF6B00", desc: "Completion milestone" },
  { label: "5-Star Rated", icon: Star, color: "#22C55E", desc: "4.9 avg. rating" },
  { label: "Fast Response", icon: Clock, color: "#A855F7", desc: "<15 min avg reply" },
  { label: "Certified Repair", icon: Shield, color: "#06B6D4", desc: "Apple authorized" },
];

const DevIcon = (t: string) => t === "tablet" ? Tablet : t === "laptop" ? Laptop : Smartphone;

const TAB_LABELS = ["Overview", "Services", "Portfolio", "Reviews"];

export default function PublicProfile() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div style={{ maxWidth: 900, padding: "0 24px 40px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #141414 0%, #111111 60%, #130E08 100%)",
        border: "1px solid rgba(255,107,0,0.1)",
        borderRadius: 18, padding: "28px 28px 24px",
        marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: 40,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 22,
              background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "#fff",
              boxShadow: "0 0 32px rgba(255,107,0,0.4)",
            }}>AK</div>
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 22, height: 22, borderRadius: "50%",
              background: "#22C55E", border: "3px solid #141414",
              boxShadow: "0 0 10px rgba(34,197,94,0.5)",
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h1 style={{ color: "#F0F0F0", margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Alex Kim</h1>
                  <BadgeCheck size={20} color="#3B82F6" fill="rgba(59,130,246,0.2)" />
                </div>
                <div style={{ color: "#FF6B00", fontSize: 13, fontWeight: 600, marginTop: 2 }}>Pro Technician · Apple Device Specialist</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#606060", fontSize: 12 }}>
                  <MapPin size={12} /> San Francisco Bay Area, CA
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 28, marginTop: 18, flexWrap: "wrap" }}>
              {[
                { label: "Rating", value: "4.9", icon: Star, color: "#F59E0B", suffix: "/5.0" },
                { label: "Reviews", value: "214", icon: ThumbsUp, color: "#3B82F6", suffix: "" },
                { label: "Completed", value: "203", icon: CheckCircle2, color: "#22C55E", suffix: " jobs" },
                { label: "Response", value: "<15m", icon: Clock, color: "#A855F7", suffix: "" },
              ].map(({ label, value, icon: Icon, color, suffix }) => (
                <div key={label}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <Icon size={12} color={color} fill={label === "Rating" ? color : "none"} />
                    <span style={{ color: "#606060", fontSize: 11 }}>{label}</span>
                  </div>
                  <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700 }}>
                    {value}<span style={{ fontSize: 12, color: "#808080", fontWeight: 400 }}>{suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
              border: "none", borderRadius: 11, padding: "11px 22px",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 0 20px rgba(255,107,0,0.35)",
              transition: "box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(255,107,0,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(255,107,0,0.35)"; }}
            >
              <MessageSquare size={14} /> Message Me
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 11, padding: "10px 22px",
              color: "#C0C0C0", fontSize: 13, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              <ExternalLink size={13} /> View Live Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stories */}
      <Stories />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
        {TAB_LABELS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 18px",
            color: activeTab === tab ? "#FF6B00" : "#606060",
            fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
            borderBottom: `2px solid ${activeTab === tab ? "#FF6B00" : "transparent"}`,
            marginBottom: -1, transition: "all 0.15s",
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* About */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, gridColumn: "1 / -1" }}>
            <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>About</div>
            <p style={{ color: "#909090", fontSize: 13, lineHeight: 1.75, margin: 0 }}>
              Apple-certified technician with 8+ years of experience specializing in iPhone, iPad, MacBook, and Apple Watch repairs.
              I run a professional home workshop with all the proper tools — hot air stations, ultrasonic cleaners, microscope, and genuine Apple parts sourced directly from authorized suppliers.
              <br /><br />
              Every repair comes with a 90-day warranty and I provide transparent communication throughout the entire process. My goal is to get your device working like new, every single time.
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Trust & Credentials</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BADGES.map(badge => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: `${badge.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={15} color={badge.color} />
                    </div>
                    <div>
                      <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600 }}>{badge.label}</div>
                      <div style={{ color: "#606060", fontSize: 11 }}>{badge.desc}</div>
                    </div>
                    <CheckCircle2 size={14} color={badge.color} style={{ marginLeft: "auto" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specializations */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Specializations</div>
            {[
              { device: "iPhone", desc: "All models from iPhone 6 to 15 Pro Max", icon: Smartphone, jobs: 112 },
              { device: "MacBook", desc: "Air, Pro, M1/M2/M3 chip models", icon: Laptop, jobs: 67 },
              { device: "iPad", desc: "All iPad models including Pro", icon: Tablet, jobs: 24 },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.device} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color="#FF6B00" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{s.device}</div>
                    <div style={{ color: "#606060", fontSize: 11 }}>{s.desc}</div>
                  </div>
                  <div style={{ color: "#505050", fontSize: 11 }}>{s.jobs} jobs</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Services" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {SERVICES.map(svc => (
            <div key={svc.name} style={{
              background: "#111111", border: `1px solid ${svc.popular ? "rgba(255,107,0,0.2)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 14, padding: 18, position: "relative",
              boxShadow: svc.popular ? "0 0 16px rgba(255,107,0,0.08)" : "none",
            }}>
              {svc.popular && (
                <span style={{
                  position: "absolute", top: -10, right: 14,
                  background: "#FF6B00", color: "#fff",
                  fontSize: 9, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 20, letterSpacing: "0.05em",
                }}>POPULAR</span>
              )}
              <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{svc.name}</div>
              <div style={{ color: "#606060", fontSize: 12, marginBottom: 12 }}>{svc.devices}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#FF6B00", fontSize: 16, fontWeight: 800 }}>{svc.price}</div>
                  <div style={{ color: "#505050", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={10} /> {svc.time}
                  </div>
                </div>
                <button style={{
                  background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                  borderRadius: 8, padding: "6px 12px", color: "#FF6B00", fontSize: 12, fontWeight: 600,
                  cursor: "pointer",
                }}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Portfolio" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PORTFOLIO.map((item, i) => {
            const Icon = DevIcon(item.device);
            return (
              <div key={i} style={{
                background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden", cursor: "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,107,0,0.25)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(255,107,0,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  height: 120, background: "#1A1A1A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={40} color="#2A2A2A" />
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: "#606060", fontSize: 12, marginBottom: 10 }}>{item.result}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={11} color={si < item.stars ? "#F59E0B" : "#2A2A2A"} fill={si < item.stars ? "#F59E0B" : "none"} />
                      ))}
                    </div>
                    <span style={{ color: "#505050", fontSize: 11 }}>{item.client}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "Reviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Rating summary */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, display: "flex", gap: 32, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#F59E0B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>4.9</div>
              <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 6 }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
              </div>
              <div style={{ color: "#606060", fontSize: 12, marginTop: 4 }}>214 reviews</div>
            </div>
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const pct = star === 5 ? 87 : star === 4 ? 10 : star === 3 ? 2 : star === 2 ? 1 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span style={{ color: "#606060", fontSize: 11, width: 10 }}>{star}</span>
                    <Star size={10} color="#F59E0B" fill="#F59E0B" />
                    <div style={{ flex: 1, height: 4, background: "#1E1E1E", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#F59E0B", borderRadius: 2 }} />
                    </div>
                    <span style={{ color: "#606060", fontSize: 11, width: 26 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: `hsl(${i * 60 + 10},55%,35%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{r.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 700 }}>{r.client}</span>
                    {r.verified && (
                      <span style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20 }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={11} color={si < r.rating ? "#F59E0B" : "#2A2A2A"} fill={si < r.rating ? "#F59E0B" : "none"} />
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#505050", fontSize: 11 }}>{r.date}</div>
                  <div style={{ color: "#707070", fontSize: 11, marginTop: 2 }}>{r.device}</div>
                </div>
              </div>
              <p style={{ color: "#909090", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
