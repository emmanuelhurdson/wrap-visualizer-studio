import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Car, Palette, Download, Share, Search } from "lucide-react";
import ThreeScene, { type ThreeSceneHandle, type WrapConfig } from "@/components/ThreeScene";
import { CAR_MODELS, CAR_MODELS_BY_CATEGORY, type CarModel } from "@/data/cars";

// ── Category icons ────────────────────────────────────────────────────────────
const CAT_ICON: Record<string, string> = {
  Coupe:      "🏎️",
  Hatchback:  "🚗",
  Pickup:     "🛻",
  Sedan:      "🚘",
  SUV:        "🚐",
  Truck:      "🚚",
  Wagon:      "🚗",
};

// ── Wrap finishes with Three.js WrapConfig mapping ────────────────────────────
type WrapFinish = {
  name:       string;
  color:      string;
  type:       string;
  style:      'solid' | 'shift' | 'pearl' | 'ppf';
  price:      number;
  wrapConfig: WrapConfig;
};

const WRAP_CATEGORIES = ["Gloss", "Satin", "Matte"] as const;
const WRAP_STYLES = ["All", "Solid", "Shift", "Pearl", "PPF"] as const;

type WrapCategory = (typeof WRAP_CATEGORIES)[number];
type WrapStyle = (typeof WRAP_STYLES)[number];

const WRAP_FINISHES: WrapFinish[] = [
  { name: "Gloss White",     color: "#f0f0f0", type: "Gloss", style: "solid", price: 2500, wrapConfig: { type: "metallic", color: "#f0f0f0" } },
  { name: "Gloss Red",       color: "#dc143c", type: "Gloss", style: "solid", price: 2600, wrapConfig: { type: "metallic", color: "#dc143c" } },
  { name: "Gloss Silver",    color: "#c0c0c0", type: "Gloss", style: "shift", price: 4200, wrapConfig: { type: "metallic", color: "#c0c0c0" } },
  { name: "Satin Steel",     color: "#8b8d90", type: "Satin", style: "solid", price: 3000, wrapConfig: { type: "solid", color: "#8b8d90" } },
  { name: "Satin Midnight",  color: "#283149", type: "Satin", style: "solid", price: 3200, wrapConfig: { type: "solid", color: "#283149" } },
  { name: "Satin Pearl",     color: "#e8eaf6", type: "Satin", style: "pearl", price: 3000, wrapConfig: { type: "solid", color: "#e8eaf6" } },
  { name: "Matte Black",     color: "#1a1a1a", type: "Matte", style: "solid", price: 2800, wrapConfig: { type: "solid", color: "#1a1a1a" } },
  { name: "Matte Blue",      color: "#191970", type: "Matte", style: "solid", price: 2900, wrapConfig: { type: "solid", color: "#191970" } },
  { name: "Matte Green",     color: "#355e3b", type: "Matte", style: "solid", price: 2900, wrapConfig: { type: "solid", color: "#355e3b" } },
  { name: "Carbon Fiber",    color: "#2c2c2c", type: "Matte", style: "ppf", price: 3800, wrapConfig: { type: "carbon" } },
];

const TINT_PRESETS = [
  { name: 'Limo Black', color: '#14171d' },
  { name: 'Dark Smoke', color: '#232b34' },
  { name: 'Medium Smoke', color: '#4b5661' },
  { name: 'Light Smoke', color: '#7a8897' },
  { name: 'Ceramic Smoke', color: '#1d232a' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Visualizer = () => {
  const sceneRef = useRef<ThreeSceneHandle>(null);

  // Starts true: ThreeScene auto-loads 911 on mount, wipePaintSet fires first
  const [loading,      setLoading]      = useState(true);
  const [selectedCar,  setSelectedCar]  = useState<CarModel>(CAR_MODELS[0]);
  const [selectedWrap, setSelectedWrap] = useState<WrapFinish>(WRAP_FINISHES[0]);
  const [selectedWrapCategory, setSelectedWrapCategory] = useState<WrapCategory>("Gloss");
  const [selectedWrapStyle, setSelectedWrapStyle] = useState<WrapStyle>("All");
  const [modelSearch, setModelSearch] = useState('');
  const [selectedTintColor, setSelectedTintColor] = useState('#232b34');
  const [activeTintColor, setActiveTintColor] = useState<string | null>(null);

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

  const wrapOptions = WRAP_FINISHES.filter((wrap) =>
    wrap.type === selectedWrapCategory &&
    (selectedWrapStyle === 'All' || wrap.style === selectedWrapStyle.toLowerCase()),
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
    }
  };

  const handleSelectCar = (car: CarModel) => {
    if (car.id === selectedCar.id) return;
    setSelectedCar(car);
    sceneRef.current?.loadCar(car.path);
  };

  const filteredModels = CAR_MODELS.filter((car) =>
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Vehicle <span className="text-gradient-primary">Visualizer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Customize your vehicle in real-time. Choose your model, select
            wraps, and see your vision come to life.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <Card className="card-glass">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Live Preview</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
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
              <div className="relative rounded-xl overflow-hidden bg-[#1a1a1a]" style={{ height: "520px" }}>
                <ThreeScene ref={sceneRef} onPaintSetChange={handlePaintSetChange} />

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-white/70 text-sm">Loading model…</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-glass h-full">
              <Accordion type="single" collapsible className="h-full">
                <AccordionItem value="model" className="h-full rounded-2xl border border-border overflow-hidden">
                  <AccordionTrigger className="px-5">
                    <div className="flex items-center gap-2 py-4 text-base font-medium">
                      <Car className="w-5 h-5 text-primary" />
                      Switch Model
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pt-0">
                    <div className="space-y-6 pb-4">
                      {/* Select dropdown removed — search bar below provides lookup */}

                      <div className="rounded-2xl border border-border p-4 bg-muted/10">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-foreground">Search vehicle</div>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              aria-label="Search cars"
                              placeholder="Search by model or category"
                              value={modelSearch}
                              onChange={(e) => setModelSearch(e.target.value)}
                              className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {filteredModels.length > 0 ? (
                            filteredModels.map((car) => (
                              <button
                                key={car.id}
                                onClick={() => handleSelectCar(car)}
                                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                                  selectedCar.id === car.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card hover:border-primary/50'
                                }`}
                              >
                                {car.name}
                              </button>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground text-center">
                              No matches found. Try a different model name or category.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="card-glass h-full">
              <Accordion type="single" collapsible className="h-full">
                <AccordionItem value="wrap" className="h-full rounded-2xl border border-border overflow-hidden">
                  <AccordionTrigger className="px-5">
                    <div className="flex items-center gap-2 py-4 text-base font-medium">
                      <Palette className="w-5 h-5 text-primary" />
                      Wrap
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pt-0">
                    <div className="space-y-6 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {WRAP_CATEGORIES.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedWrapCategory(category)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              selectedWrapCategory === category
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-card text-muted-foreground hover:border-primary'
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
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              selectedWrapStyle === style
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-card text-muted-foreground hover:border-primary'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {wrapOptions.map((wrap) => (
                          <button
                            key={wrap.name}
                            onClick={() => handleSelectWrap(wrap)}
                            className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                              selectedWrap.name === wrap.name
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:border-primary/50'
                            }`}
                          >
                            <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: wrap.color }} />
                            <div className="text-left">
                              <div className="font-medium">{wrap.name}</div>
                              <div className="text-sm text-muted-foreground">{wrap.type}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            <Card className="card-glass h-full">
              <Accordion type="single" collapsible className="h-full">
                <AccordionItem value="tint" className="h-full rounded-2xl border border-border overflow-hidden">
                  <AccordionTrigger className="px-5">
                    <div className="flex items-center gap-2 py-4 text-base font-medium">
                      <Palette className="w-5 h-5 text-primary" />
                      Tint
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pt-0">
                    <div className="space-y-6 pb-4">
                      <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-6">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-foreground">Window tint</div>
                          <div className="text-sm text-muted-foreground">
                            Select authentic automotive window tint shades. No generic wrap colors.
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {TINT_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => setSelectedTintColor(preset.color)}
                              className={`flex items-center justify-between rounded-full border px-4 py-3 text-sm font-medium transition ${
                                selectedTintColor === preset.color
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              <span>{preset.name}</span>
                              <span
                                className="inline-block h-4 w-10 rounded-full border border-border"
                                style={{ backgroundColor: preset.color }}
                              />
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button className="w-full btn-secondary" onClick={handleApplyTint}>
                            Apply Tint
                          </Button>
                          <Button variant="outline" className="w-full" onClick={handleResetTint}>
                            Clear Tint
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Tint is applied to windows and glass surfaces only. Wrap finishes stay unchanged.
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Vehicle</span>
                    <span className="font-medium text-foreground">{selectedCar.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category</span>
                    <span className="font-medium text-foreground">{selectedCar.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wrap</span>
                    <span className="font-medium text-foreground">{selectedWrap.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finish</span>
                    <span className="font-medium text-foreground">{selectedWrap.type}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Visualizer;
