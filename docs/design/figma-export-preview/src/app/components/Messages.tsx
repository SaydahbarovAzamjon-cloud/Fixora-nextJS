import { useState, useRef, useEffect } from "react";
import { Search, Send, Phone, Video, MoreHorizontal, Paperclip, Smile, CheckCheck, Smartphone, Image, X } from "lucide-react";

const CONVERSATIONS = [
  {
    id: "c1", client: "Sarah Mitchell", avatar: "SM", jobId: "REQ-1042",
    device: "iPhone 15 Pro Max", lastMsg: "Yes, I can bring it in tomorrow morning around 9am",
    time: "2m", unread: 2, online: true,
  },
  {
    id: "c2", client: "Daniel Wagner", avatar: "DW", jobId: "JOB-882",
    device: "iPhone 14 Plus", lastMsg: "Is my phone ready? Any updates on the repair?",
    time: "15m", unread: 1, online: true,
  },
  {
    id: "c3", client: "Anna Schulz", avatar: "AS", jobId: "JOB-881",
    device: "MacBook Air M2", lastMsg: "Thanks for the update! I'll wait for your message.",
    time: "1h", unread: 0, online: false,
  },
  {
    id: "c4", client: "Tom Harrington", avatar: "TH", jobId: "JOB-880",
    device: "iPhone 13 mini", lastMsg: "The parts have arrived. Repair will start tomorrow.",
    time: "3h", unread: 0, online: false,
  },
  {
    id: "c5", client: "Lily Chen", avatar: "LC", jobId: "JOB-879",
    device: "iPad Pro 12.9\"", lastMsg: "Your iPad is ready for pickup! Come anytime.",
    time: "5h", unread: 0, online: false,
  },
];

const MESSAGES: Record<string, { from: "tech" | "client"; text: string; time: string; read?: boolean }[]> = {
  c1: [
    { from: "client", text: "Hi! I have an iPhone 15 Pro Max with a badly cracked screen. Can you fix it?", time: "10:12 AM" },
    { from: "tech", text: "Hey Sarah! Yes, absolutely. We handle iPhone 15 Pro Max screen replacements. We use genuine OLED displays.", time: "10:15 AM", read: true },
    { from: "client", text: "Great! How long would it take and what's the price?", time: "10:16 AM" },
    { from: "tech", text: "Screen replacement for the 15 Pro Max takes about 1.5-2 hours. Price is $180 including a 90-day warranty on the repair.", time: "10:18 AM", read: true },
    { from: "client", text: "That sounds good! When can I come in?", time: "10:22 AM" },
    { from: "tech", text: "I have slots available tomorrow from 9AM–12PM and 2PM–6PM. Which works better for you?", time: "10:24 AM", read: true },
    { from: "client", text: "Yes, I can bring it in tomorrow morning around 9am", time: "10:31 AM" },
  ],
  c2: [
    { from: "tech", text: "Hi Daniel! Quick update on JOB-882. We've completed the initial water damage cleaning and are now running diagnostics.", time: "Yesterday, 3PM", read: true },
    { from: "client", text: "Thanks for the update! Any chance it's recoverable?", time: "Yesterday, 4PM" },
    { from: "tech", text: "Looking positive! The logic board seems intact. We'll know more by end of today.", time: "Yesterday, 4:30PM", read: true },
    { from: "client", text: "Is my phone ready? Any updates on the repair?", time: "Today, 9:45AM" },
  ],
  c3: [
    { from: "client", text: "How's the MacBook diagnosis going?", time: "9:00 AM" },
    { from: "tech", text: "Running full diagnostics now. Looks like the GPU memory might need to be reflowed. I'll have a full report by 2PM.", time: "9:20 AM", read: true },
    { from: "client", text: "Thanks for the update! I'll wait for your message.", time: "9:25 AM" },
  ],
  c4: [],
  c5: [],
};

export default function Messages() {
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [allMessages, setAllMessages] = useState(MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv.id, allMessages]);

  const currentMessages = allMessages[activeConv.id] || [];

  const handleSend = () => {
    if (!input.trim()) return;
    setAllMessages(prev => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), { from: "tech", text: input.trim(), time: "Now", read: false }],
    }));
    setInput("");
  };

  const filtered = CONVERSATIONS.filter(c =>
    c.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{
        width: 300, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        background: "#0D0D0D",
      }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "0 12px",
          }}>
            <Search size={13} color="#505050" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ background: "transparent", border: "none", outline: "none", color: "#E0E0E0", fontSize: 12, padding: "9px 0", width: "100%" }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {filtered.map(conv => {
            const isActive = activeConv.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  padding: "12px 10px", borderRadius: 10, marginBottom: 2,
                  background: isActive ? "rgba(255,107,0,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(255,107,0,0.2)" : "transparent"}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>{conv.avatar}</div>
                    {conv.online && (
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#22C55E", border: "2px solid #0D0D0D",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{conv.client}</span>
                      <span style={{ color: "#505050", fontSize: 10 }}>{conv.time}</span>
                    </div>
                    <div style={{ color: "#606060", fontSize: 11, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginBottom: 2 }}>{conv.lastMsg}</div>
                    <div style={{ color: "#FF6B00", fontSize: 10, fontWeight: 500 }}>{conv.jobId}</div>
                  </div>
                  {conv.unread > 0 && (
                    <div style={{
                      background: "#FF6B00", color: "#fff", borderRadius: 20,
                      fontSize: 10, fontWeight: 700, padding: "1px 6px",
                      lineHeight: "14px", flexShrink: 0, marginTop: 2,
                    }}>{conv.unread}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0A0A0A" }}>
        {/* Chat header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(13,13,13,0.9)",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff",
              }}>{activeConv.avatar}</div>
              {activeConv.online && (
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: "2px solid #0A0A0A" }} />
              )}
            </div>
            <div>
              <div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 700 }}>{activeConv.client}</div>
              <div style={{ color: "#606060", fontSize: 11 }}>
                {activeConv.online ? <span style={{ color: "#22C55E" }}>● Online</span> : "Last seen 1h ago"} · {activeConv.device}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[Phone, Video, MoreHorizontal].map((Icon, i) => (
              <button key={i} style={{
                width: 34, height: 34, borderRadius: 9,
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#606060",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,0,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,0,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#606060"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <Icon size={15} strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>

        {/* Job info banner */}
        <div style={{
          padding: "8px 20px",
          background: "rgba(255,107,0,0.06)", borderBottom: "1px solid rgba(255,107,0,0.1)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Smartphone size={12} color="#FF6B00" />
          <span style={{ color: "#FF9A3C", fontSize: 12, fontWeight: 500 }}>
            {activeConv.jobId} — {activeConv.device}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {currentMessages.length === 0 && (
            <div style={{ textAlign: "center", color: "#505050", fontSize: 13, marginTop: 60 }}>
              No messages yet. Start the conversation!
            </div>
          )}
          {currentMessages.map((msg, i) => {
            const isTech = msg.from === "tech";
            return (
              <div key={i} style={{
                display: "flex", justifyContent: isTech ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}>
                {!isTech && (
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, marginRight: 8, alignSelf: "flex-end",
                  }}>{activeConv.avatar[0]}</div>
                )}
                <div style={{ maxWidth: "68%" }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: isTech ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isTech ? "linear-gradient(135deg, #FF6B00, #FF9A3C)" : "#1C1C1C",
                    color: isTech ? "#fff" : "#E0E0E0",
                    fontSize: 13, lineHeight: 1.5,
                    boxShadow: isTech ? "0 4px 16px rgba(255,107,0,0.25)" : "none",
                  }}>{msg.text}</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4, marginTop: 4,
                    justifyContent: isTech ? "flex-end" : "flex-start",
                  }}>
                    <span style={{ color: "#505050", fontSize: 10 }}>{msg.time}</span>
                    {isTech && msg.read && <CheckCheck size={11} color="#FF9A3C" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "#161616", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: "10px 14px",
          }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#505050", padding: 0 }}>
              <Paperclip size={16} strokeWidth={1.8} />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#E0E0E0", fontSize: 13, resize: "none", lineHeight: 1.5,
                fontFamily: "inherit",
              }}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#505050", padding: 0 }}>
              <Smile size={16} strokeWidth={1.8} />
            </button>
            <button
              onClick={handleSend}
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: input.trim() ? "linear-gradient(135deg, #FF6B00, #FF9A3C)" : "#1E1E1E",
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: input.trim() ? "0 0 12px rgba(255,107,0,0.35)" : "none",
                transition: "all 0.2s",
              }}
            >
              <Send size={14} color={input.trim() ? "#fff" : "#404040"} strokeWidth={2} />
            </button>
          </div>
          <div style={{ color: "#404040", fontSize: 11, marginTop: 6, textAlign: "center" }}>
            Press <kbd style={{ background: "#1A1A1A", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Enter</kbd> to send · <kbd style={{ background: "#1A1A1A", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
