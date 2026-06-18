import { useRef, useState, useEffect } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { WrapDesigner } from "@/components/WrapDesigner";
import { PartSelector } from "@/components/PartSelector";
import { CanvasTexture } from "three";
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
import { Car, Palette, Download, Share, Quote, Lock, Unlock } from "lucide-react";
import ThreeScene, {
  type ThreeSceneHandle,
  type WrapConfig,
} from "@/components/ThreeScene";
import { CAR_MODELS, CAR_MODELS_BY_CATEGORY, type CarModel } from "@/data/cars";

const CAT_ICON: Record<string, string> = {
  Coupe: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2019_BMW_M2_Competition_%28F87%29_coupe_%282019-11-01%29_01.jpg/320px-2019_BMW_M2_Competition_%28F87%29_coupe_%282019-11-01%29_01.jpg",
  Hatchback: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/2019_Volkswagen_Golf_1.5_TSI_ACT_Match_%28facelift%2C_black%29%2C_front_8.21.19.jpg/320px-2019_Volkswagen_Golf_1.5_TSI_ACT_Match_%28facelift%2C_black%29%2C_front_8.21.19.jpg",
  "Mini SUV": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/2018_Suzuki_Vitara_SZ5_AllGrip_1.6_DDiS_Front.jpg/320px-2018_Suzuki_Vitara_SZ5_AllGrip_1.6_DDiS_Front.jpg",
  Pickup: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/2019_Ford_F-150_XLT_SuperCab_%28facelift%2C_blue%29%2C_front_8.21.19.jpg/320px-2019_Ford_F-150_XLT_SuperCab_%28facelift%2C_blue%29%2C_front_8.21.19.jpg",
  Sedan: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/2019_Toyota_Camry_%28AXVH71R%29_Ascent_sedan_%282019-08-27%29_01.jpg/320px-2019_Toyota_Camry_%28AXVH71R%29_Ascent_sedan_%282019-08-27%29_01.jpg",
  SUV: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2017_Toyota_Land_Cruiser_%28VDJ200R%29_GXL_wagon_%282018-08-27%29_01.jpg/320px-2017_Toyota_Land_Cruiser_%28VDJ200R%29_GXL_wagon_%282018-08-27%29_01.jpg",
};

const QUICK_PICKS: CarModel[] = Array.from(CAR_MODELS_BY_CATEGORY.values()).map(
  (cars) => cars[0]
);
  Car,
  Download,
  Share,
  Search,
  RotateCw,
  PaintBucket,
  Droplets,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ThreeScene, {
  type ThreeSceneHandle,
  type WrapConfig,
  type Sprite360Result,
} from "@/components/ThreeScene";
import Sprite360Viewer from "@/components/Sprite360Viewer";
import { CAR_MODELS, type CarModel } from "@/data/cars";

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
    name: "Matte Black",
    color: "#1a1a1a",
    type: "Matte",
    price: 2800,
    wrapConfig: { type: "solid", color: "#1a1a1a" },
  },
  {
    name: "Gloss White",
    color: "#f0f0f0",
    type: "Gloss",
    name: "Gloss White",
    color: "#f0f0f0",
    type: "Gloss",
    style: "solid",
    price: 2500,
    wrapConfig: { type: "metallic", color: "#f0f0f0" },
  },
  {
    name: "Chrome Silver",
    color: "#c0c0c0",
    type: "Chrome",
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
    name: "Orange Burst",
    color: "#ff6b35",
    type: "Gloss",
    price: 2700,
    wrapConfig: { type: "solid", color: "#ff6b35" },
  },
  {
    name: "Midnight Blue",
    color: "#191970",
    type: "Matte",
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
    name: "Racing Red",
    color: "#dc143c",
    type: "Gloss",
    price: 2600,
    wrapConfig: { type: "metallic", color: "#dc143c" },
  },
  {
    name: "Forest Green",
    color: "#355e3b",
    type: "Matte",
    name: "Matte Green",
    color: "#355e3b",
    type: "Matte",
    style: "solid",
    price: 2900,
    wrapConfig: { type: "solid", color: "#355e3b" },
  },
  {
    name: "Gold Chrome",
    color: "#ffd700",
    type: "Chrome",
    price: 4500,
    wrapConfig: { type: "metallic", color: "#ffd700" },
  },
  {
    name: "Purple Metallic",
    color: "#663399",
    type: "Metallic",
    price: 3200,
    wrapConfig: { type: "metallic", color: "#663399" },
  },
  {
    name: "Carbon Fiber",
    color: "#2c2c2c",
    type: "Textured",
    name: "Carbon Fiber",
    color: "#2c2c2c",
    type: "Matte",
    style: "ppf",
    price: 3800,
    wrapConfig: { type: "carbon" },
  },
];

export default function Visualizer() {
  const sceneRef = useRef<ThreeSceneHandle>(null);

  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarModel>(CAR_MODELS[0]);
  const [selectedWrap, setSelectedWrap] = useState<WrapFinish>(WRAP_FINISHES[0]);

  const [designMode, setDesignMode] = useState<"preset" | "custom">("preset");

  // Per‑part painting state
  const [paintableParts, setPaintableParts] = useState<
    Array<{ uuid: string; name: string }>
  >([]);
  const [selectedPartUuid, setSelectedPartUuid] = useState<string | null>(null);
  const [currentPartTexture, setCurrentPartTexture] =
    useState<CanvasTexture | null>(null);
  const [isCameraLocked, setIsCameraLocked] = useState(false);

  const selectedWrapRef = useRef(selectedWrap);
  selectedWrapRef.current = selectedWrap;

  // Refresh the list of paintable parts and the selected part's texture
  const refreshParts = () => {
    if (sceneRef.current) {
      const parts = sceneRef.current.getPaintableParts();
      setPaintableParts(parts);
      const selected = sceneRef.current.getSelectedPartUuid();
      setSelectedPartUuid(selected);
      if (selected) {
        const tex = sceneRef.current.getPartCustomTexture(selected);
        setCurrentPartTexture(tex);
      } else {
        setCurrentPartTexture(null);
      }
    }
  };

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

  // Toggle a tool open/closed and fly the camera to its focus preset.
  // Re-selecting the open tool closes it and returns to the full-car view.
  const handleSelectTool = (tool: Tool): void => {
    const next = activeTool === tool ? null : tool;
    setActiveTool(next);
    sceneRef.current?.focusView(next ?? "full");
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
      if (designMode === "preset") {
        sceneRef.current?.applyWrap(selectedWrapRef.current.wrapConfig);
      }
      refreshParts(); // update part list after paint set changes
      sceneRef.current?.applyWrap(selectedWrapRef.current.wrapConfig);
      if (activeTintColor) {
        sceneRef.current?.applyWindowTint(activeTintColor);
      }
    }
  };

  const handleSelectCar = (car: CarModel) => {
    if (car.id === selectedCar.id) return;
    setSelectedCar(car);
    sceneRef.current?.loadCar(car.path);
  };

  const filteredModels = CAR_MODELS.filter(
    (car) =>
      car.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      car.category.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  const handleSelectWrap = (wrap: WrapFinish) => {
    setSelectedWrap(wrap);
    if (!loading && designMode === "preset") {
      sceneRef.current?.applyWrap(wrap.wrapConfig);
    }
  };

  // When switching to custom mode, refresh parts and select first part if any
  useEffect(() => {
    if (designMode === "custom") {
      refreshParts();
    }
  }, [designMode]);
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

      <section className="pt-24 pb-12 bg-gradient-dark">
      {/* Header */}
      <section className="pt-24 pb-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Vehicle <span className="text-gradient-primary">Visualizer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Customize your vehicle in real-time. Choose your model, select
            wraps, or design your own per‑part custom wrap.
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Customize your vehicle in real-time. Pick a tool — the camera flies
            to whatever you're tweaking.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex gap-2">
              <button
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  designMode === "preset"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border hover:bg-accent"
                }`}
                onClick={() => setDesignMode("preset")}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Preset Wraps
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  designMode === "custom"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border hover:bg-accent"
                }`}
                onClick={() => setDesignMode("custom")}
              >
                <Car className="w-4 h-4 inline mr-2" />
                Custom Design
              </button>
            </div>

            {designMode === "preset" ? (
              <Tabs defaultValue="model" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="model">Model</TabsTrigger>
                  <TabsTrigger value="wrap">Wrap</TabsTrigger>
                </TabsList>

                <TabsContent value="model" className="space-y-4">
                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Car className="mr-2 w-5 h-5 text-primary" />
                        Select Vehicle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedCar.id}
                        onValueChange={(id) => {
                          const car = CAR_MODELS.find((m) => m.id === id);
                          if (car) handleSelectCar(car);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAR_MODELS.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {CAT_ICON[car.category] ?? "🚗"} {car.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {QUICK_PICKS.map((car) => (
                          <button
                            key={car.id}
                            onClick={() => handleSelectCar(car)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              selectedCar.id === car.id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            <div className="text-2xl mb-1">
                              {CAT_ICON[car.category] ?? "🚗"}
                            </div>
                            <div className="text-sm font-medium leading-tight">
                              {car.name}
                            </div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {car.category}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="wrap" className="space-y-4">
                  <Card className="card-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="mr-2 w-5 h-5 text-primary" />
                        Choose Wrap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {WRAP_FINISHES.map((wrap) => (
                          <button
                            key={wrap.name}
                            onClick={() => handleSelectWrap(wrap)}
                            className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                              selectedWrap.name === wrap.name
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex-shrink-0"
                              style={{ backgroundColor: wrap.color }}
                            />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{wrap.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {wrap.type}
                              </div>
                              <div className="text-sm font-bold text-primary">
                                ${wrap.price.toLocaleString()}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <PartSelector
                  parts={paintableParts}
                  selectedPartUuid={selectedPartUuid}
                  onSelectPart={(uuid) => {
                    sceneRef.current?.selectPartForPainting(uuid);
                    // Focus camera on the selected part and lock controls
                    sceneRef.current?.focusPart(uuid);
                    setSelectedPartUuid(uuid);
                    // Actually lock the orbit controls AND the icon
                    setIsCameraLocked(true);
                    sceneRef.current?.setCameraLocked(true);
                    // Let WrapDesigner create the canvas texture when the user starts painting.
                    // Just get any existing texture if there is one (e.g. returning from another part).
                    const tex = sceneRef.current?.getPartCustomTexture(uuid);
                    setCurrentPartTexture(tex || null);
                  }}
                  onRemovePart={(uuid) => {
                    // Clear custom texture for this part and revert to preset
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
                    onBrushColorChange={(hex) => {
                      // Sync 3D paint brush color with WrapDesigner color picker
                      sceneRef.current?.setBrushColor(hex);
                    }}
                    onTextureUpdate={(texture) => {
                      if (selectedPartUuid) {
                        sceneRef.current?.setPartCustomTexture(
                          selectedPartUuid,
                          texture
                        );
                        setCurrentPartTexture(texture);
                      }
                    }}
                  />
                ) : (
                  <Card className="card-glass">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Select a part from the list above to start painting.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Main Preview */}
          <div className="lg:col-span-2">
            <Card className="card-glass h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Preview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="relative rounded-xl overflow-hidden bg-[#1a1a1a]"
                  style={{ height: "460px" }}
                >
                  <ThreeScene
                    ref={sceneRef}
                    onPaintSetChange={handlePaintSetChange}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-white/70 text-sm">Loading model…</p>
                    </div>
                  )}
                  {/* Lock / Unlock toggle button */}
                  <button
                    onClick={() => {
                      const next = !isCameraLocked;
                      setIsCameraLocked(next);
                      sceneRef.current?.setCameraLocked(next);
                      // Unlocking also unselects the current part
                      if (!next) {
                        setSelectedPartUuid(null);
                        setCurrentPartTexture(null);
                        setIsCameraLocked(false);
                      }
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    title={isCameraLocked ? "Unlock camera rotation" : "Lock camera rotation"}
                  >
                    {isCameraLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </div>

                {/* Configuration Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Configuration</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="font-medium">{selectedCar.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{selectedCar.category}</span>
                      </div>
                      {designMode === "preset" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wrap:</span>
                            <span className="font-medium">
                              {selectedWrap.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Finish:</span>
                            <span className="font-medium">
                              {selectedWrap.type}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Design:</span>
                          <span className="font-medium">Custom per‑part</span>
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

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Pricing</h3>
                    <div className="space-y-1 text-sm">
                      {designMode === "preset" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Base Wrap:
                            </span>
                            <span className="font-medium">
                              ${selectedWrap.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Installation:
                            </span>
                            <span className="font-medium">$500</span>
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span className="text-primary">
                                ${(selectedWrap.price + 500).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Custom design:
                          </span>
                          <span className="font-medium">Inquire for price</span>
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
              </div>
            </div>
          </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-hero flex-1">
                    <Quote className="mr-2 w-5 h-5" />
                    Get Official Quote
                  </Button>
                  <Button className="btn-secondary flex-1">
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
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
}
