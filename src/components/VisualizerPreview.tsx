import { useState } from "react";
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
import { ArrowRight, Palette, Car as CarIcon } from "lucide-react";
import { Link } from "react-router-dom";

const carModels = [
  { name: "BMW M3", image: "🏎️" },
  { name: "Audi R8", image: "🚗" },
  { name: "Tesla Model S", image: "⚡" },
  { name: "Mercedes AMG", image: "🏁" },
  { name: "Porsche 911", image: "🚙" },
];

const wrapFinishes = [
  { name: "Matte Black", color: "#1a1a1a", type: "Matte" },
  { name: "Gloss White", color: "#ffffff", type: "Gloss" },
  { name: "Chrome Silver", color: "#c0c0c0", type: "Chrome" },
  { name: "Orange Burst", color: "#ff6b35", type: "Gloss" },
  { name: "Midnight Blue", color: "#191970", type: "Matte" },
  { name: "Racing Red", color: "#dc143c", type: "Gloss" },
];

const VisualizerPreview = () => {
  const [selectedModel, setSelectedModel] = useState(carModels[0]);
  const [selectedWrap, setSelectedWrap] = useState(wrapFinishes[0]);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Preview Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
                🎨 Live Visualizer
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                See Your Vision{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Come to Life
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Our interactive visualizer lets you customize your vehicle in
                real-time. Choose your model, select wraps, and see instant
                results.
              </p>
            </div>

            {/* Preview Container */}
            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  {/* Car Display */}
                  <div
                    className="w-full h-64 rounded-xl flex items-center justify-center text-8xl relative"
                    style={{
                      backgroundColor: selectedWrap.color,
                      boxShadow: `0 25px 50px -12px ${selectedWrap.color}40`,
                    }}
                  >
                    <div className="text-white/20 font-bold">
                      {selectedModel.image}
                    </div>
                    {/* Finish Type Badge */}
                    <Badge
                      className="absolute top-4 right-4 bg-background/90 text-foreground backdrop-blur-sm"
                      variant="secondary"
                    >
                      {selectedWrap.type} Finish
                    </Badge>
                  </div>

                  {/* Current Selection Info */}
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {selectedModel.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedWrap.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        $3,200
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Price
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-8">
            {/* Car Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-primary" />
                  <span>Select Vehicle</span>
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
                        <span className="mr-2">{model.image}</span>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Wrap Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <span>Choose Wrap</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {wrapFinishes.map((wrap) => (
                    <button
                      key={wrap.name}
                      onClick={() => setSelectedWrap(wrap)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 flex flex-col ${
                        selectedWrap.name === wrap.name
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-md mb-2 border"
                        style={{ backgroundColor: wrap.color }}
                      />
                      <div className="text-sm font-medium text-left">
                        {wrap.name}
                      </div>
                      <div className="text-xs text-muted-foreground text-left">
                        {wrap.type}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link to="/visualizer" className="block">
                <Button className="w-full">
                  Open Full Visualizer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" className="w-full">
                Get Instant Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualizerPreview;
