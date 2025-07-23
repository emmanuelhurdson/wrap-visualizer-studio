import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Palette, Layers, Download, Share, Quote } from "lucide-react";

const carModels = [
  { name: "BMW M3", image: "🏎️", category: "Sports" },
  { name: "Audi R8", image: "🚗", category: "Supercar" },
  { name: "Tesla Model S", image: "⚡", category: "Electric" },
  { name: "Mercedes AMG GT", image: "🏁", category: "Sports" },
  { name: "Porsche 911", image: "🚙", category: "Sports" },
  { name: "Lamborghini Huracan", image: "🏎️", category: "Supercar" },
  { name: "Ford Mustang", image: "🚗", category: "Muscle" },
  { name: "Chevrolet Corvette", image: "🏁", category: "Sports" }
];

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
  { name: "Carbon Fiber", color: "#2c2c2c", type: "Textured", price: 3800 }
];

const patterns = [
  { name: "Solid Color", pattern: "solid" },
  { name: "Carbon Fiber", pattern: "carbon" },
  { name: "Racing Stripes", pattern: "stripes" },
  { name: "Camo", pattern: "camo" },
  { name: "Gradient", pattern: "gradient" }
];

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
            Customize your vehicle in real-time. Choose your model, select wraps, and see your vision come to life.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="model" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="model">Model</TabsTrigger>
                <TabsTrigger value="wrap">Wrap</TabsTrigger>
                <TabsTrigger value="pattern">Pattern</TabsTrigger>
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
                    <Select value={selectedModel.name} onValueChange={(value) => {
                      const model = carModels.find(m => m.name === value);
                      if (model) setSelectedModel(model);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {carModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            {model.image} {model.name} ({model.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {carModels.slice(0, 6).map((model) => (
                        <button
                          key={model.name}
                          onClick={() => setSelectedModel(model)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedModel.name === model.name 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{model.image}</div>
                          <div className="text-sm font-medium">{model.name}</div>
                          <Badge variant="secondary" className="text-xs">{model.category}</Badge>
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
                      {wrapFinishes.map((wrap) => (
                        <button
                          key={wrap.name}
                          onClick={() => setSelectedWrap(wrap)}
                          className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                            selectedWrap.name === wrap.name 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div 
                            className="w-12 h-12 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: wrap.color }}
                          />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{wrap.name}</div>
                            <div className="text-sm text-muted-foreground">{wrap.type}</div>
                            <div className="text-sm font-bold text-primary">${wrap.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
                              ? 'border-primary bg-primary/10' 
                              : 'border-border bg-card hover:border-primary/50'
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
                {/* 3D Preview Area */}
                <div className="relative">
                  <div 
                    className="w-full h-96 rounded-xl flex items-center justify-center text-9xl relative overflow-hidden"
                    style={{ 
                      backgroundColor: selectedWrap.color,
                      boxShadow: `0 25px 50px -12px ${selectedWrap.color}40`,
                      backgroundImage: selectedPattern.pattern === 'stripes' ? 
                        `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)` :
                        selectedPattern.pattern === 'carbon' ?
                        `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                         radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)` :
                        'none'
                    }}
                  >
                    <div className="text-white/20 font-bold transform hover:scale-110 transition-transform">
                      {selectedModel.image}
                    </div>
                    
                    {/* Finish Type Badge */}
                    <Badge 
                      className="absolute top-4 right-4 bg-background/90 text-foreground"
                      variant="secondary"
                    >
                      {selectedWrap.type} Finish
                    </Badge>
                    
                    {/* Pattern Badge */}
                    <Badge 
                      className="absolute top-4 left-4 bg-background/90 text-foreground"
                      variant="secondary"
                    >
                      {selectedPattern.name}
                    </Badge>
                  </div>
                </div>

                {/* Configuration Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Configuration</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="font-medium">{selectedModel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wrap:</span>
                        <span className="font-medium">{selectedWrap.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pattern:</span>
                        <span className="font-medium">{selectedPattern.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Finish:</span>
                        <span className="font-medium">{selectedWrap.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Pricing</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Wrap:</span>
                        <span className="font-medium">${selectedWrap.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installation:</span>
                        <span className="font-medium">$500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pattern Add-on:</span>
                        <span className="font-medium">${selectedPattern.pattern === 'solid' ? 0 : 300}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">
                            ${selectedWrap.price + 500 + (selectedPattern.pattern === 'solid' ? 0 : 300)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
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
};

export default Visualizer;