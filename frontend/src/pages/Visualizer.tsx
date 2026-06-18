import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Download,
  Share,
  Search,
  RotateCw,
  PaintBucket,
  Droplets,
  X,
  Brush,
  Lock,
  Unlock,
} from "lucide-react";
import ThreeScene, {
  type ThreeSceneHandle,
  type WrapConfig,
  type Sprite360Result,
} from "@/components/ThreeScene";
import { CAR_MODELS, CAR_MODELS_BY_CATEGORY, type CarModel } from "@/data/cars";

const CAT_ICON: Record<string, string> = {
  Coupe: "🏎️",
  Hatchback: "🚗",
  "Mini SUV": "🚙",
  Pickup: "🛻",
  Sedan: "🚘",
  SUV: "🚐",
};

const QUICK_PICKS: CarModel[] = Array.from(CAR_MODELS_BY_CATEGORY.values()).map(
  (cars) => cars[0]
);
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Sprite360Viewer from "@/components/Sprite360Viewer";
import { WrapDesigner } from "@/components/WrapDesigner";
import { PartSelector } from "@/components/PartSelector";
import type { CanvasTexture } from "three";

// ── Wrap finishes with Three.js WrapConfig mapping ────────────────────────────
type WrapFinish = {
  name: string;
  color: string;
  type: string;
  style: "solid" | "shift" | "pearl" | "ppf";
  price: number;
  wrapConfig: WrapConfig;
};

const WRAP_CATEGORIES = ["Gloss", "Satin", "Matte"] as const;
const WRAP_STYLES = ["All", "Solid", "Shift", "Pearl", "PPF"] as const;

type WrapCategory = (typeof WRAP_CATEGORIES)[number];
type WrapStyle = (typeof WRAP_STYLES)[number];

const WRAP_FINISHES: WrapFinish[] = [
  {
    name: "Gloss White",
    color: "#f0f0f0",
    type: "Gloss",
    style: "solid",
    price: 2500,
    wrapConfig: { type: "metallic", color: "#f0f0f0" },
  },
  {
    name: "Gloss Red",
    color: "#dc143c",
    type: "Gloss",
    style: "solid",
    price: 2600,
    wrapConfig: { type: "metallic", color: "#dc143c" },
  },
  {
    name: "Gloss Silver",
    color: "#c0c0c0",
    type: "Gloss",
    style: "shift",
    price: 4200,
    wrapConfig: { type: "metallic", color: "#c0c0c0" },
  },
  {
    name: "Satin Steel",
    color: "#8b8d90",
    type: "Satin",
    style: "solid",
    price: 3000,
    wrapConfig: { type: "solid", color: "#8b8d90" },
  },
  {
    name: "Satin Midnight",
    color: "#283149",
    type: "Satin",
    style: "solid",
    price: 3200,
    wrapConfig: { type: "solid", color: "#283149" },
  },
  {
    name: "Satin Pearl",
    color: "#e8eaf6",
    type: "Satin",
    style: "pearl",
    price: 3000,
    wrapConfig: { type: "solid", color: "#e8eaf6" },
  },
  {
    name: "Matte Black",
    color: "#1a1a1a",
    type: "Matte",
    style: "solid",
    price: 2800,
    wrapConfig: { type: "solid", color: "#1a1a1a" },
  },
  {
    name: "Matte Blue",
    color: "#191970",
    type: "Matte",
    style: "solid",
    price: 2900,
    wrapConfig: { type: "solid", color: "#191970" },
  },
  {
    name: "Matte Green",
    color: "#355e3b",
    type: "Matte",
    style: "solid",
    price: 2900,
    wrapConfig: { type: "solid", color: "#355e3b" },
  },
  {
    name: "Carbon Fiber",
    color: "#2c2c2c",
    type: "Matte",
    style: "ppf",
    price: 3800,
    wrapConfig: { type: "carbon" },
  },
];

const TINT_PRESETS = [
  { name: "Limo Black", color: "#14171d" },
  { name: "Dark Smoke", color: "#232b34" },
  { name: "Medium Smoke", color: "#4b5661" },
  { name: "Light Smoke", color: "#7a8897" },
  { name: "Ceramic Smoke", color: "#1d232a" },
];

// ── Share-link helpers ────────────────────────────────────────────────────────
// Wraps are identified in URLs by a stable slug derived from their name.
const wrapSlug = (wrap: WrapFinish) =>
  wrap.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const findWrapBySlug = (slug: string | null) =>
  WRAP_FINISHES.find((w) => wrapSlug(w) === slug);

// ── HUD tools ─────────────────────────────────────────────────────────────────
// Each tool maps to a left-rail button, a slide-in panel, and a camera focus
// preset (the id doubles as the FocusView name the scene flies to).
const TOOLS = [
  { id: "model", label: "Model", icon: Car },
  { id: "wrap", label: "Wrap", icon: PaintBucket },
  { id: "tint", label: "Tint", icon: Droplets },
  { id: "paint", label: "Paint", icon: Brush },
] as const;
type Tool = (typeof TOOLS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

const Visualizer = () => {
  const sceneRef = useRef<ThreeSceneHandle>(null);

  // Read any shared config (?car=…&wrap=…) once, before first render.
  const initialParams = new URLSearchParams(window.location.search);
  const initialCar =
    CAR_MODELS.find((c) => c.id === initialParams.get("car")) ?? CAR_MODELS[0];
  const initialWrap =
    findWrapBySlug(initialParams.get("wrap")) ?? WRAP_FINISHES[0];

  // Starts true: ThreeScene auto-loads 911 on mount, wipePaintSet fires first
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarModel>(initialCar);
  const [selectedWrap, setSelectedWrap] = useState<WrapFinish>(initialWrap);
  const [selectedWrapCategory, setSelectedWrapCategory] =
    useState<WrapCategory>("Gloss");
  const [selectedWrapStyle, setSelectedWrapStyle] = useState<WrapStyle>("All");
  const [modelSearch, setModelSearch] = useState("");
  const [selectedTintColor, setSelectedTintColor] = useState("#232b34");
  const [activeTintColor, setActiveTintColor] = useState<string | null>(null);

  // 360° capture + download dialog state
  const [capturing, setCapturing] = useState(false);
  const [sprite, setSprite] = useState<Sprite360Result | null>(null);
  const [showSave, setShowSave] = useState(false);

  // Which HUD tool/panel is open (null = closed, full-car view).
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // Per-part custom painting state (the "Paint" tool)
  const [paintableParts, setPaintableParts] = useState<
    Array<{ uuid: string; name: string }>
  >([]);
  const [selectedPartUuid, setSelectedPartUuid] = useState<string | null>(null);
  const [currentPartTexture, setCurrentPartTexture] =
    useState<CanvasTexture | null>(null);
  const [isCameraLocked, setIsCameraLocked] = useState(false);

  // Pull the paintable-part list + selected part's texture from the scene.
  const refreshParts = (): void => {
    const scene = sceneRef.current;
    if (!scene) return;
    setPaintableParts(scene.getPaintableParts());
    const sel = scene.getSelectedPartUuid();
    setSelectedPartUuid(sel);
    setCurrentPartTexture(sel ? scene.getPartCustomTexture(sel) : null);
  };

  // Toggle a tool open/closed and fly the camera to its focus preset.
  // Re-selecting the open tool closes it and returns to the full-car view.
  const handleSelectTool = (tool: Tool): void => {
    const next = activeTool === tool ? null : tool;

    // Leaving Paint mode: free the camera and drop the part selection.
    if (activeTool === "paint" && next !== "paint") {
      sceneRef.current?.setCameraLocked(false);
      setIsCameraLocked(false);
      setSelectedPartUuid(null);
      setCurrentPartTexture(null);
    }

    setActiveTool(next);

    if (next === "paint") {
      refreshParts();
      sceneRef.current?.focusView("full"); // overview so the user can pick a panel
    } else {
      // next is "model" | "wrap" | "tint" | null here
      sceneRef.current?.focusView(next ?? "full");
    }
  };

  const selectedWrapRef = useRef(selectedWrap);
  selectedWrapRef.current = selectedWrap;

  const handleApplyTint = (): void => {
    if (!loading) {
      setActiveTintColor(selectedTintColor);
      sceneRef.current?.applyWindowTint(selectedTintColor);
    }
  };

  const handleResetTint = (): void => {
    if (!loading) {
      setActiveTintColor(null);
      sceneRef.current?.applyWindowTint(null);
    }
  };

  const wrapOptions = WRAP_FINISHES.filter(
    (wrap) =>
      wrap.type === selectedWrapCategory &&
      (selectedWrapStyle === "All" ||
        wrap.style === selectedWrapStyle.toLowerCase()),
  );

  // Called by ThreeScene whenever the paint-panel set changes:
  //   count === 0  → wipePaintSet ran (new model starting)
  //   count  > 0  → model loaded + auto-detected, ready to apply wrap
  const handlePaintSetChange = (count: number) => {
    if (count === 0) {
      setLoading(true);
    } else {
      setLoading(false);
      sceneRef.current?.applyWrap(selectedWrapRef.current.wrapConfig);
      if (activeTintColor) {
        sceneRef.current?.applyWindowTint(activeTintColor);
      }
      // Refresh the per-part list for the Paint tool (panels just auto-detected).
      refreshParts();
    }
  };

  const handleSelectCar = (car: CarModel) => {
    if (car.id === selectedCar.id) return;
    setSelectedCar(car);
    // New model = new parts: drop any paint selection and unlock the camera.
    sceneRef.current?.setCameraLocked(false);
    setIsCameraLocked(false);
    setSelectedPartUuid(null);
    setCurrentPartTexture(null);
    sceneRef.current?.loadCar(car.path);
  };

  const filteredModels = CAR_MODELS.filter(
    (car) =>
      car.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      car.category.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  const handleSelectWrap = (wrap: WrapFinish) => {
    setSelectedWrap(wrap);
    if (!loading) {
      sceneRef.current?.applyWrap(wrap.wrapConfig);
    }
    // If loading, selectedWrapRef will be applied automatically once model finishes
  };

  // On mount, if a shared link selected a non-default car, load it.
  // selectedWrapRef already holds the shared wrap, so handlePaintSetChange applies it.
  useEffect(() => {
    if (selectedCar.id !== CAR_MODELS[0].id) {
      sceneRef.current?.loadCar(selectedCar.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Share: copy a deep link that restores this car + wrap ───────────────────
  const handleShare = async () => {
    const params = new URLSearchParams({
      car: selectedCar.id,
      wrap: wrapSlug(selectedWrap),
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard", { description: url });
    } catch {
      toast("Copy this share link", { description: url });
    }
  };

  // ── Save: render a 360 turntable into one JPEG sprite sheet ──────────────────
  const handleSave360 = () => {
    if (loading) {
      toast("Model is still loading — try again in a moment.");
      return;
    }
    setCapturing(true);
    // Defer one frame so the "capturing" spinner paints before the (synchronous)
    // multi-angle render runs.
    requestAnimationFrame(() => {
      const result =
        sceneRef.current?.captureSprite360({
          frames: 36,
          cols: 6,
          tile: 320,
        }) ?? null;
      setCapturing(false);
      if (!result) {
        toast.error("Couldn't capture the 360 — make sure a model is loaded.");
        return;
      }
      setSprite(result);
      setShowSave(true);
    });
  };

  const handleDownload = () => {
    if (!sprite) return;
    const a = document.createElement("a");
    a.href = sprite.dataUrl;
    a.download = `${selectedCar.id}-${wrapSlug(selectedWrap)}-360.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Vehicle <span className="text-gradient-primary">Visualizer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Customize your vehicle in real-time. Pick a tool — the camera flies
            to whatever you're tweaking.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Immersive game-style stage ─────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0e] shadow-2xl shadow-black/50 ring-1 ring-white/5"
          style={{ height: "min(78vh, 760px)" }}
        >
          <ThreeScene ref={sceneRef} onPaintSetChange={handlePaintSetChange} />

          {/* Vignette so HUD overlays read against the 3D scene */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          {/* Top bar: vehicle chip + Save / Share */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tracking-wide text-white">
                {selectedCar.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave360}
                disabled={loading || capturing}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:border-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {capturing ? "Capturing…" : "Save 360°"}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:border-primary hover:bg-primary/20"
              >
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Left tool rail */}
          <div className="absolute left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:left-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const active = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  aria-label={tool.label}
                  aria-pressed={active}
                  className={`group relative flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl border backdrop-blur-md transition ${
                    active
                      ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/30"
                      : "border-white/10 bg-black/40 text-white/70 hover:border-primary/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tool.label}</span>
                  {active && (
                    <span className="absolute -right-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide-in control panel */}
          <div
            className={`absolute bottom-6 left-20 top-20 z-20 w-[min(340px,calc(100%-6.5rem))] transition-all duration-300 sm:left-24 ${
              activeTool
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-4 opacity-0"
            }`}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {activeTool === "model" && (
                    <>
                      <Car className="h-4 w-4 text-primary" /> Switch Model
                    </>
                  )}
                  {activeTool === "wrap" && (
                    <>
                      <PaintBucket className="h-4 w-4 text-primary" /> Wrap Finish
                    </>
                  )}
                  {activeTool === "tint" && (
                    <>
                      <Droplets className="h-4 w-4 text-primary" /> Window Tint
                    </>
                  )}
                  {activeTool === "paint" && (
                    <>
                      <Brush className="h-4 w-4 text-primary" /> Custom Paint
                    </>
                  )}
                </div>
                <button
                  onClick={() => activeTool && handleSelectTool(activeTool)}
                  aria-label="Close panel"
                  className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Model */}
                {activeTool === "model" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        aria-label="Search cars"
                        placeholder="Search by model or category"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      {filteredModels.length > 0 ? (
                        filteredModels.map((car) => (
                          <button
                            key={car.id}
                            onClick={() => handleSelectCar(car)}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedCar.id === car.id
                                ? "border-primary bg-primary/15 text-white"
                                : "border-white/10 bg-white/5 text-white/80 hover:border-primary/50 hover:text-white"
                            }`}
                          >
                            <span>{car.name}</span>
                            <span className="text-[10px] uppercase tracking-wide text-white/40">
                              {car.category}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-sm text-white/50">
                          No matches found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Wrap */}
                {activeTool === "wrap" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {WRAP_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedWrapCategory(category)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selectedWrapCategory === category
                              ? "bg-primary text-primary-foreground"
                              : "border border-white/10 bg-white/5 text-white/70 hover:border-primary"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {WRAP_STYLES.map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedWrapStyle(style)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selectedWrapStyle === style
                              ? "bg-primary text-primary-foreground"
                              : "border border-white/10 bg-white/5 text-white/60 hover:border-primary"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      {wrapOptions.length > 0 ? (
                        wrapOptions.map((wrap) => (
                          <button
                            key={wrap.name}
                            onClick={() => handleSelectWrap(wrap)}
                            className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                              selectedWrap.name === wrap.name
                                ? "border-primary bg-primary/15"
                                : "border-white/10 bg-white/5 hover:border-primary/50"
                            }`}
                          >
                            <span
                              className="h-9 w-9 shrink-0 rounded-lg border border-white/20"
                              style={{ backgroundColor: wrap.color }}
                            />
                            <span className="text-left">
                              <span className="block text-sm font-medium text-white">
                                {wrap.name}
                              </span>
                              <span className="block text-xs text-white/50">
                                {wrap.type} · ${wrap.price.toLocaleString()}
                              </span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-sm text-white/50">
                          No finishes in this combination.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tint */}
                {activeTool === "tint" && (
                  <div className="space-y-4">
                    <p className="text-xs text-white/50">
                      Authentic automotive window-tint shades. Applied to glass
                      only — your wrap finish stays unchanged.
                    </p>
                    <div className="grid gap-2">
                      {TINT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setSelectedTintColor(preset.color)}
                          className={`flex items-center justify-between rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                            selectedTintColor === preset.color
                              ? "border-primary bg-primary/15 text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:border-primary/50"
                          }`}
                        >
                          <span>{preset.name}</span>
                          <span
                            className="inline-block h-4 w-10 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.color }}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="w-full btn-secondary"
                        onClick={handleApplyTint}
                        disabled={loading}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleResetTint}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </div>
                    {activeTintColor && (
                      <p className="text-center text-xs text-primary">
                        Tint applied
                      </p>
                    )}
                  </div>
                )}

                {/* Paint (per-part custom) */}
                {activeTool === "paint" && (
                  <div className="space-y-4">
                    <p className="text-xs text-white/50">
                      Pick a body panel, then drag on the car to paint it. Lock
                      the camera to paint; unlock to orbit.
                    </p>

                    <button
                      onClick={() => {
                        const next = !isCameraLocked;
                        setIsCameraLocked(next);
                        sceneRef.current?.setCameraLocked(next);
                      }}
                      className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isCameraLocked
                          ? "border-primary bg-primary/15 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-primary/50"
                      }`}
                    >
                      {isCameraLocked ? (
                        <>
                          <Lock className="h-4 w-4" /> Camera locked — painting
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4" /> Camera free — orbit
                        </>
                      )}
                    </button>

                    <PartSelector
                      parts={paintableParts}
                      selectedPartUuid={selectedPartUuid}
                      onSelectPart={(uuid) => {
                        sceneRef.current?.selectPartForPainting(uuid);
                        sceneRef.current?.focusPart(uuid);
                        setSelectedPartUuid(uuid);
                        setIsCameraLocked(true);
                        sceneRef.current?.setCameraLocked(true);
                        setCurrentPartTexture(
                          sceneRef.current?.getPartCustomTexture(uuid) ?? null,
                        );
                      }}
                      onRemovePart={(uuid) => {
                        sceneRef.current?.setPartCustomTexture(uuid, null);
                        setCurrentPartTexture(null);
                        setSelectedPartUuid(null);
                        refreshParts();
                      }}
                    />

                    {selectedPartUuid ? (
                      <WrapDesigner
                        existingTexture={currentPartTexture}
                        baseColor={selectedWrap.color}
                        onBrushColorChange={(hex) =>
                          sceneRef.current?.setBrushColor(hex)
                        }
                        onTextureUpdate={(texture) => {
                          if (selectedPartUuid) {
                            sceneRef.current?.setPartCustomTexture(
                              selectedPartUuid,
                              texture,
                            );
                            setCurrentPartTexture(texture);
                          }
                        }}
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-sm text-white/50">
                        Select a panel above to start painting.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom status readout */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-black/50 px-5 py-2 text-xs backdrop-blur-md md:flex">
            <span className="flex items-center gap-1.5 text-white/50">
              Vehicle
              <span className="font-semibold text-white">
                {selectedCar.name}
              </span>
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5 text-white/50">
              Wrap
              <span className="font-semibold text-white">
                {selectedWrap.name}
              </span>
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5 text-white/50">
              Tint
              <span className="font-semibold text-white">
                {activeTintColor ? "On" : "—"}
              </span>
            </span>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm text-white/70">Loading model…</p>
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Drag to orbit · scroll to zoom · pick a tool on the left to customize
        </p>
      </div>

      {/* 360 preview + download dialog */}
      <Dialog open={showSave} onOpenChange={setShowSave}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>360° View — {selectedCar.name}</DialogTitle>
            <DialogDescription>
              {selectedWrap.name} · drag the image left/right to spin. Saved as
              a single JPG ({sprite ? `${sprite.frames} frames` : ""}).
            </DialogDescription>
          </DialogHeader>

          {sprite && (
            <div className="flex flex-col items-center gap-2">
              <Sprite360Viewer sprite={sprite} />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <RotateCw className="w-3 h-3" /> Drag to rotate
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSave(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download JPG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Visualizer;
