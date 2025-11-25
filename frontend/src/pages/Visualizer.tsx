import { useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
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
import { Car, Palette, Layers, Download, Share, Quote } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ---------- 3D Car Viewer ----------
interface CarViewerProps {
  glbPath: string;
  color: string;
  pattern: string;
}

const CarViewer = ({ glbPath, color, pattern }: CarViewerProps) => {
  const { scene } = useGLTF(glbPath);

  // Apply color and simple patterns to all meshes
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color });

      if (pattern === "stripes") {
        child.material.map = new THREE.CanvasTexture(generateStripeTexture());
      } else if (pattern === "carbon") {
        child.material.map = new THREE.CanvasTexture(generateCarbonTexture());
      }
    }
  });

  return <primitive object={scene} scale={0.7} position={[0, -0.5, 0]} />;
};

// ---------- Pattern Textures ----------
const generateStripeTexture = () => {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  for (let i = 0; i < size; i += 40) {
    ctx.fillRect(i, 0, 20, size);
  }
  return canvas;
};

const generateCarbonTexture = () => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#2c2c2c";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#444";
  for (let i = 0; i < size; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  return canvas;
};

// ---------- Car Models ----------
const carModels = [
  // Coupe
  { name: "BMW", category: "Coupe", glbPath: "/coupe/ibmw.glb" },
  { name: "Audi TT", category: "Coupe", glbPath: "/coupe/tt.glb" },
  { name: "Cayenne", category: "Coupe", glbPath: "/coupe/cayene.glb" },
  { name: "M6", category: "Coupe", glbPath: "/coupe/m6.glb" },
  { name: "Porsche 911", category: "Coupe", glbPath: "/coupe/911.glb" },

  // Hatchback
  { name: "Mazda 3", category: "Hatchback", glbPath: "/hatchback/mazda.glb" },

  // Mini SUV
  { name: "Aston DBX", category: "MiniSUV", glbPath: "/minisuv/dbx.glb" },
  { name: "Mercedes GLCC", category: "MiniSUV", glbPath: "/minisuv/glcc.glb" },
  { name: "BMW X3", category: "MiniSUV", glbPath: "/minisuv/x3.glb" },

  // Pickup
  { name: "Ford Raptor", category: "Pickup", glbPath: "/pickup/raptor.glb" },

  // Sedan
  { name: "Mercedes A45", category: "Sedan", glbPath: "/sedan/a45.glb" },
  { name: "BMW M3", category: "Sedan", glbPath: "/sedan/m3.glb" },
  { name: "Mazda Atenza", category: "Sedan", glbPath: "/sedan/atenza.glb" },
  { name: "VW Polo", category: "Sedan", glbPath: "/sedan/polo.glb" },

  // SUV
  { name: "Range Rover 2010", category: "SUV", glbPath: "/suv/2010rr.glb" },
  { name: "G63", category: "SUV", glbPath: "/suv/g63.glb" },
  { name: "G631", category: "SUV", glbPath: "/suv/g631.glb" },
  { name: "Lec", category: "SUV", glbPath: "/suv/lec.glb" },
  { name: "LX", category: "SUV", glbPath: "/suv/lx.glb" },
  { name: "Range Rover Sport", category: "SUV", glbPath: "/suv/rrsport.glb" },
  { name: "BMW X7", category: "SUV", glbPath: "/suv/x7.glb" },
  { name: "XT", category: "SUV", glbPath: "/suv/xt.glb" },
];

// ---------- Wraps ----------
const wrapFinishes = [
  { name: "Matte Black", color: "#1a1a1a", type: "Matte", price: 2800 },
  { name: "Gloss White", color: "#ffffff", type: "Gloss", price: 2500 },
  { name: "Chrome Silver", color: "#c0c0c0", type: "Chrome", price: 4200 },
  { name: "Orange Burst", color: "#ff6b35", type: "Gloss", price: 2700 },
  { name: "Midnight Blue", color: "#191970", type: "Matte", price: 2900 },
  { name: "Racing Red", color: "#dc143c", type: "Gloss", price: 2600 },
  { name: "Forest Green", color: "#355e3b", type: "Matte", price: 2900 },
  { name: "Gold Chrome", color: "#ffd700", type: "Chrome", price: 4500 },
  { name: "Purple Metallic", color: "#663399", type: "Metallic", price: 3200 },
  { name: "Carbon Fiber", color: "#2c2c2c", type: "Textured", price: 3800 },
];

// ---------- Patterns ----------
const patterns = [
  { name: "Solid Color", pattern: "solid" },
  { name: "Carbon Fiber", pattern: "carbon" },
  { name: "Racing Stripes", pattern: "stripes" },
  { name: "Camo", pattern: "camo" },
  { name: "Gradient", pattern: "gradient" },
];

// ---------- Main Visualizer ----------
const Visualizer = () => {
  const [selectedModel, setSelectedModel] = useState(carModels[0]);
  const [selectedWrap, setSelectedWrap] = useState(wrapFinishes[0]);
  const [selectedPattern, setSelectedPattern] = useState(patterns[0]);

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
            wraps, and see it come to life.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="model" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="model">Model</TabsTrigger>
                <TabsTrigger value="wrap">Wrap</TabsTrigger>
              </TabsList>

              {/* Model Selector */}
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
                      value={selectedModel.name}
                      onValueChange={(value) => {
                        const model = carModels.find((m) => m.name === value);
                        if (model) setSelectedModel(model);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {carModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            {model.name} ({model.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wrap Selector */}
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
                      {wrapFinishes.map((wrap) => (
                        <button
                          key={wrap.name}
                          onClick={() => setSelectedWrap(wrap)}
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
                              ${wrap.price}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pattern Selector */}
              <TabsContent value="pattern" className="space-y-4">
                <Card className="card-glass">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="mr-2 w-5 h-5 text-primary" />
                      Pattern Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patterns.map((pattern) => (
                        <button
                          key={pattern.name}
                          onClick={() => setSelectedPattern(pattern)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPattern.name === pattern.name
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium">{pattern.name}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Preview */}
          <div className="lg:col-span-2">
            <Card className="card-glass h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Preview</CardTitle>
                  <div className="flex space-x-2">
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
                {/* 3D Preview */}
                <div className="w-full h-96 rounded-xl overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="text-center mt-20">
                        Loading 3D Model...
                      </div>
                    }
                  >
                    <Canvas>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[5, 5, 5]} intensity={1} />
                      <CarViewer
                        glbPath={selectedModel.glbPath}
                        color={selectedWrap.color}
                        pattern={selectedPattern.pattern}
                      />
                      <OrbitControls enablePan enableZoom enableRotate />
                    </Canvas>
                  </Suspense>
                  {/* Badges */}
                  <Badge
                    className="absolute top-4 right-4 bg-background/90 text-foreground"
                    variant="secondary"
                  >
                    {selectedWrap.type} Finish
                  </Badge>
                  <Badge
                    className="absolute top-4 left-4 bg-background/90 text-foreground"
                    variant="secondary"
                  >
                    {selectedPattern.name}
                  </Badge>
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
