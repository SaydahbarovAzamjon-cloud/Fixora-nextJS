import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Star, Briefcase, Clock, Zap, Users, Award } from "lucide-react";

const PERIOD_TABS = ["7 Days", "30 Days", "3 Months", "Year"];

const jobsData = [
  { day: "Mon", completed: 3, declined: 1, revenue: 420 },
  { day: "Tue", completed: 5, declined: 0, revenue: 680 },
  { day: "Wed", completed: 2, declined: 2, revenue: 240 },
  { day: "Thu", completed: 6, declined: 1, revenue: 870 },
  { day: "Fri", completed: 8, declined: 0, revenue: 1140 },
  { day: "Sat", completed: 5, declined: 1, revenue: 720 },
  { day: "Sun", completed: 2, declined: 0, revenue: 310 },
];

const monthlyData = [
  { month: "Jan", revenue: 8200, jobs: 34 },
  { month: "Feb", revenue: 9400, jobs: 41 },
  { month: "Mar", revenue: 7800, jobs: 29 },
  { month: "Apr", revenue: 11200, jobs: 48 },
  { month: "May", revenue: 13600, jobs: 57 },
  { month: "Jun", revenue: 12100, jobs: 52 },
];

const deviceData = [
  { name: "iPhone", value: 54, color: "#FF6B00" },
  { name: "MacBook", value: 28, color: "#3B82F6" },
  { name: "iPad", value: 12, color: "#22C55E" },
  { name: "Apple Watch", value: 6, color: "#A855F7" },
];

const repairTypeData = [
  { name: "Screen", jobs: 42, revenue: 6300 },
  { name: "Battery", jobs: 31, revenue: 2790 },
  { name: "Water", jobs: 14, revenue: 4200 },
  { name: "Camera", jobs: 18, revenue: 2880 },
  { name: "Logic", jobs: 9, revenue: 5400 },
  { name: "Charging", jobs: 23, revenue: 1840 },
];

const ratingTrend = [
  { week: "W1", rating: 4.7 },
  { week: "W2", rating: 4.8 },
  { week: "W3", rating: 4.8 },
  { week: "W4", rating: 4.9 },
  { week: "W5", rating: 4.9 },
  { week: "W6", rating: 5.0 },
  { week: "W7", rating: 4.9 },
];

const topClients = [
  { name: "Sarah Mitchell", jobs: 4, revenue: "$640", rating: 5 },
  { name: "Daniel Wagner", jobs: 3, revenue: "$890", rating: 5 },
  { name: "James Park", jobs: 3, revenue: "$720", rating: 5 },
  { name: "Lily Chen", jobs: 2, revenue: "$760", rating: 4 },
  { name: "Anna Schulz", jobs: 2, revenue: "$1,360", rating: 5 },
];

const STATS = [
  { label: "Total Jobs", value: "137", change: "+12%", up: true, icon: Briefcase, color: "#FF6B00" },
  { label: "Completion Rate", value: "94%", change: "+3%", up: true, icon: Zap, color: "#22C55E" },
  { label: "Avg Response", value: "11m", change: "-4m", up: true, icon: Clock, color: "#3B82F6" },
  { label: "Repeat Clients", value: "38%", change: "+6%", up: true, icon: Users, color: "#A855F7" },
  { label: "Avg Rating", value: "4.9", change: "+0.1", up: true, icon: Star, color: "#F59E0B" },
  { label: "Top Performer", value: "Top 3%", change: "↑ rank", up: true, icon: Award, color: "#06B6D4" },
];

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
    <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>{title}</span>
    {sub && <span style={{ color: "#505050", fontSize: 11 }}>{sub}</span>}
  </div>
);

const tooltipStyle = {
  contentStyle: { background: "#1A1A1A", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  labelStyle: { color: "#A0A0A0", fontSize: 11 },
  cursor: { stroke: "rgba(255,107,0,0.15)", strokeWidth: 1 },
};

export default function Analytics() {
  const [period, setPeriod] = useState("7 Days");

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Period selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700 }}>Performance Analytics</div>
          <div style={{ color: "#606060", fontSize: 13, marginTop: 3 }}>Track your repair business metrics and trends</div>
        </div>
        <div style={{ display: "flex", gap: 6, background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 4 }}>
          {PERIOD_TABS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
              background: period === p ? "linear-gradient(135deg, #FF6B00, #FF9A3C)" : "transparent",
              color: period === p ? "#fff" : "#606060",
              fontSize: 12, fontWeight: period === p ? 700 : 400,
              boxShadow: period === p ? "0 0 12px rgba(255,107,0,0.35)" : "none",
              transition: "all 0.15s",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {STATS.map(({ label, value, change, up, icon: Icon, color }) => (
          <Card key={label} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={color} strokeWidth={1.8} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {up ? <TrendingUp size={10} color="#22C55E" /> : <TrendingDown size={10} color="#EF4444" />}
                <span style={{ color: up ? "#22C55E" : "#EF4444", fontSize: 10, fontWeight: 600 }}>{change}</span>
              </div>
            </div>
            <div style={{ color: "#F0F0F0", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
            <div style={{ color: "#606060", fontSize: 11, marginTop: 5 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Jobs + Revenue area chart */}
        <Card>
          <SectionLabel title="Jobs Completed vs Revenue" sub={period} />
          <div style={{ padding: "16px 12px 12px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={jobsData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="rv0" offset="0%"   stopColor="#FF6B00" stopOpacity={0.3} />
                    <stop key="rv1" offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="jg0" offset="0%"   stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop key="jg1" offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ fill: "#FF6B00", r: 4, strokeWidth: 0 }} isAnimationActive animationDuration={1200} name="Revenue ($)" />
                <Area yAxisId="right" type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} fill="url(#jobGrad)" dot={false} activeDot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }} isAnimationActive animationDuration={1400} name="Jobs" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, paddingLeft: 8 }}>
              {[{ color: "#FF6B00", label: "Revenue" }, { color: "#3B82F6", label: "Jobs Completed" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 20, height: 2, background: l.color, borderRadius: 1 }} />
                  <span style={{ color: "#606060", fontSize: 11 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Device breakdown donut */}
        <Card>
          <SectionLabel title="Repairs by Device" />
          <div style={{ padding: "12px 16px 16px" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {deviceData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {deviceData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ color: "#A0A0A0", fontSize: 12, flex: 1 }}>{d.name}</span>
                  <div style={{ flex: 1, height: 5, background: "#1E1E1E", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${d.value}%`, borderRadius: 3,
                      background: d.color,
                      boxShadow: `0 0 8px ${d.color}80`,
                      animation: "progressIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
                    }} />
                  </div>
                  <span style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 700, width: 32, textAlign: "right" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Repair type bar chart */}
        <Card style={{ gridColumn: "1 / 3" }}>
          <SectionLabel title="Revenue by Repair Type" />
          <div style={{ padding: "12px 12px 12px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={repairTypeData} barSize={32} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#404040" tick={{ fontSize: 12, fill: "#808080" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}
                  isAnimationActive animationDuration={900} animationEasing="ease-out">
                  {repairTypeData.map((_, i) => {
                    const colors = ["#FF6B00","#FF9A3C","#3B82F6","#22C55E","#A855F7","#F59E0B"];
                    return <Cell key={`bar-${i}`} fill={colors[i]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rating trend */}
        <Card>
          <SectionLabel title="Rating Trend" />
          <div style={{ padding: "12px 12px 12px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, paddingLeft: 4, marginBottom: 12 }}>
              <span style={{ color: "#F59E0B", fontSize: 28, fontWeight: 800 }}>4.9</span>
              <span style={{ color: "#606060", fontSize: 12 }}>avg this period</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={ratingTrend}>
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="rt0" offset="0%"   stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop key="rt1" offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" stroke="#404040" tick={{ fontSize: 10, fill: "#505050" }} axisLine={false} tickLine={false} />
                <YAxis domain={[4.5, 5.0]} stroke="#404040" tick={{ fontSize: 10, fill: "#505050" }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toFixed(1), "Rating"]} />
                <Area type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={2} fill="url(#ratingGrad)" dot={false} activeDot={{ fill: "#F59E0B", r: 4, strokeWidth: 0 }} isAnimationActive animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top clients */}
      <Card>
        <SectionLabel title="Top Clients" sub="By lifetime revenue" />
        <div style={{ padding: "12px 20px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {topClients.map((c, i) => (
              <div key={c.name} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: i === 0 ? "linear-gradient(135deg, #FF6B00, #FF9A3C)" : "#1E1E1E",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: i === 0 ? "#fff" : "#808080", flexShrink: 0,
                  }}>{c.name[0]}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name.split(" ")[0]}</div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={9} color={si < c.rating ? "#F59E0B" : "#2A2A2A"} fill={si < c.rating ? "#F59E0B" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ color: "#FF6B00", fontSize: 15, fontWeight: 800 }}>{c.revenue}</div>
                <div style={{ color: "#505050", fontSize: 11, marginTop: 2 }}>{c.jobs} jobs</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
