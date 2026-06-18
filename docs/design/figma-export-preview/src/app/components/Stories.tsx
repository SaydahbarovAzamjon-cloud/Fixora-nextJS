import { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Pause, Play, Smartphone, Laptop, Tablet, Wrench, Zap, Star, Clock } from "lucide-react";

const STORIES = [
  {
    id: "s1", label: "Screen Fix", seen: false, new: true,
    frames: [
      {
        bg: "linear-gradient(145deg, #1A0A00, #2D1200)",
        accent: "#FF6B00",
        tag: "Before & After",
        device: "iPhone 15 Pro Max",
        title: "OLED Screen\nReplacement",
        desc: "Shattered display — fully restored in 90 minutes with genuine Apple OLED panel.",
        icon: Smartphone,
        stat1: { label: "Time", val: "90 min" },
        stat2: { label: "Cost", val: "$180" },
        stars: 5,
        client: "Sarah M.",
      },
      {
        bg: "linear-gradient(145deg, #001A0F, #002D1A)",
        accent: "#22C55E",
        tag: "Result",
        device: "iPhone 15 Pro Max",
        title: "Zero dead\npixels, perfect",
        desc: "Touch sensitivity and Face ID restored to factory spec. 90-day warranty included.",
        icon: Smartphone,
        stat1: { label: "Rating", val: "⭐ 5.0" },
        stat2: { label: "Review", val: "\"Flawless!\"" },
        stars: 5,
        client: "Sarah M.",
      },
    ],
  },
  {
    id: "s2", label: "MacBook", seen: false, new: true,
    frames: [
      {
        bg: "linear-gradient(145deg, #00101A, #001A2D)",
        accent: "#3B82F6",
        tag: "Logic Board",
        device: "MacBook Pro 16\" M3",
        title: "GPU Reflow\nRepair",
        desc: "GPU memory failure causing random shutdowns — diagnosed and reflowed under microscope.",
        icon: Laptop,
        stat1: { label: "Time", val: "4 hrs" },
        stat2: { label: "Cost", val: "$680" },
        stars: 5,
        client: "David K.",
      },
    ],
  },
  {
    id: "s3", label: "Water DMG", seen: true, new: false,
    frames: [
      {
        bg: "linear-gradient(145deg, #0D0018, #1A002D)",
        accent: "#A855F7",
        tag: "Recovery",
        device: "iPhone 14 Plus",
        title: "Water Damage\nRecovery",
        desc: "Fully submerged iPhone. Ultrasonic cleaning + motherboard corrosion treatment. Full recovery.",
        icon: Smartphone,
        stat1: { label: "Time", val: "48 hrs" },
        stat2: { label: "Saved", val: "$800+" },
        stars: 5,
        client: "Daniel W.",
      },
    ],
  },
  {
    id: "s4", label: "iPad Pro", seen: true, new: false,
    frames: [
      {
        bg: "linear-gradient(145deg, #0A1800, #142400)",
        accent: "#22C55E",
        tag: "Screen",
        device: "iPad Pro 12.9\"",
        title: "Pro Display\nReplaced",
        desc: "Cracked Liquid Retina XDR panel with ProMotion — genuine Apple replacement installed.",
        icon: Tablet,
        stat1: { label: "Time", val: "2 hrs" },
        stat2: { label: "Cost", val: "$380" },
        stars: 5,
        client: "Lily C.",
      },
    ],
  },
  {
    id: "s5", label: "Battery", seen: true, new: false,
    frames: [
      {
        bg: "linear-gradient(145deg, #1A0F00, #2D1800)",
        accent: "#F59E0B",
        tag: "Health Restore",
        device: "MacBook Air M2",
        title: "Battery at\n100% Health",
        desc: "OEM Apple battery — 8312 mAh capacity. Full cycle calibration and thermal paste replaced.",
        icon: Laptop,
        stat1: { label: "Time", val: "45 min" },
        stat2: { label: "Cost", val: "$149" },
        stars: 5,
        client: "Emma R.",
      },
    ],
  },
  {
    id: "s6", label: "Watch", seen: true, new: false,
    frames: [
      {
        bg: "linear-gradient(145deg, #10001A, #1A0028)",
        accent: "#EC4899",
        tag: "Sapphire Crystal",
        device: "Apple Watch Ultra 2",
        title: "Crystal Glass\nRestored",
        desc: "Genuine sapphire crystal glass replacement. Original water resistance restored to 100m.",
        icon: Zap,
        stat1: { label: "Time", val: "3 hrs" },
        stat2: { label: "Cost", val: "$220" },
        stars: 4,
        client: "Marcus L.",
      },
    ],
  },
];

const RING_SEEN = "linear-gradient(135deg, #2A2A2A, #2A2A2A)";
const RING_NEW  = "linear-gradient(135deg, #FF6B00 0%, #FF9A3C 50%, #FFCC00 100%)";

interface StoryViewerProps {
  storyIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  stories: typeof STORIES;
  onMarkSeen: (id: string) => void;
}

function StoryViewer({ storyIndex, onClose, onPrev, onNext, stories, onMarkSeen }: StoryViewerProps) {
  const story = stories[storyIndex];
  const [frameIndex, setFrameIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 5000;

  const frame = story.frames[frameIndex];
  const Icon = frame.icon;

  useEffect(() => {
    onMarkSeen(story.id);
    setFrameIndex(0);
    setProgress(0);
  }, [storyIndex]);

  useEffect(() => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (paused) return;

    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        if (frameIndex < story.frames.length - 1) {
          setFrameIndex(f => f + 1);
        } else {
          onNext();
        }
      }
    }, 30);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [frameIndex, paused, storyIndex]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={onClose}
    >
      {/* Story card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 380, height: 660,
          borderRadius: 24,
          background: frame.bg,
          border: `1px solid ${frame.accent}30`,
          position: "relative", overflow: "hidden",
          boxShadow: `0 0 60px ${frame.accent}30, 0 30px 80px rgba(0,0,0,0.8)`,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Decorative glow orb */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: `radial-gradient(circle, ${frame.accent}25 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: `radial-gradient(circle, ${frame.accent}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Progress bars */}
        <div style={{ display: "flex", gap: 4, padding: "14px 14px 0", position: "relative", zIndex: 2 }}>
          {story.frames.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "#fff",
                width: i < frameIndex ? "100%" : i === frameIndex ? `${progress}%` : "0%",
                transition: i === frameIndex ? "none" : "none",
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 0", position: "relative", zIndex: 2 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
            boxShadow: "0 0 12px rgba(255,107,0,0.5)",
          }}>AK</div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Alex Kim</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Just now</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={() => setPaused(p => !p)}
              style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 20, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              {paused ? <Play size={12} fill="#fff" /> : <Pause size={12} fill="#fff" />}
            </button>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 20, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 2 }}>
          {/* Tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${frame.accent}22`, border: `1px solid ${frame.accent}44`,
            borderRadius: 20, padding: "4px 12px", marginBottom: 18,
            alignSelf: "flex-start",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: frame.accent, boxShadow: `0 0 6px ${frame.accent}` }} />
            <span style={{ color: frame.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>{frame.tag}</span>
          </div>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `${frame.accent}18`,
            border: `1px solid ${frame.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
            boxShadow: `0 0 24px ${frame.accent}20`,
          }}>
            <Icon size={34} color={frame.accent} strokeWidth={1.5} />
          </div>

          {/* Device */}
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{frame.device}</div>

          {/* Title */}
          <div style={{
            color: "#fff", fontSize: 30, fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.15,
            marginBottom: 14, whiteSpace: "pre-line",
          }}>{frame.title}</div>

          {/* Desc */}
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.65, margin: "0 0 24px" }}>{frame.desc}</p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[frame.stat1, frame.stat2].map(s => (
              <div key={s.label} style={{
                flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "10px 12px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Rating + client */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Star key={si} size={12} color={si < frame.stars ? "#F59E0B" : "rgba(255,255,255,0.15)"} fill={si < frame.stars ? "#F59E0B" : "none"} />
              ))}
            </div>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>by {frame.client}</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ padding: "0 20px 20px", position: "relative", zIndex: 2 }}>
          <div style={{
            background: `${frame.accent}20`, border: `1px solid ${frame.accent}40`,
            borderRadius: 12, padding: "10px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer",
          }}>
            <span style={{ color: frame.accent, fontSize: 12, fontWeight: 700 }}>Book This Repair</span>
            <ChevronRight size={14} color={frame.accent} />
          </div>
        </div>

        {/* Nav zones */}
        <div
          onClick={onPrev}
          style={{ position: "absolute", left: 0, top: 60, bottom: 0, width: "35%", cursor: "pointer", zIndex: 3 }}
        />
        <div
          onClick={() => {
            if (frameIndex < story.frames.length - 1) setFrameIndex(f => f + 1);
            else onNext();
          }}
          style={{ position: "absolute", right: 0, top: 60, bottom: 0, width: "35%", cursor: "pointer", zIndex: 3 }}
        />
      </div>

      {/* Prev / Next story arrows */}
      {storyIndex > 0 && (
        <button onClick={onPrev} style={{
          position: "absolute", left: "calc(50% - 240px)", top: "50%", transform: "translateY(-50%)",
          width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          transition: "background 0.15s",
        }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {storyIndex < stories.length - 1 && (
        <button onClick={onNext} style={{
          position: "absolute", right: "calc(50% - 240px)", top: "50%", transform: "translateY(-50%)",
          width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          transition: "background 0.15s",
        }}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

export default function Stories() {
  const [stories, setStories] = useState(STORIES);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const markSeen = (id: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, seen: true, new: false } : s));
  };

  const openStory = (i: number) => setActiveIndex(i);
  const closeStory = () => setActiveIndex(null);
  const prevStory = () => setActiveIndex(i => (i !== null && i > 0 ? i - 1 : i));
  const nextStory = () => setActiveIndex(i => (i !== null && i < stories.length - 1 ? i + 1 : null));

  return (
    <>
      <div style={{
        background: "#111111", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "18px 20px",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>Repair Stories</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
            <span style={{ color: "#22C55E", fontSize: 11, fontWeight: 600 }}>Live Portfolio</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          {/* Add Story bubble */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer" }}>
            <div style={{
              width: 66, height: 66, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "2px dashed rgba(255,107,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,107,0,0.1)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#FF6B00";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,107,0,0.4)";
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 10px rgba(255,107,0,0.5)",
              }}>
                <Plus size={14} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <span style={{ color: "#FF6B00", fontSize: 10, fontWeight: 700 }}>Add Story</span>
          </div>

          {/* Story bubbles */}
          {stories.map((story, i) => (
            <div
              key={story.id}
              onClick={() => openStory(i)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer" }}
            >
              {/* Ring */}
              <div style={{
                width: 70, height: 70, borderRadius: "50%",
                background: story.seen ? RING_SEEN : RING_NEW,
                padding: 2.5,
                boxShadow: story.seen ? "none" : "0 0 16px rgba(255,107,0,0.4)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              >
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "#0D0D0D",
                  border: "2px solid #0D0D0D",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Story preview bg */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: story.frames[0].bg,
                    opacity: 0.9,
                  }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {(() => { const Icon = story.frames[0].icon; return <Icon size={22} color={story.frames[0].accent} strokeWidth={1.5} />; })()}
                  </div>

                  {/* New indicator */}
                  {story.new && (
                    <div style={{
                      position: "absolute", bottom: 3, right: 3,
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#FF6B00", border: "2px solid #0D0D0D",
                      boxShadow: "0 0 6px rgba(255,107,0,0.8)",
                    }} />
                  )}
                </div>
              </div>
              <span style={{ color: story.seen ? "#505050" : "#C0C0C0", fontSize: 10, fontWeight: story.seen ? 400 : 600, maxWidth: 64, textAlign: "center", lineHeight: 1.2 }}>{story.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story viewer */}
      {activeIndex !== null && (
        <StoryViewer
          storyIndex={activeIndex}
          stories={stories}
          onClose={closeStory}
          onPrev={prevStory}
          onNext={nextStory}
          onMarkSeen={markSeen}
        />
      )}
    </>
  );
}
