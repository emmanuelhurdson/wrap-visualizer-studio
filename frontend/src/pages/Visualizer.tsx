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
import { Car, Palette } from "lucide-react";
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
  price:      number;
  wrapConfig: WrapConfig;
};

const WRAP_CATEGORIES = ["Gloss", "Satin", "Matte"] as const;

type WrapCategory = (typeof WRAP_CATEGORIES)[number];

const WRAP_FINISHES: WrapFinish[] = [
  { name: "Gloss White",     color: "#f0f0f0", type: "Gloss", price: 2500, wrapConfig: { type: "metallic", color: "#f0f0f0" } },
  { name: "Gloss Red",       color: "#dc143c", type: "Gloss", price: 2600, wrapConfig: { type: "metallic", color: "#dc143c" } },
  { name: "Gloss Silver",    color: "#c0c0c0", type: "Gloss", price: 4200, wrapConfig: { type: "metallic", color: "#c0c0c0" } },
  { name: "Satin Steel",     color: "#8b8d90", type: "Satin", price: 3000, wrapConfig: { type: "solid", color: "#8b8d90" } },
  { name: "Satin Midnight",  color: "#283149", type: "Satin", price: 3200, wrapConfig: { type: "solid", color: "#283149" } },
  { name: "Satin Pearl",     color: "#e8eaf6", type: "Satin", price: 3000, wrapConfig: { type: "solid", color: "#e8eaf6" } },
  { name: "Matte Black",     color: "#1a1a1a", type: "Matte", price: 2800, wrapConfig: { type: "solid", color: "#1a1a1a" } },
  { name: "Matte Blue",      color: "#191970", type: "Matte", price: 2900, wrapConfig: { type: "solid", color: "#191970" } },
  { name: "Matte Green",     color: "#355e3b", type: "Matte", price: 2900, wrapConfig: { type: "solid", color: "#355e3b" } },
  { name: "Carbon Fiber",    color: "#2c2c2c", type: "Matte", price: 3800, wrapConfig: { type: "carbon" } },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Visualizer = () => {
  const sceneRef = useRef<ThreeSceneHandle>(null);

  // Starts true: ThreeScene auto-loads 911 on mount, wipePaintSet fires first
  const [loading,      setLoading]      = useState(true);
  const [selectedCar,  setSelectedCar]  = useState<CarModel>(CAR_MODELS[0]);
  const [selectedWrap, setSelectedWrap] = useState<WrapFinish>(WRAP_FINISHES[0]);
  const [selectedWrapCategory, setSelectedWrapCategory] = useState<WrapCategory>("Gloss");
  const [customColor, setCustomColor]   = useState('#ff3b30');

  const customColorWrap: WrapFinish = {
    name: 'Custom Color',
    color: customColor,
    type: 'Matte',
    price: 0,
    wrapConfig: { type: 'solid', color: customColor },
  };

  const handleSelectCustomColor = (): void => {
    const wrap = { ...customColorWrap, wrapConfig: { type: 'solid', color: customColor } };
    setSelectedWrap(wrap);
    if (!loading) sceneRef.current?.applyWrap(wrap.wrapConfig);
  };

  const wrapOptions = WRAP_FINISHES.filter((wrap) => wrap.type === selectedWrapCategory);

  // Stable ref so onPaintSetChange closure always reads the latest wrap
  const selectedWrapRef = useRef(selectedWrap);
  selectedWrapRef.current = selectedWrap;

  // Called by ThreeScene whenever the paint-panel set changes:
  //   count === 0  → wipePaintSet ran (new model starting)
  //   count  > 0  → model loaded + auto-detected, ready to apply wrap
  const handlePaintSetChange = (count: number) => {
    if (count === 0) {
      setLoading(true);
    } else {
      setLoading(false);
      sceneRef.current?.applyWrap(selectedWrapRef.current.wrapConfig);
    }
  };

  const handleSelectCar = (car: CarModel) => {
    if (car.id === selectedCar.id) return;
    setSelectedCar(car);
    sceneRef.current?.loadCar(car.path);
  };

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

              <div className="rounded-2xl border border-border bg-muted/10 p-5">
              <h3 className="font-bold text-lg mb-4">Configuration</h3>
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
            </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 w-5 h-5 text-primary" />
                    Switch Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
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
                        {Array.from(CAR_MODELS_BY_CATEGORY.entries()).map(([category, cars]) => (
                          <SelectGroup key={category}>
                            <SelectLabel>{category}</SelectLabel>
                            {cars.map((car) => (
                              <SelectItem key={car.id} value={car.id}>
                                {CAT_ICON[car.category] ?? "🚗"} {car.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="rounded-2xl border border-border p-4 bg-muted/10">
                      {Array.from(CAR_MODELS_BY_CATEGORY.entries()).map(([category, cars]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <div className="text-sm font-semibold text-foreground mb-3">{category}</div>
                          <div className="grid grid-cols-1 gap-2">
                            {cars.map((car) => (
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
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 w-5 h-5 text-primary" />
                    Wrap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-2 flex-wrap">
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
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 w-5 h-5 text-primary" />
                    Tint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-muted/10 p-4">
                      <div className="text-sm font-semibold text-muted-foreground mb-3">
                        Full color wheel
                      </div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="h-12 w-12 rounded-lg border border-border p-0"
                        />
                        <div className="flex-1 text-sm text-muted-foreground">
                          Choose a hue to tint the wrap without changing the section layout.
                        </div>
                      </div>
                    </div>

                    <Button className="w-full btn-secondary" onClick={handleSelectCustomColor}>
                      Apply Tint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Visualizer;
