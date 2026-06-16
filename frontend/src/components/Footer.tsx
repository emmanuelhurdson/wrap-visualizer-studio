import { Car, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">Wrap Studio</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Transform your vehicle with premium wraps, protection films, and detailing services. 
              Your vision, our expertise.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Vinyl Wraps</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Paint Protection Film</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Ceramic Coating</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Window Tinting</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Detailing</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/visualizer" className="text-muted-foreground hover:text-primary transition-colors">Visualizer</Link></li>
              <li><Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Warranty</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-3 text-primary" />
                <span>+254792391610</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-3 text-primary" />
                <span>wrapndrive@gmail.com</span>
              </div>
              <div className="flex items-start text-muted-foreground">
                <MapPin className="w-4 h-4 mr-3 text-primary mt-0.5" />
                <span>Thome<br />Nothern ByPass, Opposite Quickmart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Wrap Studio. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;