import { useState, useRef } from "react";
import {
  Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon,
  Quote, Code2, Table2, Heading2, AlignLeft, Eye, Save,
  Calendar, Globe, Lock, Star, MessageSquare, Clock,
  Upload, X, ChevronDown, Tag, Sparkles, Send, FileText,
  ToggleLeft, ToggleRight, Hash, Type
} from "lucide-react";

const CATEGORIES = [
  "iPhone Repair", "MacBook Repair", "iPad Repair",
  "Apple Watch Repair", "Battery Replacement", "Screen Repair",
  "Maintenance Tips", "Troubleshooting",
];

const TOOLBAR_GROUPS = [
  [
    { icon: Heading2,    label: "Heading",    cmd: "heading"    },
    { icon: Bold,        label: "Bold",       cmd: "bold"       },
    { icon: Italic,      label: "Italic",     cmd: "italic"     },
  ],
  [
    { icon: List,        label: "Bullet List",   cmd: "bullet"  },
    { icon: ListOrdered, label: "Ordered List",  cmd: "ordered" },
    { icon: Quote,       label: "Quote",          cmd: "quote"   },
  ],
  [
    { icon: Link2,       label: "Link",       cmd: "link"       },
    { icon: ImageIcon,   label: "Image",      cmd: "image"      },
    { icon: Code2,       label: "Code Block", cmd: "code"       },
    { icon: Table2,      label: "Table",      cmd: "table"      },
  ],
];

const INITIAL_CONTENT = `## Introduction

Start writing your article here. Share your repair expertise and help other technicians.

### Common Causes

- Dust accumulation in vents
- Thermal paste degradation
- Heavy workload tasks

### Step-by-Step Solution

1. Power off the device completely
2. Use compressed air to clean vents
3. Apply fresh thermal paste

> **Pro Tip:** Always work in an anti-static environment when opening Apple devices.

\`\`\`bash
# Check CPU temperature (macOS Terminal)
sudo powermetrics --samplers smc | grep -i "CPU die"
\`\`\`
`;

// ── Shared card shell ──────────────────────────────────────────────────────────
const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    ...style,
  }}>{children}</div>
);

const CardHead = ({ title, icon: Icon, color = "#FF6B00" }: { title: string; icon?: React.ElementType; color?: string }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "14px 18px 0",
    marginBottom: 14,
  }}>
    {Icon && <Icon size={14} color={color} strokeWidth={2} />}
    <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 13 }}>{title}</span>
  </div>
);

// ── Toggle switch ──────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    style={{
      width: 40, height: 22, borderRadius: 11, border: "none",
      background: on ? "linear-gradient(90deg, #FF6B00, #FF9A3C)" : "#2A2A2A",
      cursor: "pointer", position: "relative", transition: "background 0.2s",
      boxShadow: on ? "0 0 10px rgba(255,107,0,0.35)" : "none", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: 2, left: on ? 20 : 2,
      width: 18, height: 18, borderRadius: "50%", background: "#fff",
      transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    }} />
  </button>
);

// ── Estimate read time ─────────────────────────────────────────────────────────
const readTime = (text: string) => Math.max(1, Math.round(text.split(" ").length / 200));

export default function ArticleEditor() {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent]         = useState(INITIAL_CONTENT);
  const [selectedCats, setSelectedCats] = useState<string[]>(["MacBook Repair"]);
  const [metaTitle, setMetaTitle]     = useState("");
  const [metaDesc, setMetaDesc]       = useState("");
  const [keywords, setKeywords]       = useState("");
  const [visibility, setVisibility]   = useState<"public" | "technicians">("public");
  const [featured, setFeatured]       = useState(false);
  const [comments, setComments]       = useState(true);
  const [pubMode, setPubMode]         = useState<"draft" | "publish" | "schedule">("publish");
  const [coverImg, setCoverImg]       = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleCat = (cat: string) =>
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setCoverImg(url);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const insertFormat = (cmd: string) => {
    setActiveToolbar(cmd);
    setTimeout(() => setActiveToolbar(null), 300);
    const map: Record<string, string> = {
      heading: "\n## ",
      bold:    "**text**",
      italic:  "*text*",
      bullet:  "\n- ",
      ordered: "\n1. ",
      quote:   "\n> ",
      code:    "\n```\ncode\n```\n",
      link:    "[text](url)",
      image:   "![alt](url)",
      table:   "\n| Col1 | Col2 |\n|------|------|\n| val  | val  |\n",
    };
    if (map[cmd]) setContent(prev => prev + map[cmd]);
  };

  const previewTitle = title || "Your Article Title";
  const previewExcerpt = description || content.replace(/#+\s|[*_`>]/g, "").slice(0, 140) + "…";

  // ── input style helper ────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10, padding: "10px 14px",
    color: "#E0E0E0", fontSize: 13, outline: "none",
    fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  };

  const focusStyle = {
    borderColor: "rgba(255,107,0,0.45)",
    boxShadow: "0 0 0 3px rgba(255,107,0,0.08)",
  };

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(255,107,0,0.4)",
          }}>
            <FileText size={15} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ color: "#F0F0F0", fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
              Create New Article
            </h1>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{
              background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
              borderRadius: 20, padding: "4px 12px",
              color: "#FF6B00", fontSize: 11, fontWeight: 700,
            }}>Draft</span>
          </div>
        </div>
        <p style={{ color: "#606060", fontSize: 13, margin: 0 }}>
          Share repair knowledge and build your professional reputation.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Editor workspace ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 1. Article Title */}
          <Card style={{ padding: "18px 20px" }}>
            <label style={{ color: "#707070", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>ARTICLE TITLE</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="How to Fix MacBook Overheating Problems"
              style={{ ...inputStyle, fontSize: 18, fontWeight: 700, padding: "12px 16px", letterSpacing: "-0.01em" }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <span style={{ color: title.length > 100 ? "#EF4444" : "#505050", fontSize: 11 }}>{title.length}/120</span>
            </div>
          </Card>

          {/* 2. Cover image */}
          <Card style={{ padding: "18px 20px" }}>
            <label style={{ color: "#707070", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>COVER IMAGE</label>
            {coverImg ? (
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
                <img src={coverImg} alt="cover" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                <button
                  onClick={() => setCoverImg(null)}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                ><X size={13} /></button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? "#FF6B00" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 12, padding: "36px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  cursor: "pointer", transition: "all 0.2s",
                  background: dragging ? "rgba(255,107,0,0.05)" : "transparent",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Upload size={20} color="#FF6B00" strokeWidth={1.8} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>Drop image here or click to upload</div>
                  <div style={{ color: "#505050", fontSize: 12, marginTop: 3 }}>PNG, JPG, WebP · Max 5MB · 1200×630px recommended</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}
          </Card>

          {/* 3. Categories */}
          <Card style={{ padding: "18px 20px" }}>
            <label style={{ color: "#707070", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>CATEGORIES</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map(cat => {
                const active = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, border: "none",
                      background: active ? "rgba(255,107,0,0.14)" : "rgba(255,255,255,0.05)",
                      color: active ? "#FF6B00" : "#808080",
                      fontSize: 12, fontWeight: active ? 700 : 400,
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: active ? "0 0 10px rgba(255,107,0,0.2)" : "none",
                      outline: active ? "1px solid rgba(255,107,0,0.35)" : "1px solid rgba(255,255,255,0.07)",
                      fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                  >
                    {active && <span style={{ marginRight: 4 }}>✓</span>}{cat}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 4. Short description */}
          <Card style={{ padding: "18px 20px" }}>
            <label style={{ color: "#707070", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>SHORT DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A concise summary of what readers will learn from this article..."
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.6,
              }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <span style={{ color: description.length > 250 ? "#EF4444" : "#505050", fontSize: 11 }}>{description.length}/280</span>
            </div>
          </Card>

          {/* 5. Main content editor */}
          <Card>
            <div style={{ padding: "16px 18px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ color: "#707070", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>ARTICLE CONTENT</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ color: "#505050", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} /> ~{readTime(content)} min read
                  </span>
                  <span style={{ color: "#404040" }}>·</span>
                  <span style={{ color: "#505050", fontSize: 11 }}>
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div style={{
                display: "flex", gap: 2, alignItems: "center",
                padding: "8px 10px", background: "#0F0F0F",
                borderRadius: "10px 10px 0 0", border: "1px solid rgba(255,255,255,0.07)",
                borderBottom: "none", flexWrap: "wrap",
              }}>
                {TOOLBAR_GROUPS.map((group, gi) => (
                  <div key={gi} style={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {group.map(({ icon: Icon, label, cmd }) => (
                      <button
                        key={cmd}
                        title={label}
                        onClick={() => insertFormat(cmd)}
                        style={{
                          width: 30, height: 28, borderRadius: 6,
                          background: activeToolbar === cmd ? "rgba(255,107,0,0.2)" : "transparent",
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: activeToolbar === cmd ? "#FF6B00" : "#606060",
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#E0E0E0";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = activeToolbar === cmd ? "rgba(255,107,0,0.2)" : "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = activeToolbar === cmd ? "#FF6B00" : "#606060";
                        }}
                      >
                        <Icon size={14} strokeWidth={1.8} />
                      </button>
                    ))}
                    {gi < TOOLBAR_GROUPS.length - 1 && (
                      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
                    )}
                  </div>
                ))}
                {/* AI assist button */}
                <div style={{ marginLeft: "auto" }}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                    borderRadius: 7, padding: "4px 10px",
                    color: "#FF9A3C", fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <Sparkles size={11} /> AI Assist
                  </button>
                </div>
              </div>

              {/* Editor area */}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{
                  width: "100%", minHeight: 420,
                  background: "#0F0F0F",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  padding: "18px 20px",
                  color: "#D0D0D0", fontSize: 14,
                  lineHeight: 1.8, resize: "vertical", outline: "none",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(255,107,0,0.3)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
                spellCheck={false}
              />
            </div>
            <div style={{ padding: "10px 18px 16px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 0 }}>
              <span style={{ color: "#404040", fontSize: 11 }}>Markdown supported</span>
              <a href="#" style={{ color: "#FF6B00", fontSize: 11, textDecoration: "none" }}>Syntax guide ↗</a>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Preview & publishing panel ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 24 }}>

          {/* Live preview card */}
          <Card>
            <CardHead title="Live Preview" icon={Eye} />
            <div style={{ padding: "0 16px 16px" }}>
              {/* Cover */}
              <div style={{
                height: 120, borderRadius: 10, overflow: "hidden", marginBottom: 12,
                background: coverImg ? "transparent" : "linear-gradient(135deg, #1A0A00, #1A1A1A)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {coverImg
                  ? <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <ImageIcon size={28} color="#2A2A2A" />
                }
              </div>

              {/* Category chips */}
              {selectedCats.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {selectedCats.slice(0, 2).map(cat => (
                    <span key={cat} style={{
                      background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)",
                      color: "#FF9A3C", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600,
                    }}>{cat}</span>
                  ))}
                </div>
              )}

              {/* Title */}
              <div style={{ color: "#F0F0F0", fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
                {previewTitle}
              </div>

              {/* Excerpt */}
              <p style={{ color: "#707070", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {previewExcerpt}
              </p>

              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>AK</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#C0C0C0", fontSize: 11, fontWeight: 600 }}>Alex Kim</div>
                  <div style={{ color: "#505050", fontSize: 10 }}>Pro Technician</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#505050", fontSize: 10 }}>
                  <Clock size={10} />
                  {readTime(content)} min
                </div>
              </div>
            </div>
          </Card>

          {/* SEO settings */}
          <Card>
            <CardHead title="SEO Settings" icon={Hash} color="#3B82F6" />
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Meta Title",       val: metaTitle,  set: setMetaTitle,  ph: "SEO-optimized title..." },
                { label: "Meta Description", val: metaDesc,   set: setMetaDesc,   ph: "Brief description for search engines..." },
                { label: "Keywords",         val: keywords,   set: setKeywords,   ph: "macbook, overheating, repair..." },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ color: "#606060", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>{f.label.toUpperCase()}</label>
                  {f.label === "Meta Description" ? (
                    <textarea
                      value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder={f.ph} rows={2}
                      style={{ ...inputStyle, resize: "none", fontSize: 12, lineHeight: 1.5 }}
                      onFocus={e => Object.assign(e.target.style, focusStyle)}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
                    />
                  ) : (
                    <input
                      value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder={f.ph}
                      style={{ ...inputStyle, fontSize: 12 }}
                      onFocus={e => Object.assign(e.target.style, focusStyle)}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Article settings */}
          <Card>
            <CardHead title="Article Settings" icon={FileText} color="#A855F7" />
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Publish mode */}
              <div>
                <label style={{ color: "#606060", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>PUBLICATION</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { id: "draft",    icon: Save,     label: "Save Draft",          color: "#606060" },
                    { id: "publish",  icon: Send,     label: "Publish Now",         color: "#22C55E" },
                    { id: "schedule", icon: Calendar, label: "Schedule Publication", color: "#3B82F6" },
                  ].map(({ id, icon: Icon, label, color }) => (
                    <button
                      key={id}
                      onClick={() => setPubMode(id as any)}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "9px 12px", borderRadius: 9,
                        background: pubMode === id ? `${color}15` : "transparent",
                        border: `1px solid ${pubMode === id ? `${color}40` : "rgba(255,255,255,0.07)"}`,
                        cursor: "pointer", transition: "all 0.15s",
                        color: pubMode === id ? color : "#707070",
                        fontFamily: "inherit", fontSize: 12, fontWeight: pubMode === id ? 600 : 400,
                        textAlign: "left",
                      }}
                    >
                      <Icon size={13} strokeWidth={1.8} />
                      {label}
                      {pubMode === id && (
                        <div style={{
                          marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                          background: color, boxShadow: `0 0 6px ${color}`,
                        }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label style={{ color: "#606060", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>VISIBILITY</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { id: "public",      icon: Globe, label: "Public" },
                    { id: "technicians", icon: Lock,  label: "Techs Only" },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setVisibility(id as any)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "8px", borderRadius: 9, border: "none",
                        background: visibility === id ? "rgba(255,107,0,0.14)" : "rgba(255,255,255,0.04)",
                        color: visibility === id ? "#FF6B00" : "#606060",
                        fontSize: 11, fontWeight: visibility === id ? 700 : 400,
                        cursor: "pointer", transition: "all 0.15s",
                        outline: visibility === id ? "1px solid rgba(255,107,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        fontFamily: "inherit",
                      }}
                    >
                      <Icon size={11} strokeWidth={1.8} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { label: "Featured Article", sub: "Boost visibility on FIXORA", on: featured, toggle: () => setFeatured(p => !p), color: "#F59E0B" },
                { label: "Allow Comments",   sub: "Let readers engage",          on: comments, toggle: () => setComments(p => !p), color: "#22C55E" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "#D0D0D0", fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: "#505050", fontSize: 11, marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <Toggle on={item.on} onChange={item.toggle} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Bottom action bar ─────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", bottom: 0,
        marginTop: 24, marginLeft: -28, marginRight: -28,
        padding: "14px 28px",
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 12,
        zIndex: 30,
      }}>
        {/* Autosave indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#505050", fontSize: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
          Auto-saved 2m ago
        </div>

        <div style={{ flex: 1 }} />

        {/* Ghost: Preview */}
        <button style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10, padding: "9px 18px",
          color: "#A0A0A0", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#E0E0E0"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#A0A0A0"; }}
        >
          <Eye size={14} strokeWidth={1.8} /> Preview Full Article
        </button>

        {/* Secondary: Save Draft */}
        <button style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10, padding: "9px 18px",
          color: "#C0C0C0", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
        >
          <Save size={14} strokeWidth={1.8} /> Save Draft
        </button>

        {/* Primary: Publish */}
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
          border: "none", borderRadius: 10, padding: "10px 24px",
          color: "#fff", fontSize: 13, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 0 22px rgba(255,107,0,0.4)",
          transition: "box-shadow 0.2s",
          letterSpacing: "-0.01em",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 36px rgba(255,107,0,0.65)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 22px rgba(255,107,0,0.4)"; }}
        >
          <Send size={14} strokeWidth={2.2} /> Publish Article
        </button>
      </div>
    </div>
  );
}
