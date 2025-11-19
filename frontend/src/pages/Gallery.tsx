import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Grid, List, Eye } from "lucide-react";
import galleryImage from "@/assets/gallery-showcase.jpg";

const galleryItems = [
  {
    id: 1,
    title: "Matte Black BMW M3",
    category: "Vinyl Wrap",
    service: "Matte Black Full Wrap",
    before: "🚗",
    after: "🖤",
    description: "Complete transformation with premium matte black vinyl wrap",
    price: "$3,200",
    duration: "3 days"
  },
  {
    id: 2,
    title: "Chrome Audi R8",
    category: "Chrome Wrap",
    service: "Chrome Silver Wrap",
    before: "🏎️",
    after: "✨",
    description: "Stunning chrome finish that turns heads everywhere",
    price: "$4,500",
    duration: "4 days"
  },
  {
    id: 3,
    title: "Tesla PPF Protection",
    category: "PPF",
    service: "Full Body Paint Protection",
    before: "⚡",
    after: "🛡️",
    description: "Invisible protection maintaining the original paint",
    price: "$2,800",
    duration: "2 days"
  },
  {
    id: 4,
    title: "Racing Stripes Mustang",
    category: "Custom Design",
    service: "Racing Stripes + Accents",
    before: "🚗",
    after: "🏁",
    description: "Custom racing stripe design with color accents",
    price: "$1,800",
    duration: "2 days"
  },
  {
    id: 5,
    title: "Ceramic Coated Porsche",
    category: "Ceramic Coating",
    service: "Premium Ceramic Coating",
    before: "🚙",
    after: "💎",
    description: "Enhanced gloss and protection with ceramic coating",
    price: "$1,200",
    duration: "1 day"
  },
  {
    id: 6,
    title: "Orange Wrap Lamborghini",
    category: "Vinyl Wrap",
    service: "Gloss Orange Full Wrap",
    before: "🏎️",
    after: "🔥",
    description: "Vibrant orange wrap with gloss finish",
    price: "$3,800",
    duration: "3 days"
  },
  {
    id: 7,
    title: "Tinted Mercedes AMG",
    category: "Window Tint",
    service: "Premium Window Tinting",
    before: "🚗",
    after: "🕶️",
    description: "Privacy tint with UV protection",
    price: "$600",
    duration: "4 hours"
  },
  {
    id: 8,
    title: "Detailed Corvette",
    category: "Detailing",
    service: "Show Car Detail Package",
    before: "🏁",
    after: "⭐",
    description: "Complete paint correction and protection detail",
    price: "$800",
    duration: "2 days"
  }
];

const categories = ["All", "Vinyl Wrap", "PPF", "Ceramic Coating", "Window Tint", "Custom Design", "Chrome Wrap", "Detailing"];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const filteredItems = galleryItems.filter(item => 
    selectedCategory === "All" || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Project <span className="text-gradient-primary">Gallery</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our portfolio of stunning vehicle transformations. From subtle enhancements 
            to complete makeovers, see what's possible for your ride.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid gap-8 mb-16 ${
          viewMode === "grid" 
            ? "md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1 max-w-4xl mx-auto"
        }`}>
          {filteredItems.map((item) => (
            <Card key={item.id} className="card-glass group hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={galleryImage}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  {item.category}
                </Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.service}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                {/* Before/After Visual */}
                <div className="flex items-center justify-center space-x-8 mb-4 p-4 bg-secondary/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{item.before}</div>
                    <div className="text-sm text-muted-foreground">Before</div>
                  </div>
                  <div className="text-primary text-2xl">→</div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{item.after}</div>
                    <div className="text-sm text-muted-foreground">After</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{item.description}</p>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div>
                    <div className="font-medium">Price: <span className="text-primary">{item.price}</span></div>
                    <div className="text-muted-foreground">Duration: {item.duration}</div>
                  </div>
                </div>
                
                <Button className="w-full btn-secondary group">
                  <Eye className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <section className="text-center bg-gradient-secondary rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8">Project Statistics</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-gradient-primary mb-2">500+</div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-primary mb-2">98%</div>
              <div className="text-muted-foreground">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-primary mb-2">50+</div>
              <div className="text-muted-foreground">Vehicle Brands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="card-glass p-12">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who've transformed their vehicles with WrapStudio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero text-lg px-8 py-4">
                Start Your Project
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                Get Free Quote
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;