import { useState } from "react";
import {
  User, Lock, Bell, CreditCard, Calendar, Sliders, Trash2,
  ChevronRight, Camera, Eye, EyeOff, Plus, X, Check,
  Smartphone, Mail, Shield, Key, Globe, Moon
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "account", label: "Account", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "preferences", label: "Preferences", icon: Globe },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ color: "#F0F0F0", fontSize: 16, fontWeight: 700 }}>{title}</div>
    {desc && <div style={{ color: "#606060", fontSize: 13, marginTop: 4 }}>{desc}</div>}
  </div>
);

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", color: "#909090", fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: "0.04em" }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%", background: "#1A1A1A",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "10px 14px",
      color: "#E0E0E0", fontSize: 13, outline: "none",
      transition: "border-color 0.15s",
    }}
    onFocus={e => { e.target.style.borderColor = "rgba(255,107,0,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.08)"; }}
    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
  />
);

const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none",
        background: on ? "linear-gradient(90deg, #FF6B00, #FF9A3C)" : "#2A2A2A", cursor: "pointer",
        position: "relative", transition: "background 0.2s",
        boxShadow: on ? "0 0 12px rgba(255,107,0,0.4)" : "none",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
    {label && <span style={{ color: "#C0C0C0", fontSize: 13 }}>{label}</span>}
  </div>
);

const SaveBtn = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 7,
      background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
      border: "none", borderRadius: 10, padding: "10px 22px",
      color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
      boxShadow: "0 0 18px rgba(255,107,0,0.3)",
      transition: "box-shadow 0.2s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(255,107,0,0.5)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 18px rgba(255,107,0,0.3)"; }}
  >
    <Check size={14} /> Save Changes
  </button>
);

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPw, setShowPw] = useState(false);
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  const [notifs, setNotifs] = useState({
    newRequests: true, messages: true, payments: true, reviews: true,
    jobUpdates: true, marketing: false, weeklyReport: true,
  });
  const [profile, setProfile] = useState({
    name: "Alex Kim", email: "alex.kim@fixora.io", phone: "+1 (415) 555-0192",
    bio: "Apple-certified technician with 8+ years of experience specializing in iPhone, iPad, MacBook, and Apple Watch repairs.",
    location: "San Francisco Bay Area, CA",
    website: "alexkim.fixora.io",
  });

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Settings sidebar */}
      <div style={{
        width: 220, flexShrink: 0, background: "#0D0D0D",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "16px 10px",
        overflowY: "auto",
      }}>
        {SIDEBAR_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 12px", borderRadius: 9, marginBottom: 2,
                background: active ? "rgba(255,107,0,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(255,107,0,0.2)" : "transparent"}`,
                color: active ? "#FF6B00" : "#707070",
                fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
                textAlign: "left", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 12, paddingTop: 12 }}>
          <button
            onClick={() => setActiveSection("danger")}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 9,
              background: activeSection === "danger" ? "rgba(239,68,68,0.1)" : "transparent",
              border: "transparent", color: "#EF4444", fontSize: 13, fontWeight: 500,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Account
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0A0A0A" }}>
        <div style={{ padding: "28px 32px", maxWidth: 680 }}>

          {/* Profile */}
          {activeSection === "profile" && (
            <div>
              <SectionTitle title="Profile Settings" desc="Your public technician profile on FIXORA" />

              {/* Avatar */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 18,
                    background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 800, color: "#fff",
                  }}>AK</div>
                  <button style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 24, height: 24, borderRadius: "50%", border: "2px solid #0A0A0A",
                    background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <Camera size={11} color="#fff" />
                  </button>
                </div>
                <div>
                  <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600 }}>Profile Photo</div>
                  <div style={{ color: "#606060", fontSize: 12, marginTop: 4 }}>JPG, PNG or GIF. Max 5MB.</div>
                  <button style={{ marginTop: 10, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 8, padding: "6px 14px", color: "#FF6B00", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Upload Photo</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="FULL NAME">
                  <Input value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                </FormField>
                <FormField label="LOCATION">
                  <Input value={profile.location} onChange={v => setProfile(p => ({ ...p, location: v }))} />
                </FormField>
                <FormField label="EMAIL">
                  <Input value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
                </FormField>
                <FormField label="PHONE">
                  <Input value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
                </FormField>
                <FormField label="PROFILE URL">
                  <Input value={profile.website} onChange={v => setProfile(p => ({ ...p, website: v }))} />
                </FormField>
              </div>
              <FormField label="BIO">
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  style={{
                    width: "100%", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "10px 14px", color: "#E0E0E0", fontSize: 13,
                    outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(255,107,0,0.4)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </FormField>
              <SaveBtn />
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div>
              <SectionTitle title="Notifications" desc="Choose what you get notified about" />
              {[
                { key: "newRequests", label: "New Repair Requests", desc: "Get notified when a client sends a new request" },
                { key: "messages", label: "New Messages", desc: "Notifications for incoming client messages" },
                { key: "payments", label: "Payment Received", desc: "Alerts when a client completes payment" },
                { key: "reviews", label: "New Reviews", desc: "Be notified when clients leave a review" },
                { key: "jobUpdates", label: "Job Status Updates", desc: "Parts arrived, due date reminders" },
                { key: "weeklyReport", label: "Weekly Earnings Report", desc: "Summary of your weekly performance" },
                { key: "marketing", label: "Tips & Promotions", desc: "FIXORA tips, feature updates, and promos" },
              ].map(item => (
                <div key={item.key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div>
                    <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: "#606060", fontSize: 12, marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onChange={v => setNotifs(n => ({ ...n, [item.key]: v }))} />
                </div>
              ))}
              <div style={{ marginTop: 20 }}><SaveBtn /></div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div>
              <SectionTitle title="Security" desc="Manage your password and authentication" />
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Change Password</div>
                <FormField label="CURRENT PASSWORD">
                  <div style={{ position: "relative" }}>
                    <Input value="" onChange={() => {}} type={showPw ? "text" : "password"} placeholder="••••••••••" />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#505050" }}
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </FormField>
                <FormField label="NEW PASSWORD">
                  <Input value="" onChange={() => {}} type="password" placeholder="Min 8 characters" />
                </FormField>
                <FormField label="CONFIRM NEW PASSWORD">
                  <Input value="" onChange={() => {}} type="password" placeholder="Repeat new password" />
                </FormField>
                <SaveBtn />
              </div>

              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Two-Factor Authentication</div>
                {[
                  { icon: Smartphone, label: "Authenticator App", desc: "Use Google Authenticator or similar", active: true },
                  { icon: Mail, label: "Email Verification", desc: "Send code to alex.kim@fixora.io", active: false },
                  { icon: Key, label: "SMS Code", desc: "Send code to +1 (415) 555-0192", active: false },
                ].map(method => {
                  const Icon = method.icon;
                  return (
                    <div key={method.label} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: method.active ? "rgba(255,107,0,0.12)" : "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={15} color={method.active ? "#FF6B00" : "#606060"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{method.label}</div>
                        <div style={{ color: "#606060", fontSize: 12 }}>{method.desc}</div>
                      </div>
                      <Toggle on={method.active} onChange={() => {}} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability */}
          {activeSection === "availability" && (
            <div>
              <SectionTitle title="Availability" desc="Set your working schedule for client bookings" />
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Working Days</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setAvailability(a => ({ ...a, [day]: !a[day] }))}
                      style={{
                        flex: 1, padding: "10px 4px", borderRadius: 10, border: "none",
                        background: availability[day] ? "rgba(255,107,0,0.14)" : "#1A1A1A",
                        color: availability[day] ? "#FF6B00" : "#606060",
                        fontSize: 12, fontWeight: availability[day] ? 700 : 400,
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: availability[day] ? "0 0 10px rgba(255,107,0,0.2)" : "none",
                      }}
                    >{day}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 18 }}>
                  <div style={{ color: "#909090", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>START TIME</div>
                  <select style={{ width: "100%", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#E0E0E0", fontSize: 13, outline: "none" }}>
                    {HOURS.map(h => <option key={h} style={{ background: "#1A1A1A" }}>{h}</option>)}
                  </select>
                </div>
                <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 18 }}>
                  <div style={{ color: "#909090", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>END TIME</div>
                  <select defaultValue="6:00 PM" style={{ width: "100%", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#E0E0E0", fontSize: 13, outline: "none" }}>
                    {HOURS.map(h => <option key={h} style={{ background: "#1A1A1A" }}>{h}</option>)}
                  </select>
                </div>
              </div>
              <SaveBtn />
            </div>
          )}

          {/* Payment */}
          {activeSection === "payment" && (
            <div>
              <SectionTitle title="Payment Methods" desc="Manage how you receive earnings" />
              <div style={{ marginBottom: 16 }}>
                {[
                  { type: "Bank Account", last4: "4821", name: "Chase Business Checking", primary: true },
                  { type: "PayPal", last4: "", name: "alex.kim@fixora.io", primary: false },
                ].map((method, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "center",
                    background: "#111111", border: `1px solid ${method.primary ? "rgba(255,107,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 12, padding: "16px 18px", marginBottom: 10,
                  }}>
                    <div style={{ width: 42, height: 28, background: "#1E1E1E", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CreditCard size={16} color="#606060" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{method.type}</span>
                        {method.primary && <span style={{ background: "rgba(255,107,0,0.12)", color: "#FF6B00", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>PRIMARY</span>}
                      </div>
                      <div style={{ color: "#606060", fontSize: 12 }}>{method.name} {method.last4 && `••${method.last4}`}</div>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#505050" }}><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,107,0,0.08)", border: "1px dashed rgba(255,107,0,0.3)",
                borderRadius: 12, padding: "14px 20px", width: "100%",
                color: "#FF6B00", fontSize: 13, fontWeight: 600, cursor: "pointer",
                justifyContent: "center",
              }}>
                <Plus size={15} /> Add Payment Method
              </button>
            </div>
          )}

          {/* Preferences */}
          {activeSection === "preferences" && (
            <div>
              <SectionTitle title="Preferences" desc="Customize your FIXORA experience" />
              {[
                { label: "Dark Mode", desc: "Always use dark theme", icon: Moon, on: true },
                { label: "Show Earnings Publicly", desc: "Display earnings range on your profile", icon: Shield, on: false },
                { label: "Auto-Accept Requests", desc: "Automatically accept requests within budget range", icon: Check, on: false },
                { label: "Distance Radius Alerts", desc: "Only notify for requests within 20 miles", icon: Globe, on: true },
              ].map(pref => {
                const Icon = pref.icon;
                return (
                  <div key={pref.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={15} color="#707070" />
                      </div>
                      <div>
                        <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{pref.label}</div>
                        <div style={{ color: "#606060", fontSize: 12 }}>{pref.desc}</div>
                      </div>
                    </div>
                    <Toggle on={pref.on} onChange={() => {}} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Danger zone */}
          {activeSection === "danger" && (
            <div>
              <SectionTitle title="Delete Account" desc="Permanently remove your FIXORA account and all data" />
              <div style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 14, padding: 24,
              }}>
                <div style={{ color: "#EF4444", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>⚠ Danger Zone</div>
                <p style={{ color: "#909090", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Deleting your account is permanent and cannot be undone. All of your profile data, job history, reviews, and earnings records will be permanently erased.
                  Active jobs and pending payments must be resolved before deletion.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#909090", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 7 }}>TYPE "DELETE MY ACCOUNT" TO CONFIRM</label>
                  <input
                    placeholder="DELETE MY ACCOUNT"
                    style={{
                      width: "100%", background: "#1A1A1A", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 10, padding: "10px 14px", color: "#E0E0E0", fontSize: 13, outline: "none",
                    }}
                  />
                </div>
                <button style={{
                  background: "transparent", border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 10, padding: "11px 24px",
                  color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Trash2 size={14} /> Permanently Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === "account" && (
            <div>
              <SectionTitle title="Account Settings" desc="Manage your account details and status" />
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <FormField label="USERNAME / PROFILE URL">
                  <div style={{ display: "flex", alignItems: "center", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                    <span style={{ padding: "10px 12px", color: "#505050", fontSize: 13, borderRight: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>fixora.io/tech/</span>
                    <input defaultValue="alex-kim" style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "10px 12px", color: "#E0E0E0", fontSize: 13 }} />
                  </div>
                </FormField>
                <FormField label="ACCOUNT TYPE">
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Pro Technician", "Enterprise"].map((type, i) => (
                      <div key={type} style={{
                        flex: 1, padding: 14, borderRadius: 10,
                        background: i === 0 ? "rgba(255,107,0,0.1)" : "#1A1A1A",
                        border: `1px solid ${i === 0 ? "rgba(255,107,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                        cursor: "pointer",
                      }}>
                        <div style={{ color: i === 0 ? "#FF6B00" : "#707070", fontSize: 13, fontWeight: 700 }}>{type}</div>
                        <div style={{ color: "#606060", fontSize: 11, marginTop: 2 }}>{i === 0 ? "Your current plan" : "Team features"}</div>
                      </div>
                    ))}
                  </div>
                </FormField>
                <SaveBtn />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
