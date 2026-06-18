import { useState } from "react";
import {
  TrendingUp, Inbox, Briefcase, DollarSign, Star,
  Clock, ChevronRight, Smartphone, Tablet, Laptop,
  CheckCircle2, ArrowUpRight, Calendar, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { Page } from "../../libs/components/technician/TechnicianSidebar";
import s from "../../scss/pc/technician/technician-dashboard.module.scss";

// ─── Data ─────────────────────────────────────────────────────────────────────
const earningsData = [
  { day: "Mon", earnings: 320 }, { day: "Tue", earnings: 480 },
  { day: "Wed", earnings: 240 }, { day: "Thu", earnings: 620 },
  { day: "Fri", earnings: 780 }, { day: "Sat", earnings: 540 },
  { day: "Sun", earnings: 160 },
];

const incomingRequests = [
  { id: "REQ-1042", client: "Sarah M.",  device: "iPhone 15 Pro",    issue: "Cracked screen replacement",   time: "12 min ago", urgency: "high",   budget: "$180" },
  { id: "REQ-1041", client: "James T.",  device: "MacBook Pro 14\"", issue: "Battery replacement + fan noise", time: "34 min ago", urgency: "medium", budget: "$280" },
  { id: "REQ-1040", client: "Priya K.",  device: "iPad Air 5",       issue: "Charging port not working",    time: "1h ago",     urgency: "low",    budget: "$120" },
  { id: "REQ-1039", client: "Marcus L.", device: "Apple Watch Ultra", issue: "Screen repair",                time: "2h ago",     urgency: "medium", budget: "$220" },
];

const activeJobs = [
  { id: "JOB-882", client: "Daniel W.", device: "iPhone 14 Plus", issue: "Water damage recovery", status: "in_progress",   progress: 65, dueTime: "Today 5PM" },
  { id: "JOB-881", client: "Anna S.",   device: "MacBook Air M2", issue: "Logic board repair",    status: "diagnosing",    progress: 30, dueTime: "Tomorrow 2PM" },
  { id: "JOB-880", client: "Tom H.",    device: "iPhone 13 mini", issue: "Battery + Camera",      status: "parts_ordered", progress: 45, dueTime: "Jun 16, 11AM" },
];

const schedule = [
  { time: "9:00 AM",  client: "Emily R.",  task: "iPhone 15 screen pickup",       type: "pickup",    done: true  },
  { time: "11:00 AM", client: "Jake P.",   task: "MacBook diagnosis session",      type: "diagnosis", done: true  },
  { time: "2:00 PM",  client: "Daniel W.", task: "Water damage check-in call",     type: "call",      done: false },
  { time: "4:30 PM",  client: "Lisa M.",   task: "iPad Air handover",              type: "handover",  done: false },
  { time: "6:00 PM",  client: "",          task: "Daily review & report",          type: "admin",     done: false },
];

const reviews = [
  { client: "Sarah Johnson", rating: 5, text: "Alex fixed my iPhone screen in under an hour. Absolutely professional and the quality is perfect. Highly recommend!", device: "iPhone 14 Pro", date: "Jun 14" },
  { client: "Michael Chen",  rating: 5, text: "Fast, reliable, and affordable. My MacBook is running like new again. Will definitely come back.", device: "MacBook Pro", date: "Jun 12" },
  { client: "Emma Davis",    rating: 4, text: "Great service overall. Took slightly longer than expected but the repair quality was excellent.", device: "iPad Pro", date: "Jun 10" },
];

const STATS = [
  { label: "Total Requests", value: "24", change: "+6",   positive: true, icon: Inbox,     color: "#FF6B00", bg: "rgba(255,107,0,0.1)"  },
  { label: "Active Jobs",    value: "7",  change: "+2",   positive: true, icon: Briefcase, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { label: "This Week",      value: "$3,240", change: "+18%", positive: true, icon: DollarSign, color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  { label: "Avg Rating",     value: "4.9", change: "+0.2", positive: true, icon: Star,     color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
];

const QUICK_ACTIONS = [
  { label: "New Quote",     icon: Zap,          color: "#FF6B00", glow: "rgba(255,107,0,0.3)"    },
  { label: "Mark Available",icon: CheckCircle2, color: "#22C55E", glow: "rgba(34,197,94,0.25)"  },
  { label: "View Schedule", icon: Calendar,     color: "#3B82F6", glow: "rgba(59,130,246,0.25)" },
  { label: "Export Report", icon: ArrowUpRight, color: "#A855F7", glow: "rgba(168,85,247,0.25)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deviceIcon = (device: string) => {
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("watch")) return Smartphone;
  if (device.toLowerCase().includes("ipad")) return Tablet;
  return Laptop;
};

const scheduleTypeColor = (t: string) =>
  t === "pickup" ? "#FF6B00" : t === "diagnosis" ? "#3B82F6"
  : t === "call" ? "#22C55E" : t === "handover" ? "#A855F7" : "#606060";

const urgencyKey = (u: string) =>
  u === "high" ? "high" : u === "medium" ? "medium" : "low";

const tooltipStyle = {
  contentStyle: { background: "#1A1A1A", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  labelStyle:   { color: "#A0A0A0", fontSize: 11 },
  itemStyle:    { color: "#FF9A3C", fontSize: 13, fontWeight: 600 },
};

// ─── Component ────────────────────────────────────────────────────────────────
interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  return (
    <div className={s["ftd__page"]}>

      {/* Welcome banner */}
      <div className={s["ftd__welcome"]}>
        <div className={s["ftd__welcome__glow"]} />
        <div>
          <div className={s["ftd__welcome__date"]}>Monday, June 15, 2026</div>
          <h2 className={s["ftd__welcome__title"]}>Good morning, Alex 👋</h2>
          <p className={s["ftd__welcome__subtitle"]}>
            You have{" "}
            <span className={s["ftd__welcome__highlight--orange"]}>4 new requests</span>{" "}
            and{" "}
            <span className={s["ftd__welcome__highlight--green"]}>7 active jobs</span>{" "}
            today.
          </p>
        </div>
        <div className={s["ftd__welcome__actions"]}>
          {QUICK_ACTIONS.map(({ label, icon: Icon, color, glow }) => (
            <button
              key={label}
              className={s["ftd__quick-action"]}
              style={{ color, borderColor: `${color}30` }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.boxShadow = `0 0 20px ${glow}`;
                el.style.borderColor = `${color}60`;
                el.style.background = `${color}12`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.boxShadow = "none";
                el.style.borderColor = `${color}30`;
                el.style.background = "#161616";
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className={s["ftd__stats"]}>
        {STATS.map(({ label, value, change, positive, icon: Icon, color, bg }) => (
          <div key={label} className={s["ftd__stat-card"]}>
            <div className={s["ftd__stat-card__inner"]}>
              <div>
                <div className={s["ftd__stat-card__label"]}>{label}</div>
                <div className={s["ftd__stat-card__value"]}>{value}</div>
                <div className={s["ftd__stat-card__change"]}>
                  <TrendingUp size={11} color={positive ? "#22C55E" : "#EF4444"} />
                  <span className={s[`ftd__stat-card__change__value--${positive ? "positive" : "negative"}`]}>{change}</span>
                  <span className={s["ftd__stat-card__change__period"]}>vs last week</span>
                </div>
              </div>
              <div className={s["ftd__stat-card__icon"]} style={{ background: bg }}>
                <Icon size={18} color={color} strokeWidth={1.8} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className={s["ftd__main-grid"]}>

        {/* Incoming Requests */}
        <div className={s["ftd__card"]}>
          <div className={s["ftd__card__header"]}>
            <span className={s["ftd__card__title"]}>Incoming Requests</span>
            <button className={s["ftd__card__view-all"]} onClick={() => onNavigate("requests")}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className={s["ftd__request-list"]}>
            {incomingRequests.map((req) => {
              const DevIcon = deviceIcon(req.device);
              return (
                <div key={req.id} className={s["ftd__request-item"]}>
                  <div className={s["ftd__request-item__icon"]}>
                    <DevIcon size={16} color="#808080" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span className={s["ftd__request-item__client"]}>{req.client}</span>
                      <span className={s[`ftd__urgency-badge--${urgencyKey(req.urgency)}`]}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className={s["ftd__request-item__device"]}>{req.device} • {req.issue}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className={s["ftd__request-item__budget"]}>{req.budget}</div>
                    <div className={s["ftd__request-item__time"]}>{req.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Jobs */}
        <div className={s["ftd__card"]}>
          <div className={s["ftd__card__header"]}>
            <span className={s["ftd__card__title"]}>Active Jobs</span>
            <button className={s["ftd__card__view-all"]} onClick={() => onNavigate("jobs")}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className={s["ftd__job-list"]}>
            {activeJobs.map((job) => {
              const DevIcon = deviceIcon(job.device);
              const isHovered = hoveredJob === job.id;
              return (
                <div
                  key={job.id}
                  className={s["ftd__job-item"]}
                  style={{
                    background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                    borderColor: isHovered ? "rgba(255,107,0,0.15)" : "transparent",
                  }}
                  onMouseEnter={() => setHoveredJob(job.id)}
                  onMouseLeave={() => setHoveredJob(null)}
                >
                  <div className={s["ftd__job-item__header"]}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div className={s["ftd__job-item__device-icon"]}>
                        <DevIcon size={15} color="#808080" />
                      </div>
                      <div>
                        <div className={s["ftd__job-item__client"]}>{job.client}</div>
                        <div className={s["ftd__job-item__device"]}>{job.device}</div>
                      </div>
                    </div>
                    <span className={s[`ftd__status-badge--${job.status}`]}>
                      {job.status === "in_progress" ? "In Progress" : job.status === "diagnosing" ? "Diagnosing" : "Parts Ordered"}
                    </span>
                  </div>
                  <div className={s["ftd__job-item__issue"]}>{job.issue}</div>
                  <div className={s["ftd__progress-track"]}>
                    <div className={s["ftd__progress-rail"]}>
                      <div
                        className={s["ftd__prog-bar"]}
                        style={{ "--prog-w": `${job.progress}%` } as React.CSSProperties}
                      />
                    </div>
                    <span className={s["ftd__progress-pct"]}>{job.progress}%</span>
                    <span className={s["ftd__progress-due"]}>Due: {job.dueTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className={s["ftd__bottom-row"]}>

        {/* Earnings chart */}
        <div className={s["ftd__card"]}>
          <div className={s["ftd__chart-header"]}>
            <div>
              <div className={s["ftd__chart-title"]}>Weekly Earnings</div>
              <div className={s["ftd__chart-value"]}>$3,240</div>
              <div className={s["ftd__chart-trend"]}>
                <TrendingUp size={11} /> +18% vs last week
              </div>
            </div>
            <div className={s["ftd__period-tabs"]}>
              {["Week", "Month", "Year"].map((p, i) => (
                <button key={p} className={s[i === 0 ? "ftd__period-tab--active" : "ftd__period-tab"]}>{p}</button>
              ))}
            </div>
          </div>
          <div className={s["ftd__chart-body"]}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v}`, "Earnings"]} cursor={{ stroke: "rgba(255,107,0,0.15)", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="earnings" stroke="#FF6B00" strokeWidth={2.5} fill="rgba(255,107,0,0.12)" dot={false} activeDot={{ fill: "#FF9A3C", r: 5, strokeWidth: 0 }} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className={s["ftd__card"]}>
          <div className={s["ftd__card__header"]}>
            <span className={s["ftd__card__title"]}>Today's Schedule</span>
          </div>
          <div className={s["ftd__schedule-body"]}>
            {schedule.map((item, i) => {
              const tc = scheduleTypeColor(item.type);
              return (
                <div key={i} className={[s["ftd__schedule-item"], item.done ? s["ftd__schedule-item--done"] : ""].join(" ")}>
                  <div className={s["ftd__schedule-item__timeline"]}>
                    <div
                      className={s["ftd__schedule-item__dot"]}
                      style={{
                        background: item.done ? "#404040" : tc,
                        boxShadow: item.done ? "none" : `0 0 6px ${tc}`,
                      }}
                    />
                    {i < schedule.length - 1 && <div className={s["ftd__schedule-item__line"]} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={s["ftd__schedule-item__time"]}>{item.time}</div>
                    <div
                      className={s["ftd__schedule-item__task"]}
                      style={{ color: item.done ? "#606060" : "#E0E0E0" }}
                    >{item.task}</div>
                    {item.client && <div className={s["ftd__schedule-item__client"]}>{item.client}</div>}
                  </div>
                  {item.done && <CheckCircle2 size={13} color="#404040" style={{ flexShrink: 0, marginTop: 2 }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className={s["ftd__card"]}>
        <div className={s["ftd__card__header"]}>
          <span className={s["ftd__card__title"]}>Recent Reviews</span>
          <button className={s["ftd__card__view-all"]} onClick={() => onNavigate("profile")}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className={s["ftd__reviews-grid"]}>
          {reviews.map((r, i) => (
            <div key={i} className={s["ftd__review-card"]}>
              <div className={s["ftd__review-card__header"]}>
                <div
                  className={s["ftd__review-card__avatar"]}
                  style={{ background: `hsl(${i * 80 + 20},60%,35%)` }}
                >
                  {r.client[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={s["ftd__review-card__client"]}>{r.client}</div>
                  <div className={s["ftd__review-card__device"]}>{r.device}</div>
                </div>
                <div className={s["ftd__review-card__date"]}>{r.date}</div>
              </div>
              <div className={s["ftd__stars"]}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={12} color={si < r.rating ? "#F59E0B" : "#2A2A2A"} fill={si < r.rating ? "#F59E0B" : "none"} />
                ))}
              </div>
              <p className={s["ftd__review-card__text"]}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
