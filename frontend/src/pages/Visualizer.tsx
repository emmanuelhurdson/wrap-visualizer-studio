import { useRef, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { WrapDesigner } from "@/components/WrapDesigner";
import { PartSelector } from "@/components/PartSelector";
import { CanvasTexture } from "three";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Palette, Download, Share, Quote } from "lucide-react";
import ThreeScene, {
  type ThreeSceneHandle,
  type WrapConfig,
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

type WrapFinish = {
  name: string;
  color: string;
  type: string;
  price: number;
  wrapConfig: WrapConfig;
};

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
    price: 2500,
    wrapConfig: { type: "metallic", color: "#f0f0f0" },
  },
  {
    name: "Chrome Silver",
    color: "#c0c0c0",
    type: "Chrome",
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

  const handlePaintSetChange = (count: number) => {
    if (count === 0) {
      setLoading(true);
    } else {
      setLoading(false);
      if (designMode === "preset") {
        sceneRef.current?.applyWrap(selectedWrapRef.current.wrapConfig);
      }
      refreshParts(); // update part list after paint set changes
    }
  };

  const handleSelectCar = (car: CarModel) => {
    if (car.id === selectedCar.id) return;
    setSelectedCar(car);
    sceneRef.current?.loadCar(car.path);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Vehicle <span className="text-gradient-primary">Visualizer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Customize your vehicle in real-time. Choose your model, select
            wraps, or design your own per‑part custom wrap.
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
                    const tex = sceneRef.current?.getPartCustomTexture(uuid);
                    setCurrentPartTexture(tex || null);
                    setSelectedPartUuid(uuid);
                  }}
                  onRemovePart={(uuid) => {
                    // For simplicity, we clear the whole paint set.
                    // You can implement a more granular remove if desired.
                    sceneRef.current?.clearPaintSet();
                    refreshParts();
                  }}
                />
                {selectedPartUuid ? (
                  <WrapDesigner
                    existingTexture={currentPartTexture}
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
                        </div>
                      )}
                    </div>
                  </div>

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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
