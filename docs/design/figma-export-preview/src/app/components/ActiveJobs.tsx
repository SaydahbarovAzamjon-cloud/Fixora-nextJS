import { useState } from "react";
import {
  Smartphone, Laptop, Tablet, Clock, ChevronRight,
  CheckCircle2, Circle, Package, Wrench, Phone, AlertCircle, MoreHorizontal,
  Calendar, DollarSign, User, ArrowRight
} from "lucide-react";

const STATUS_TABS = [
  { id: "all", label: "All Jobs", count: 7 },
  { id: "diagnosing", label: "Diagnosing", count: 2 },
  { id: "in_progress", label: "In Progress", count: 3 },
  { id: "parts_ordered", label: "Parts Ordered", count: 1 },
  { id: "ready", label: "Ready for Pickup", count: 1 },
];

const JOBS = [
  {
    id: "JOB-882", client: "Daniel Wagner", avatar: "DW",
    device: "iPhone 14 Plus", deviceType: "phone",
    issue: "Water damage recovery", status: "in_progress",
    progress: 65, started: "Jun 13", due: "Jun 15, 5PM",
    price: "$320", paid: false,
    timeline: [
      { step: "Received & Logged", done: true, time: "Jun 13, 9:00 AM" },
      { step: "Initial Diagnosis", done: true, time: "Jun 13, 11:30 AM" },
      { step: "Parts Ordered", done: true, time: "Jun 13, 2:00 PM" },
      { step: "Repair In Progress", done: true, time: "Jun 14, 10:00 AM" },
      { step: "Quality Testing", done: false, time: "" },
      { step: "Ready for Pickup", done: false, time: "" },
    ],
  },
  {
    id: "JOB-881", client: "Anna Schulz", avatar: "AS",
    device: "MacBook Air M2", deviceType: "laptop",
    issue: "Logic board repair", status: "diagnosing",
    progress: 30, started: "Jun 14", due: "Jun 16, 2PM",
    price: "$680", paid: false,
    timeline: [
      { step: "Received & Logged", done: true, time: "Jun 14, 8:30 AM" },
      { step: "Initial Diagnosis", done: true, time: "Jun 14, 10:00 AM" },
      { step: "Parts Ordered", done: false, time: "" },
      { step: "Repair In Progress", done: false, time: "" },
      { step: "Quality Testing", done: false, time: "" },
      { step: "Ready for Pickup", done: false, time: "" },
    ],
  },
  {
    id: "JOB-880", client: "Tom Harrington", avatar: "TH",
    device: "iPhone 13 mini", deviceType: "phone",
    issue: "Battery + Camera module", status: "parts_ordered",
    progress: 45, started: "Jun 12", due: "Jun 16, 11AM",
    price: "$240", paid: true,
    timeline: [
      { step: "Received & Logged", done: true, time: "Jun 12, 2:00 PM" },
      { step: "Initial Diagnosis", done: true, time: "Jun 12, 4:30 PM" },
      { step: "Parts Ordered", done: true, time: "Jun 13, 9:00 AM" },
      { step: "Repair In Progress", done: false, time: "" },
      { step: "Quality Testing", done: false, time: "" },
      { step: "Ready for Pickup", done: false, time: "" },
    ],
  },
  {
    id: "JOB-879", client: "Lily Chen", avatar: "LC",
    device: "iPad Pro 12.9\"", deviceType: "tablet",
    issue: "Cracked screen replacement", status: "ready",
    progress: 100, started: "Jun 11", due: "Jun 15, 12PM",
    price: "$380", paid: true,
    timeline: [
      { step: "Received & Logged", done: true, time: "Jun 11, 10:00 AM" },
      { step: "Initial Diagnosis", done: true, time: "Jun 11, 11:00 AM" },
      { step: "Parts Ordered", done: true, time: "Jun 11, 12:00 PM" },
      { step: "Repair In Progress", done: true, time: "Jun 14, 9:00 AM" },
      { step: "Quality Testing", done: true, time: "Jun 14, 2:00 PM" },
      { step: "Ready for Pickup", done: true, time: "Jun 15, 10:00 AM" },
    ],
  },
  {
    id: "JOB-878", client: "Ryan Park", avatar: "RP",
    device: "MacBook Pro 16\"", deviceType: "laptop",
    issue: "Keyboard + trackpad replacement", status: "diagnosing",
    progress: 20, started: "Jun 15", due: "Jun 17, 3PM",
    price: "$450", paid: false,
    timeline: [
      { step: "Received & Logged", done: true, time: "Jun 15, 8:00 AM" },
      { step: "Initial Diagnosis", done: false, time: "" },
      { step: "Parts Ordered", done: false, time: "" },
      { step: "Repair In Progress", done: false, time: "" },
      { step: "Quality Testing", done: false, time: "" },
      { step: "Ready for Pickup", done: false, time: "" },
    ],
  },
];

const statusStyle = (s: string) =>
  s === "in_progress" ? { color: "#FF6B00", bg: "rgba(255,107,0,0.12)", label: "In Progress" }
  : s === "diagnosing" ? { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "Diagnosing" }
  : s === "parts_ordered" ? { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Parts Ordered" }
  : s === "ready" ? { color: "#22C55E", bg: "rgba(34,197,94,0.12)", label: "Ready for Pickup" }
  : { color: "#808080", bg: "rgba(128,128,128,0.12)", label: s };

const DevIcon = (t: string) => t === "tablet" ? Tablet : t === "laptop" ? Laptop : Smartphone;

const NEXT_STEPS: Record<string, string> = {
  diagnosing: "Mark Diagnosis Complete",
  in_progress: "Mark Repair Complete",
  parts_ordered: "Mark Parts Received",
  ready: "Mark as Picked Up",
};

export default function ActiveJobs() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);

  const filtered = activeTab === "all" ? JOBS : JOBS.filter(j => j.status === activeTab);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Left panel */}
      <div style={{
        width: 360, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        background: "#0D0D0D",
      }}>
        {/* Tabs */}
        <div style={{ padding: "14px 14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 14 }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: activeTab === tab.id ? "rgba(255,107,0,0.14)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${activeTab === tab.id ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 20, padding: "4px 10px",
                  color: activeTab === tab.id ? "#FF6B00" : "#707070",
                  fontSize: 11, fontWeight: activeTab === tab.id ? 700 : 400, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? "#FF6B00" : "#2A2A2A",
                  color: activeTab === tab.id ? "#fff" : "#606060",
                  borderRadius: 20, fontSize: 10, fontWeight: 700,
                  padding: "0px 5px", lineHeight: "15px",
                }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {filtered.map(job => {
            const s = statusStyle(job.status);
            const Icon = DevIcon(job.deviceType);
            const isSelected = selectedJob.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                style={{
                  padding: "14px", borderRadius: 12, marginBottom: 8, cursor: "pointer",
                  background: isSelected ? "rgba(255,107,0,0.07)" : "transparent",
                  border: `1px solid ${isSelected ? "rgba(255,107,0,0.22)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.15s",
                  boxShadow: isSelected ? "0 0 14px rgba(255,107,0,0.08)" : "none",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="#707070" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{job.client}</span>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, fontSize: 9, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.05em" }}>{s.label}</span>
                    </div>
                    <div style={{ color: "#707070", fontSize: 12, marginTop: 2 }}>{job.device}</div>
                  </div>
                </div>
                <div style={{ color: "#606060", fontSize: 12, marginBottom: 10 }}>{job.issue}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 5, background: "#1E1E1E", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      className={job.status === "ready" ? "prog-bar-green" : "prog-bar"}
                      style={{ "--prog-w": `${job.progress}%`, boxShadow: job.status === "ready" ? "0 0 8px rgba(34,197,94,0.45)" : "0 0 8px rgba(255,107,0,0.45)" } as React.CSSProperties}
                    />
                  </div>
                  <span style={{ color: job.status === "ready" ? "#22C55E" : "#FF9A3C", fontSize: 11, fontWeight: 700 }}>{job.progress}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700 }}>{job.price}</span>
                  <span style={{ color: "#505050", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={10} /> {job.due}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right detail */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0A0A0A" }}>
        <div style={{ padding: "24px", maxWidth: 720 }}>
          {/* Header */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#606060", fontSize: 12, marginBottom: 4 }}>{selectedJob.id} • Started {selectedJob.started}</div>
              <h2 style={{ color: "#F0F0F0", margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{selectedJob.issue}</h2>
              <div style={{ color: "#808080", fontSize: 13, marginTop: 4 }}>{selectedJob.device}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(() => {
                const s = statusStyle(selectedJob.status);
                return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>{s.label}</span>;
              })()}
            </div>
          </div>

          {/* Info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "CLIENT", value: selectedJob.client, sub: "Verified Customer", icon: User, color: "#3B82F6" },
              { label: "PRICE", value: selectedJob.price, sub: selectedJob.paid ? "✓ Paid" : "Pending payment", icon: DollarSign, color: "#22C55E" },
              { label: "DUE DATE", value: selectedJob.due, sub: "Estimated completion", icon: Calendar, color: "#F59E0B" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={15} color={item.color} />
                    </div>
                    <div>
                      <div style={{ color: "#505050", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 700 }}>{item.value}</div>
                      <div style={{ color: item.label === "PRICE" && selectedJob.paid ? "#22C55E" : "#606060", fontSize: 11, marginTop: 2 }}>{item.sub}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repair timeline */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 18 }}>
            <div style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>Repair Timeline</div>
            {selectedJob.timeline.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < selectedJob.timeline.length - 1 ? 0 : 0 }}>
                {/* Line + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: step.done ? "rgba(255,107,0,0.15)" : "#1A1A1A",
                    border: `2px solid ${step.done ? "#FF6B00" : "#2A2A2A"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: step.done ? "0 0 8px rgba(255,107,0,0.35)" : "none",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    {step.done
                      ? <CheckCircle2 size={12} color="#FF6B00" strokeWidth={2.5} />
                      : <Circle size={10} color="#2A2A2A" />
                    }
                  </div>
                  {i < selectedJob.timeline.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: step.done ? "rgba(255,107,0,0.25)" : "#1E1E1E", minHeight: 24, margin: "2px 0" }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: i < selectedJob.timeline.length - 1 ? 16 : 0 }}>
                  <div style={{ color: step.done ? "#E0E0E0" : "#505050", fontSize: 13, fontWeight: step.done ? 600 : 400 }}>{step.step}</div>
                  {step.time && <div style={{ color: "#505050", fontSize: 11, marginTop: 2 }}>{step.time}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Status action */}
          {selectedJob.status !== "ready" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                flex: 1, padding: "14px", borderRadius: 12,
                background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 0 24px rgba(255,107,0,0.35)",
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 36px rgba(255,107,0,0.55)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(255,107,0,0.35)"; }}
              >
                <ArrowRight size={16} />
                {NEXT_STEPS[selectedJob.status]}
              </button>
              <button style={{
                padding: "14px 18px", borderRadius: 12,
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "#808080", cursor: "pointer",
              }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}
          {selectedJob.status === "ready" && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <CheckCircle2 size={18} color="#22C55E" />
              <span style={{ color: "#22C55E", fontWeight: 600, fontSize: 14 }}>Repair Complete — Ready for Customer Pickup</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
