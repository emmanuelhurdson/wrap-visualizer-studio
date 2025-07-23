import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-car.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium wrapped car"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                ⚡ Premium Vehicle Customization
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Transform Your{" "}
                <span className="text-gradient-primary">Vehicle</span> Into Art
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Experience the ultimate in automotive customization with our premium vinyl wraps,
                paint protection films, and ceramic coatings. Make your vision reality.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/visualizer">
                <Button className="btn-hero group">
                  Start Customizing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button className="btn-secondary group">
                <Play className="mr-2 w-5 h-5" />
                Watch Process
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient-primary">500+</div>
                <div className="text-muted-foreground">Vehicles Wrapped</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient-primary">5★</div>
                <div className="text-muted-foreground">Customer Rating</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient-primary">3Y</div>
                <div className="text-muted-foreground">Warranty</div>
              </div>
            </div>
          </div>

          {/* Right side - Empty space for car image visibility */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;