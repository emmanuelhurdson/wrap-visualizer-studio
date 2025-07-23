import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Shield, Sparkles, SunMedium, Droplets, Clock, Award, Users } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Vinyl Wraps",
    description: "Transform your vehicle with premium vinyl wraps in endless colors and finishes",
    features: ["Matte, Gloss, Satin finishes", "Color change wraps", "Custom designs", "3-5 year durability"],
    price: "From $2,500",
    duration: "2-3 days",
    warranty: "3 years",
    popular: true
  },
  {
    icon: Shield,
    title: "Paint Protection Film",
    description: "Invisible protection that keeps your paint pristine for years to come",
    features: ["Self-healing technology", "UV protection", "Rock chip resistance", "Maintains resale value"],
    price: "From $1,800",
    duration: "1-2 days",
    warranty: "10 years"
  },
  {
    icon: Sparkles,
    title: "Ceramic Coating",
    description: "Advanced nano-coating for ultimate shine and protection",
    features: ["Hydrophobic coating", "Enhanced gloss", "UV protection", "Easy maintenance"],
    price: "From $800",
    duration: "1 day",
    warranty: "5 years"
  },
  {
    icon: SunMedium,
    title: "Window Tinting",
    description: "Premium tints for privacy, comfort, and UV protection",
    features: ["99% UV rejection", "Heat reduction", "Privacy protection", "Lifetime warranty"],
    price: "From $400",
    duration: "Half day",
    warranty: "Lifetime"
  },
  {
    icon: Droplets,
    title: "Detailing Services",
    description: "Complete interior and exterior detailing for the perfect finish",
    features: ["Paint correction", "Interior protection", "Maintenance packages", "Show car finish"],
    price: "From $200",
    duration: "1-2 days",
    warranty: "30 days"
  }
];

const processSteps = [
  {
    step: 1,
    title: "Consultation",
    description: "We discuss your vision, vehicle, and budget to create the perfect plan."
  },
  {
    step: 2,
    title: "Design & Quote",
    description: "Our team creates mockups and provides detailed pricing for your project."
  },
  {
    step: 3,
    title: "Preparation",
    description: "Your vehicle is meticulously cleaned and prepped for installation."
  },
  {
    step: 4,
    title: "Installation",
    description: "Our certified technicians apply your wrap or coating with precision."
  },
  {
    step: 5,
    title: "Quality Check",
    description: "We inspect every detail to ensure perfection before delivery."
  },
  {
    step: 6,
    title: "Delivery",
    description: "Your transformed vehicle is ready with care instructions and warranty."
  }
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Our <span className="text-gradient-primary">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From stunning visual transformations to protective solutions, we offer comprehensive
            services to make your vehicle stand out while preserving its value.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {services.map((service, index) => (
            <Card key={index} className="card-glass group hover:scale-105 transition-all duration-300 relative">
              {service.popular && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration:
                    </span>
                    <span className="font-medium">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Warranty:
                    </span>
                    <span className="font-medium">{service.warranty}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                  <Button variant="outline" size="sm" className="btn-secondary">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-accent">Process</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We follow a proven 6-step process to ensure every project exceeds expectations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="card-glass text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-lg">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="text-center bg-gradient-secondary rounded-2xl p-12 mb-24">
          <h2 className="text-3xl font-bold mb-12">Why Choose WrapStudio?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-gradient-primary mb-2">500+</div>
              <div className="text-muted-foreground">Vehicles Transformed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient-primary mb-2">5★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient-primary mb-2">10+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="card-glass p-12">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Vehicle?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get started with a free consultation and see how we can bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero text-lg px-8 py-4">
                <Users className="mr-2 w-5 h-5" />
                Schedule Consultation
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                Get Instant Quote
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Services;