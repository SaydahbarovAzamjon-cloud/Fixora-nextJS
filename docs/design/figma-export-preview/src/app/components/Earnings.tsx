import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  DollarSign, TrendingUp, CreditCard, Clock, CheckCircle2,
  ArrowDownToLine, ChevronRight, Banknote, Wallet, AlertCircle
} from "lucide-react";

const PERIOD_TABS = ["This Week", "This Month", "Last 3 Mo", "This Year"];

const weeklyEarnings = [
  { day: "Mon", earned: 320, pending: 80 },
  { day: "Tue", earned: 480, pending: 120 },
  { day: "Wed", earned: 240, pending: 0 },
  { day: "Thu", earned: 620, pending: 200 },
  { day: "Fri", earned: 780, pending: 150 },
  { day: "Sat", earned: 540, pending: 100 },
  { day: "Sun", earned: 160, pending: 0 },
];

const monthlyPayout = [
  { month: "Jan", payout: 7200 },
  { month: "Feb", payout: 8600 },
  { month: "Mar", payout: 6900 },
  { month: "Apr", payout: 10400 },
  { month: "May", payout: 12800 },
  { month: "Jun", payout: 11200 },
];

const TRANSACTIONS = [
  { id: "PAY-0291", client: "Lily Chen", job: "JOB-879 — iPad Pro Screen", amount: "$380", date: "Jun 15, 10:30 AM", status: "paid", method: "Card" },
  { id: "PAY-0290", client: "Tom Harrington", job: "JOB-880 — iPhone 13 Battery", amount: "$240", date: "Jun 13, 2:15 PM", status: "paid", method: "Apple Pay" },
  { id: "PAY-0289", client: "Anna Schulz", job: "JOB-881 — MacBook Logic Board", amount: "$680", date: "Jun 14, 9:00 AM", status: "pending", method: "Card" },
  { id: "PAY-0288", client: "Daniel Wagner", job: "JOB-882 — iPhone Water Damage", amount: "$320", date: "Jun 13, 11:00 AM", status: "pending", method: "Bank" },
  { id: "PAY-0287", client: "Ryan Park", job: "JOB-878 — MacBook Keyboard", amount: "$450", date: "Jun 15, 8:30 AM", status: "pending", method: "Card" },
  { id: "PAY-0286", client: "Sarah Mitchell", job: "REQ-1042 — iPhone 15 Screen", amount: "$180", date: "Jun 12, 4:00 PM", status: "processing", method: "Apple Pay" },
  { id: "PAY-0285", client: "James Torres", job: "REQ-1041 — MacBook Battery", amount: "$280", date: "Jun 11, 1:30 PM", status: "paid", method: "Bank" },
  { id: "PAY-0284", client: "Priya Kapoor", job: "REQ-1040 — iPad Charging Port", amount: "$120", date: "Jun 10, 3:45 PM", status: "paid", method: "Card" },
];

const PAYOUTS = [
  { id: "WD-088", amount: "$3,240", date: "Jun 14, 2026", status: "completed", method: "Chase ••4821", days: "1 day" },
  { id: "WD-087", amount: "$2,890", date: "Jun 7, 2026", status: "completed", method: "Chase ••4821", days: "1 day" },
  { id: "WD-086", amount: "$4,120", date: "May 31, 2026", status: "completed", method: "Chase ••4821", days: "2 days" },
  { id: "WD-085", amount: "$3,670", date: "May 24, 2026", status: "completed", method: "Chase ••4821", days: "1 day" },
];

const statusStyle = (s: string) =>
  s === "paid" ? { color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Paid" }
  : s === "pending" ? { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Pending" }
  : { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", label: "Processing" };

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, ...style }}>
    {children}
  </div>
);

const tooltipStyle = {
  contentStyle: { background: "#1A1A1A", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  labelStyle: { color: "#A0A0A0", fontSize: 11 },
  cursor: { stroke: "rgba(255,107,0,0.1)", strokeWidth: 1 },
};

export default function Earnings() {
  const [period, setPeriod] = useState("This Week");
  const [txFilter, setTxFilter] = useState("All");

  const totalEarned = weeklyEarnings.reduce((s, d) => s + d.earned, 0);
  const totalPending = weeklyEarnings.reduce((s, d) => s + d.pending, 0);

  const filteredTx = TRANSACTIONS.filter(t =>
    txFilter === "All" ? true : t.status === txFilter.toLowerCase()
  );

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700 }}>Earnings & Payouts</div>
          <div style={{ color: "#606060", fontSize: 13, marginTop: 3 }}>Track income, pending payments and payout history</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", gap: 4, background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 4 }}>
            {PERIOD_TABS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                background: period === p ? "linear-gradient(135deg, #FF6B00, #FF9A3C)" : "transparent",
                color: period === p ? "#fff" : "#606060",
                fontSize: 11, fontWeight: period === p ? 700 : 400,
                boxShadow: period === p ? "0 0 12px rgba(255,107,0,0.3)" : "none",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}>{p}</button>
            ))}
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            border: "none", borderRadius: 9, padding: "8px 16px",
            color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 16px rgba(255,107,0,0.35)",
          }}>
            <ArrowDownToLine size={13} /> Request Payout
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, sub: "+18% vs last week", icon: DollarSign, color: "#FF6B00", subColor: "#22C55E" },
          { label: "Pending", value: `$${totalPending.toLocaleString()}`, sub: "5 jobs awaiting payment", icon: Clock, color: "#F59E0B", subColor: "#F59E0B" },
          { label: "Next Payout", value: "$1,630", sub: "Est. Jun 21, 2026", icon: Banknote, color: "#22C55E", subColor: "#606060" },
          { label: "This Month", value: "$11,200", sub: "+22% vs May", icon: TrendingUp, color: "#3B82F6", subColor: "#22C55E" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#707070", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ color: "#F0F0F0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: s.subColor, fontSize: 11, marginTop: 7 }}>{s.sub}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={s.color} strokeWidth={1.8} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        {/* Earnings area chart */}
        <Card>
          <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Daily Earnings</div>
              <div style={{ color: "#FF6B00", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>${totalEarned.toLocaleString()}</div>
              <div style={{ color: "#22C55E", fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                <TrendingUp size={10} /> +18% vs last week
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              {[{ color: "#FF6B00", label: "Earned" }, { color: "#F59E0B", label: "Pending" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                  <span style={{ color: "#606060", fontSize: 11 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "14px 12px 12px" }}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weeklyEarnings}>
                <defs>
                  <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="eg0" offset="0%"   stopColor="#FF6B00" stopOpacity={0.3} />
                    <stop key="eg1" offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="pg0" offset="0%"   stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop key="pg1" offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [`$${v}`, n === "earned" ? "Earned" : "Pending"]} />
                <Area type="monotone" dataKey="earned" stroke="#FF6B00" strokeWidth={2.5} fill="url(#earnedGrad)" dot={false} activeDot={{ fill: "#FF6B00", r: 5, strokeWidth: 0 }} isAnimationActive animationDuration={1200} />
                <Area type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={1.5} fill="url(#pendingGrad)" dot={false} activeDot={{ fill: "#F59E0B", r: 4, strokeWidth: 0 }} isAnimationActive animationDuration={1400} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly payout bars */}
        <Card>
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Monthly Payouts</div>
            <div style={{ color: "#3B82F6", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>$60,100</div>
            <div style={{ color: "#606060", fontSize: 11, marginTop: 2 }}>Jan — Jun 2026</div>
          </div>
          <div style={{ padding: "12px 12px 12px" }}>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthlyPayout} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#404040" tick={{ fontSize: 12, fill: "#808080" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#404040" tick={{ fontSize: 11, fill: "#606060" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Payout"]} />
                <Bar dataKey="payout" radius={[6, 6, 0, 0]}
                  isAnimationActive animationDuration={900} animationEasing="ease-out">
                  {monthlyPayout.map((_, i) => {
                    const n = monthlyPayout.length;
                    const color = i === n - 1 ? "#3B82F6" : i === n - 2 ? "#FF6B00" : "#6366F1";
                    return <Cell key={`mp-${i}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Transactions + Payout history */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        {/* Transactions */}
        <Card>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Transactions</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "Paid", "Pending", "Processing"].map(f => (
                <button key={f} onClick={() => setTxFilter(f)} style={{
                  background: txFilter === f ? "rgba(255,107,0,0.14)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${txFilter === f ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 20, padding: "3px 10px",
                  color: txFilter === f ? "#FF6B00" : "#606060",
                  fontSize: 11, fontWeight: txFilter === f ? 700 : 400, cursor: "pointer",
                  transition: "all 0.15s",
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            {filteredTx.map((tx, i) => {
              const st = statusStyle(tx.status);
              return (
                <div key={tx.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 4px",
                  borderBottom: i < filteredTx.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  cursor: "pointer",
                  borderRadius: 8, transition: "background 0.12s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CreditCard size={15} color="#606060" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600 }}>{tx.client}</div>
                    <div style={{ color: "#505050", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.job}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 700 }}>{tx.amount}</div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 20, letterSpacing: "0.05em" }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Payout history */}
        <Card>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Payout History</span>
            <span style={{ color: "#FF6B00", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>See all</span>
          </div>

          {/* Balance card */}
          <div style={{ margin: "0 16px 14px", padding: 16, background: "linear-gradient(135deg, #1A1008 0%, #161616 100%)", border: "1px solid rgba(255,107,0,0.15)", borderRadius: 12 }}>
            <div style={{ color: "#808080", fontSize: 11, marginBottom: 6 }}>Available Balance</div>
            <div style={{ color: "#FF6B00", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>$1,630</div>
            <div style={{ color: "#606060", fontSize: 11, marginTop: 4 }}>Next auto-payout: Jun 21</div>
            <button style={{
              marginTop: 12, display: "flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
              border: "none", borderRadius: 8, padding: "8px 16px",
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 0 14px rgba(255,107,0,0.35)",
            }}>
              <ArrowDownToLine size={12} /> Withdraw Now
            </button>
          </div>

          <div style={{ padding: "0 16px 16px" }}>
            {PAYOUTS.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 4px",
                borderBottom: i < PAYOUTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={14} color="#22C55E" />
                  </div>
                  <div>
                    <div style={{ color: "#E0E0E0", fontSize: 12, fontWeight: 600 }}>{p.amount}</div>
                    <div style={{ color: "#505050", fontSize: 10 }}>{p.method} · {p.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#22C55E", fontSize: 10, fontWeight: 700 }}>Completed</div>
                  <div style={{ color: "#505050", fontSize: 10 }}>{p.days}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
