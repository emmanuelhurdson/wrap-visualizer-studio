import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Shield, Sparkles, SunMedium, Droplets } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Palette,
    title: "Vinyl Wraps",
    description: "Transform your vehicle with premium vinyl wraps in endless colors and finishes",
    features: ["Matte, Gloss, Satin finishes", "Color change wraps", "Custom designs"],
    price: "From $2,500"
  },
  {
    icon: Shield,
    title: "PPF & Ceramic Coating",
    description: "Ultimate protection combining Paint Protection Film and Ceramic Coating",
    features: ["Self-healing PPF", "Ceramic top coat", "10-year warranty"],
    price: "From $2,200"
  },
  {
    icon: Droplets,
    title: "Detailing",
    description: "Complete interior and exterior detailing for the perfect finish",
    features: ["Paint correction", "Interior protection", "Maintenance packages"],
    price: "From $200"
  },
  {
    icon: SunMedium,
    title: "Tint & Face-lift",
    description: "Premium window tinting and vehicle appearance enhancement services",
    features: ["99% UV rejection", "Privacy protection", "Aesthetic upgrades"],
    price: "From $400"
  }
];

const ServicesOverview = () => {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            🎨 Premium Services
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Complete <span className="text-gradient-primary">Vehicle Care</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From stunning visual transformations to protective solutions, we offer comprehensive
            services to make your vehicle stand out while preserving its value.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="card-glass group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                  <Button variant="outline" size="sm" className="btn-secondary">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/services">
            <Button className="btn-hero text-lg px-8 py-4">
              Explore All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;