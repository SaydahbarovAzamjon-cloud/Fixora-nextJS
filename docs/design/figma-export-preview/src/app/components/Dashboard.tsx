import { useState, type ReactNode, type CSSProperties } from "react";
import {
  TrendingUp, Inbox, Briefcase, DollarSign, Star,
  Clock, ChevronRight, Wrench, Smartphone, Tablet, Laptop,
  CheckCircle2, AlertCircle, ArrowUpRight, Play, Calendar,
  Zap, MoreHorizontal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import type { Page } from "./Sidebar";

const earningsData = [
  { day: "Mon", earnings: 320, jobs: 3 },
  { day: "Tue", earnings: 480, jobs: 5 },
  { day: "Wed", earnings: 240, jobs: 2 },
  { day: "Thu", earnings: 620, jobs: 6 },
  { day: "Fri", earnings: 780, jobs: 8 },
  { day: "Sat", earnings: 540, jobs: 5 },
  { day: "Sun", earnings: 160, jobs: 2 },
];

const incomingRequests = [
  { id: "REQ-1042", client: "Sarah M.", device: "iPhone 15 Pro", issue: "Cracked screen replacement", time: "12 min ago", urgency: "high", budget: "$180" },
  { id: "REQ-1041", client: "James T.", device: "MacBook Pro 14\"", issue: "Battery replacement + fan noise", time: "34 min ago", urgency: "medium", budget: "$280" },
  { id: "REQ-1040", client: "Priya K.", device: "iPad Air 5", issue: "Charging port not working", time: "1h ago", urgency: "low", budget: "$120" },
  { id: "REQ-1039", client: "Marcus L.", device: "Apple Watch Ultra", issue: "Screen repair", time: "2h ago", urgency: "medium", budget: "$220" },
];

const activeJobs = [
  { id: "JOB-882", client: "Daniel W.", device: "iPhone 14 Plus", issue: "Water damage recovery", status: "in_progress", progress: 65, dueTime: "Today 5PM" },
  { id: "JOB-881", client: "Anna S.", device: "MacBook Air M2", issue: "Logic board repair", status: "diagnosing", progress: 30, dueTime: "Tomorrow 2PM" },
  { id: "JOB-880", client: "Tom H.", device: "iPhone 13 mini", issue: "Battery + Camera", status: "parts_ordered", progress: 45, dueTime: "Jun 16, 11AM" },
];

const schedule = [
  { time: "9:00 AM", client: "Emily R.", task: "iPhone 15 screen pickup", type: "pickup", done: true },
  { time: "11:00 AM", client: "Jake P.", task: "MacBook diagnosis session", type: "diagnosis", done: true },
  { time: "2:00 PM", client: "Daniel W.", task: "Water damage check-in call", type: "call", done: false },
  { time: "4:30 PM", client: "Lisa M.", task: "iPad Air handover", type: "handover", done: false },
  { time: "6:00 PM", client: "", task: "Daily review & report", type: "admin", done: false },
];

const reviews = [
  { client: "Sarah Johnson", rating: 5, text: "Alex fixed my iPhone screen in under an hour. Absolutely professional and the quality is perfect. Highly recommend!", device: "iPhone 14 Pro", date: "Jun 14" },
  { client: "Michael Chen", rating: 5, text: "Fast, reliable, and affordable. My MacBook is running like new again. Will definitely come back.", device: "MacBook Pro", date: "Jun 12" },
  { client: "Emma Davis", rating: 4, text: "Great service overall. Took slightly longer than expected but the repair quality was excellent.", device: "iPad Pro", date: "Jun 10" },
];

const quickActions = [
  { label: "New Quote", icon: Zap, color: "#FF6B00", glow: "rgba(255,107,0,0.3)" },
  { label: "Mark Available", icon: CheckCircle2, color: "#22C55E", glow: "rgba(34,197,94,0.25)" },
  { label: "View Schedule", icon: Calendar, color: "#3B82F6", glow: "rgba(59,130,246,0.25)" },
  { label: "Export Report", icon: ArrowUpRight, color: "#A855F7", glow: "rgba(168,85,247,0.25)" },
];

const STATS = [
  { label: "Total Requests", value: "24", change: "+6", positive: true, icon: Inbox, color: "#FF6B00", bg: "rgba(255,107,0,0.1)" },
  { label: "Active Jobs", value: "7", change: "+2", positive: true, icon: Briefcase, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { label: "This Week", value: "$3,240", change: "+18%", positive: true, icon: DollarSign, color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  { label: "Avg Rating", value: "4.9", change: "+0.2", positive: true, icon: Star, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
];

const urgencyColor = (u: string) =>
  u === "high" ? { color: "#EF4444", bg: "rgba(239,68,68,0.12)" }
  : u === "medium" ? { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" }
  : { color: "#22C55E", bg: "rgba(34,197,94,0.12)" };

const statusInfo = (s: string) =>
  s === "in_progress" ? { label: "In Progress", color: "#FF6B00", bg: "rgba(255,107,0,0.12)" }
  : s === "diagnosing" ? { label: "Diagnosing", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" }
  : { label: "Parts Ordered", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" };

const scheduleTypeColor = (t: string) =>
  t === "pickup" ? "#FF6B00"
  : t === "diagnosis" ? "#3B82F6"
  : t === "call" ? "#22C55E"
  : t === "handover" ? "#A855F7"
  : "#606060";

const deviceIcon = (device: string) => {
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("watch")) return Smartphone;
  if (device.toLowerCase().includes("ipad")) return Tablet;
  return Laptop;
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const Card = ({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{
    background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, ...style,
  }}>{children}</div>
);

const CardHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
    <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>{title}</span>
    {action}
  </div>
);

const ViewAllBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer",
    color: "#FF6B00", fontSize: 12, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 2,
  }}>View all <ChevronRight size={12} /></button>
);

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome */}
      <div style={{
        background: "linear-gradient(135deg, #161616 0%, #111111 50%, #141008 100%)",
        border: "1px solid rgba(255,107,0,0.12)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: 80,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div>
          <div style={{ color: "#707070", fontSize: 13, marginBottom: 4 }}>Monday, June 15, 2026</div>
          <h2 style={{ color: "#F0F0F0", margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Good morning, Alex 👋
          </h2>
          <p style={{ color: "#808080", margin: "6px 0 0", fontSize: 13 }}>
            You have <span style={{ color: "#FF6B00", fontWeight: 600 }}>4 new requests</span> and <span style={{ color: "#22C55E", fontWeight: 600 }}>7 active jobs</span> today.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {quickActions.map(({ label, icon: Icon, color, glow }) => (
            <button
              key={label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "#161616", border: `1px solid ${color}30`,
                borderRadius: 12, padding: "12px 16px",
                cursor: "pointer", color, fontSize: 11, fontWeight: 600,
                transition: "all 0.2s ease",
                minWidth: 80,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${glow}`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}60`;
                (e.currentTarget as HTMLButtonElement).style.background = `${color}12`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}30`;
                (e.currentTarget as HTMLButtonElement).style.background = "#161616";
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map(({ label, value, change, positive, icon: Icon, color, bg }) => (
          <Card key={label} style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#707070", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{label}</div>
                <div style={{ color: "#F0F0F0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={11} color={positive ? "#22C55E" : "#EF4444"} />
                  <span style={{ color: positive ? "#22C55E" : "#EF4444", fontSize: 12, fontWeight: 600 }}>{change}</span>
                  <span style={{ color: "#505050", fontSize: 11 }}>vs last week</span>
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: bg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color={color} strokeWidth={1.8} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Incoming Requests */}
        <Card>
          <CardHeader title="Incoming Requests" action={<ViewAllBtn onClick={() => onNavigate("requests")} />} />
          <div style={{ padding: "12px 16px" }}>
            {incomingRequests.map((req, i) => {
              const ug = urgencyColor(req.urgency);
              const DevIcon = deviceIcon(req.device);
              return (
                <div
                  key={req.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 4px",
                    borderBottom: i < incomingRequests.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    cursor: "pointer",
                    borderRadius: 8,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <DevIcon size={16} color="#808080" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{req.client}</span>
                      <span style={{
                        background: ug.bg, color: ug.color,
                        fontSize: 9, fontWeight: 700, padding: "1px 7px",
                        borderRadius: 20, letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}>{req.urgency}</span>
                    </div>
                    <div style={{ color: "#606060", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {req.device} • {req.issue}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700 }}>{req.budget}</div>
                    <div style={{ color: "#505050", fontSize: 11, marginTop: 2 }}>{req.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader title="Active Jobs" action={<ViewAllBtn onClick={() => onNavigate("jobs")} />} />
          <div style={{ padding: "12px 16px" }}>
            {activeJobs.map((job, i) => {
              const s = statusInfo(job.status);
              const DevIcon = deviceIcon(job.device);
              const isHovered = hoveredJob === job.id;
              return (
                <div
                  key={job.id}
                  onMouseEnter={() => setHoveredJob(job.id)}
                  onMouseLeave={() => setHoveredJob(null)}
                  style={{
                    padding: "14px",
                    borderRadius: 10,
                    background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                    border: isHovered ? "1px solid rgba(255,107,0,0.15)" : "1px solid transparent",
                    marginBottom: i < activeJobs.length - 1 ? 8 : 0,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <DevIcon size={15} color="#808080" />
                      </div>
                      <div>
                        <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{job.client}</div>
                        <div style={{ color: "#606060", fontSize: 12 }}>{job.device}</div>
                      </div>
                    </div>
                    <span style={{
                      background: s.bg, color: s.color,
                      fontSize: 10, fontWeight: 700, padding: "3px 9px",
                      borderRadius: 20,
                    }}>{s.label}</span>
                  </div>
                  <div style={{ color: "#707070", fontSize: 12, marginBottom: 8 }}>{job.issue}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 5, background: "#1E1E1E", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        className="prog-bar"
                        style={{
                          "--prog-w": `${job.progress}%`,
                          boxShadow: "0 0 8px rgba(255,107,0,0.5)",
                        } as React.CSSProperties}
                      />
                    </div>
                    <span style={{ color: "#FF9A3C", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{job.progress}%</span>
                    <span style={{ color: "#505050", fontSize: 11, flexShrink: 0 }}>Due: {job.dueTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom grid: chart + schedule + reviews */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Earnings chart */}
        <Card>
          <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Weekly Earnings</div>
              <div style={{ color: "#FF6B00", fontSize: 24, fontWeight: 700, marginTop: 4, letterSpacing: "-0.03em" }}>$3,240</div>
              <div style={{ color: "#22C55E", fontSize: 12, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <TrendingUp size={11} /> +18% vs last week
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Week", "Month", "Year"].map((p, i) => (
                <button key={p} style={{
                  background: i === 0 ? "rgba(255,107,0,0.15)" : "transparent",
                  border: `1px solid ${i === 0 ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 600,
                  color: i === 0 ? "#FF6B00" : "#606060", cursor: "pointer",
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 12px 12px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="dg0" offset="0%"   stopColor="#FF9A3C" stopOpacity={0.35} />
                    <stop key="dg1" offset="60%"  stopColor="#FF6B00" stopOpacity={0.08} />
                    <stop key="dg2" offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                  labelStyle={{ color: "#A0A0A0", fontSize: 11 }}
                  itemStyle={{ color: "#FF9A3C", fontSize: 13, fontWeight: 600 }}
                  formatter={(v: number) => [`$${v}`, "Earnings"]}
                  cursor={{ stroke: "rgba(255,107,0,0.15)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone" dataKey="earnings"
                  stroke="#FF6B00" strokeWidth={2.5}
                  fill="url(#earningsGrad)" dot={false}
                  activeDot={{ fill: "#FF9A3C", r: 5, strokeWidth: 0 }}
                  isAnimationActive animationDuration={1400} animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader title="Today's Schedule" />
          <div style={{ padding: "12px 16px" }}>
            {schedule.map((item, i) => {
              const tc = scheduleTypeColor(item.type);
              return (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: i < schedule.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  opacity: item.done ? 0.45 : 1,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: item.done ? "#404040" : tc,
                      boxShadow: item.done ? "none" : `0 0 6px ${tc}`,
                      marginTop: 3, flexShrink: 0,
                    }} />
                    {i < schedule.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", minHeight: 20, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#707070", fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{item.time}</div>
                    <div style={{ color: item.done ? "#606060" : "#E0E0E0", fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{item.task}</div>
                    {item.client && <div style={{ color: "#505050", fontSize: 11, marginTop: 1 }}>{item.client}</div>}
                  </div>
                  {item.done && <CheckCircle2 size={13} color="#404040" style={{ flexShrink: 0, marginTop: 2 }} />}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader title="Recent Reviews" action={<ViewAllBtn onClick={() => onNavigate("profile")} />} />
        <div style={{ padding: "12px 16px 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{
              background: "#161616", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: `hsl(${i * 80 + 20},60%,35%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{r.client[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600 }}>{r.client}</div>
                  <div style={{ color: "#606060", fontSize: 11 }}>{r.device}</div>
                </div>
                <div style={{ color: "#505050", fontSize: 11 }}>{r.date}</div>
              </div>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={12} color={si < r.rating ? "#F59E0B" : "#2A2A2A"} fill={si < r.rating ? "#F59E0B" : "none"} />
                ))}
              </div>
              <p style={{ color: "#808080", fontSize: 12, lineHeight: 1.5, margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
