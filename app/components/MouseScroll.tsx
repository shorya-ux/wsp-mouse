"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

const TOTAL_FRAMES = 208;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

function getFramePath(index: number): string {
  const num = String(index).padStart(3, "0");
  return `/frames/ezgif-frame-${num}.jpg`;
}

/* ------------------------------------------------------------------ */
/*  Lightweight High-Efficiency Loader                                */
/* ------------------------------------------------------------------ */
function Loader({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-300">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
            className="transition-[stroke-dashoffset] duration-100 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-white text-sm font-light tracking-wider tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5">
        <span className="text-white/80 text-xs tracking-[0.3em] uppercase font-light">
          WSP // Precision
        </span>
        <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-mono">
          Loading 3D Experience
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Zero-Rerender GPU Feature Section                                 */
/* ------------------------------------------------------------------ */
interface FeatureSectionProps {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  position?: "center" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: React.ReactNode;
}

function FeatureSection({ progress, range, position = "center", children }: FeatureSectionProps) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [18, 0, 0, -18]);

  let posClasses = "items-center text-center mx-auto max-w-3xl justify-center";
  if (position === "left") {
    posClasses = "items-start text-left pl-8 sm:pl-16 md:pl-20 lg:pl-28 max-w-xl justify-center";
  } else if (position === "right") {
    posClasses = "items-end text-right pr-8 sm:pr-16 md:pr-20 lg:pr-28 ml-auto max-w-xl justify-center";
  } else if (position === "top-left") {
    posClasses = "items-start text-left pl-8 sm:pl-16 md:pl-20 pt-24 max-w-md justify-start";
  } else if (position === "top-right") {
    posClasses = "items-end text-right pr-8 sm:pr-16 md:pr-20 pt-24 ml-auto max-w-md justify-start";
  } else if (position === "bottom-left") {
    posClasses = "items-start text-left pl-8 sm:pl-16 md:pl-20 pb-24 max-w-md justify-end";
  } else if (position === "bottom-right") {
    posClasses = "items-end text-right pr-8 sm:pr-16 md:pr-20 pb-24 ml-auto max-w-md justify-end";
  }

  return (
    <motion.div
      className={`absolute inset-0 flex flex-col pointer-events-none px-6 z-20 ${posClasses}`}
      style={{
        opacity,
        y,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive Story Milestones HUD                                  */
/* ------------------------------------------------------------------ */
const MILESTONES = [
  { id: "01", label: "Overview", progress: 0.05 },
  { id: "02", label: "Chassis", progress: 0.22 },
  { id: "03", label: "Ergonomics", progress: 0.36 },
  { id: "04", label: "Actuation", progress: 0.50 },
  { id: "05", label: "Optical Core", progress: 0.64 },
  { id: "06", label: "Acoustics", progress: 0.78 },
  { id: "07", label: "Masterpiece", progress: 0.94 },
];

function MilestoneHUD({
  activeMilestone,
  onSelectMilestone,
}: {
  activeMilestone: number;
  onSelectMilestone: (target: number) => void;
}) {
  return (
    <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-3.5 pointer-events-auto">
      {MILESTONES.map((item, index) => {
        const isActive = activeMilestone === index;

        return (
          <button
            key={item.id}
            onClick={() => onSelectMilestone(item.progress)}
            className="group flex items-center gap-3 text-right cursor-pointer transition-all duration-200 outline-none"
          >
            <span
              className={`text-[10px] tracking-[0.2em] uppercase font-mono transition-opacity duration-200 ${
                isActive
                  ? "text-white opacity-100 font-medium"
                  : "text-white/20 opacity-0 group-hover:opacity-100 group-hover:text-white/60"
              }`}
            >
              {item.label}
            </span>
            <div className="relative flex items-center justify-center">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    : "bg-white/20 group-hover:bg-white/50"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main MouseScroll Component (Continuous Fluid Scrollytelling)       */
/* ------------------------------------------------------------------ */
export default function MouseScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState(0);

  // 120 FPS Continuous Lerp Engine
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const lastMilestoneRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring for text overlays so text glides seamlessly with the mouse
  const smoothTextProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 180,
    mass: 0.15,
  });

  /* ---------- 120 FPS Continuous Lerp Animation Loop ---------- */
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      // Responsive, fluid lerp interpolation
      if (Math.abs(diff) > 0.00008) {
        currentProgressRef.current = current + diff * 0.14;
      } else {
        currentProgressRef.current = target;
      }

      const p = currentProgressRef.current;
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
      );

      // Only draw when the frame index changes — ultra-fast <0.4ms hardware blit
      if (frameIndex !== lastDrawnFrameRef.current) {
        lastDrawnFrameRef.current = frameIndex;

        const canvas = canvasRef.current;
        const images = imagesRef.current;

        if (canvas && images.length === TOTAL_FRAMES) {
          const img = images[frameIndex];
          if (img) {
            const ctx = canvas.getContext("2d", { alpha: false });
            if (ctx) {
              ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Sync scroll target directly without triggering React re-renders
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      targetProgressRef.current = latest;

      // Update milestone HUD indicator
      const milestoneIdx = Math.min(
        MILESTONES.length - 1,
        Math.max(0, Math.floor(latest * MILESTONES.length))
      );
      if (milestoneIdx !== lastMilestoneRef.current) {
        lastMilestoneRef.current = milestoneIdx;
        setActiveMilestone(milestoneIdx);
      }
    });
  }, [scrollYProgress]);

  /* ---------- Preload and pre-decode all 208 frames ---------- */
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    const loadAndDecodeImage = async (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          if (img.decode) {
            try {
              await img.decode();
            } catch {
              // ignore
            }
          }
          loaded++;
          setLoadProgress((loaded / TOTAL_FRAMES) * 100);
          resolve(img);
        };
        img.onerror = () => {
          loaded++;
          setLoadProgress((loaded / TOTAL_FRAMES) * 100);
          resolve(img);
        };
        img.src = getFramePath(index);
      });
    };

    const batchSize = 35;
    const loadBatch = async (startIdx: number) => {
      const batch: Promise<HTMLImageElement>[] = [];
      for (let i = startIdx; i < Math.min(startIdx + batchSize, TOTAL_FRAMES); i++) {
        batch.push(loadAndDecodeImage(i + 1));
      }
      const results = await Promise.all(batch);
      results.forEach((img, idx) => {
        images[startIdx + idx] = img;
      });
    };

    const loadAll = async () => {
      const batches = [];
      for (let i = 0; i < TOTAL_FRAMES; i += batchSize) {
        batches.push(loadBatch(i));
      }
      await Promise.all(batches);
      imagesRef.current = images;

      const canvas = canvasRef.current;
      if (canvas && images[0]) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.drawImage(images[0], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
      }

      setIsLoading(false);
    };

    loadAll();
  }, []);

  const handleSelectMilestone = useCallback((targetProgress: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerTop + targetProgress * containerHeight;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      {isLoading && <Loader progress={loadProgress} />}

      {/* Continuous scroll track container (750vh) */}
      <div ref={containerRef} className="relative h-[750vh] bg-[#050505]">
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
          {/* Subtle Ambient Radial Lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 255, 255, 0.025), transparent 75%)",
            }}
          />

          {/* Interactive HUD Milestones on right side */}
          <MilestoneHUD
            activeMilestone={activeMilestone}
            onSelectMilestone={handleSelectMilestone}
          />

          {/* Clean Canvas — displays original image sequence with Gemini and Veo logos */}
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          {/* ========================================================= */}
          {/* FEATURE SECTIONS (Smooth scroll-linked transitions)       */}
          {/* ========================================================= */}

          {/* PHASE 1: HERO OVERVIEW (0% -> 12%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0, 0.02, 0.09, 0.12]}
            position="center"
          >
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#111111] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-[10px] md:text-xs tracking-[0.25em] uppercase font-mono">
                  WSP // SERIES ONE
                </span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-white/95 leading-[0.88]">
                WSP
              </h1>
              <p className="text-white/60 text-lg sm:text-xl md:text-2xl font-light tracking-tight mt-4 max-w-md">
                Wireless Precision Redefined.
              </p>
              <p className="text-white/30 text-xs sm:text-sm font-light tracking-widest uppercase mt-2">
                Scroll to initiate disassembly sequence
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 2: FEATURE DROP #1 — MAGNESIUM EXOSKELETON (14% -> 25%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.13, 0.16, 0.23, 0.26]}
            position="left"
          >
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  01 // CHASSIS & GLIDE
                </span>
                <div className="h-[1px] w-8 bg-white/20" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 leading-[0.98]">
                Magnesium
                <br />
                Exoskeleton.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4">
                Formed via high-pressure thixomolding. Every skeletal truss is CNC-machined to 
                0.01mm tolerance, yielding a featherweight 58g shell with zero flex.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">58g</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Ultralight Mass</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">0.01mm</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">CNC Tolerance</p>
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* FLOATING FEATURE PILL #1 — VIRGIN PTFE (15% -> 26%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.15, 0.18, 0.24, 0.27]}
            position="bottom-right"
          >
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl max-w-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase">
                  100% Virgin PTFE Skates
                </span>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                Zero-additive rounded glide feet calibrated for frictionless micro-adjustments on any surface pad.
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 3: FEATURE DROP #2 — BIOMETRIC ARCHITECTURE (28% -> 40%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.28, 0.31, 0.38, 0.41]}
            position="right"
          >
            <div className="max-w-md ml-auto">
              <div className="flex items-center justify-end gap-2 mb-3">
                <div className="h-[1px] w-8 bg-white/20" />
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  02 // ERGONOMICS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 leading-[0.98]">
                Biometric
                <br />
                Palm Contour.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4">
                Iterated across 1,200 anatomical 3D scans. The arched ribbing cradles your palm, 
                eliminating carpometacarpal tension during marathon sessions.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10 text-right">
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">1,200+</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Hand Scans</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">Zero</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Palm Fatigue</p>
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* FLOATING FEATURE PILL #2 — CERAMIC OLEOPHOBIC COAT (30% -> 41%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.30, 0.33, 0.39, 0.42]}
            position="top-left"
          >
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl max-w-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase">
                  Nano-Ceramic Matte
                </span>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                Hydrophobic & oleophobic surface treatment repels natural skin oils and moisture for perpetual grip.
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 4: FEATURE DROP #3 — OPTICAL SWITCHES & GRAPHENE BATTERY (43% -> 55%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.43, 0.46, 0.53, 0.56]}
            position="left"
          >
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  03 // ACTUATION & POWER
                </span>
                <div className="h-[1px] w-8 bg-white/20" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 leading-[0.98]">
                Infrared Light-Gate
                <br />
                Switches.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4">
                Mechanical contacts cause debounce delay and wear. WSP uses infrared light interruption: 
                zero bounce, instant 0.125ms click registration, rated for 100 million clicks.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">0.125ms</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Click Delay</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">100M</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Click Lifespan</p>
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* FLOATING FEATURE PILL #3 — GRAPHENE-ION CELL (45% -> 56%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.45, 0.48, 0.54, 0.57]}
            position="bottom-right"
          >
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl max-w-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase">
                  Graphene-Ion Power
                </span>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                80 hours continuous high-drain battery life. 15 minutes of USB-C hyper-charge provides 24 hours uptime.
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 5: FEATURE DROP #4 — WSP-1 BIONIC SENSOR & 8K POLLING (58% -> 70%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.58, 0.61, 0.68, 0.71]}
            position="right"
          >
            <div className="max-w-md ml-auto">
              <div className="flex items-center justify-end gap-2 mb-3">
                <div className="h-[1px] w-8 bg-white/20" />
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  04 // OPTICAL ENGINE
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 leading-[0.98]">
                WSP-1 Bionic
                <br />
                Optical Core.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4">
                The pinnacle of tracking telemetry. 26,000 DPI with 650 IPS velocity tolerance 
                and 50G acceleration. Flawless 1:1 motion fidelity on glass, metal, or cloth.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-right">
                <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-xl font-medium tracking-tight tabular-nums">26K</span>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">DPI</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-xl font-medium tracking-tight tabular-nums">650</span>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">IPS</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-xl font-medium tracking-tight tabular-nums">8,000Hz</span>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Polling</p>
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* FLOATING FEATURE PILL #4 — 8000Hz POLLING (60% -> 71%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.60, 0.63, 0.69, 0.72]}
            position="top-left"
          >
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl max-w-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase">
                  True 8,000Hz Wireless
                </span>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                Transmits 8,000 reports/sec. Click-to-render delay reduced to an unnoticeable 0.125 milliseconds.
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 6: FEATURE DROP #5 — ACOUSTICS & DAMPENING (73% -> 85%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.73, 0.76, 0.83, 0.86]}
            position="left"
          >
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  05 // ACOUSTIC ISOLATION
                </span>
                <div className="h-[1px] w-8 bg-white/20" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 leading-[0.98]">
                Acoustic Silence.
                <br />
                Sublime Tactility.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4">
                Dual-stage silicone dampening cradles the optical stems, converting sharp clatter 
                into a muted, satisfying tactile impulse below 18 decibels.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">&lt;18 dB</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Near Silent Click</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0c0c] border border-white/[0.08]">
                  <span className="text-white/90 text-2xl font-medium tracking-tight tabular-nums">Dual-Stage</span>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Elastomer Mounts</p>
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* FLOATING FEATURE PILL #5 — NORDIC MCU (75% -> 86%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.75, 0.78, 0.84, 0.87]}
            position="bottom-right"
          >
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl max-w-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase">
                  Nordic nRF52840 MCU
                </span>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                Adaptive 2.4GHz frequency hopping scans 1,000 channels/sec to eradicate packet collisions in congested environments.
              </p>
            </div>
          </FeatureSection>

          {/* PHASE 7: MASTERPIECE EXPLODED VIEW & PRE-ORDER (89% -> 100%) */}
          <FeatureSection
            progress={smoothTextProgress}
            range={[0.88, 0.92, 0.99, 1.0]}
            position="center"
          >
            <div className="flex flex-col items-center max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/10 bg-[#111111]">
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-mono">
                  06 // COMPLETE EXPLODED ARCHITECTURE
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white/90 leading-[0.92]">
                Engineered
                <br />
                Without Compromise.
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed mt-4 max-w-md">
                Every component machined, balanced, and tuned to perfection. 
                Experience the apex of competitive wireless hardware.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
                <motion.button
                  className="px-8 py-3.5 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reserve Your Unit — $189
                </motion.button>
                <motion.button
                  onClick={() => handleSelectMilestone(0.05)}
                  className="px-6 py-3.5 rounded-full border border-white/20 text-white/70 text-xs uppercase tracking-[0.2em] font-light hover:border-white/50 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Replay Journey ↑
                </motion.button>
              </div>
              <p className="text-white/30 text-[10px] font-mono tracking-widest mt-4">
                FREE GLOBAL EXPRESS SHIPPING • 2-YEAR ACCIDENTAL WARRANTY
              </p>
            </div>
          </FeatureSection>

          {/* Minimal Bottom Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none">
            <span className="text-white/30 text-[10px] tracking-[0.35em] uppercase font-mono">
              Scroll Down To Disassemble
            </span>
            <div className="w-[1px] h-6 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
          </div>

          {/* Smooth Fade Transition into Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </>
  );
}
