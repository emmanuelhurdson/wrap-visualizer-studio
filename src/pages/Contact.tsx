import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, MessageCircle, Calendar, Quote } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone",
    details: "(555) 123-WRAP",
    subtitle: "Call us anytime",
    action: "Call Now"
  },
  {
    icon: Mail,
    title: "Email",
    details: "info@wrapstudio.com",
    subtitle: "Send us a message",
    action: "Email Us"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    details: "Available 9 AM - 6 PM",
    subtitle: "Instant support",
    action: "Start Chat"
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    details: "Free consultation",
    subtitle: "Schedule a visit",
    action: "Book Now"
  }
];

const businessHours = [
  { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
  { day: "Sunday", hours: "Closed" }
];

const services = [
  "Vinyl Wrap",
  "Paint Protection Film",
  "Ceramic Coating",
  "Window Tinting",
  "Detailing Services",
  "Custom Design",
  "Other"
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Get In <span className="text-gradient-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your vehicle? We're here to help bring your vision to life. 
            Contact us for a free consultation and detailed quote.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="card-glass text-center group hover:scale-105 transition-all cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <method.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{method.details}</div>
                  <div className="text-sm text-muted-foreground">{method.subtitle}</div>
                  <Button className="btn-secondary w-full mt-4">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Quote className="mr-3 w-6 h-6 text-primary" />
                  Request a Quote
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours with a detailed quote.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle Year, Make, Model</Label>
                    <Input id="vehicle" placeholder="2023 BMW M3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Interested In</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service.toLowerCase()}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Project Details</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your vision, preferred colors, timeline, budget, or any specific requirements..."
                    rows={4}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-hero flex-1">
                    Submit Quote Request
                  </Button>
                  <Button className="btn-secondary flex-1">
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Location & Hours */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 w-5 h-5 text-primary" />
                  Location & Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium mb-2">WrapStudio</div>
                  <div className="text-muted-foreground">
                    123 Auto Boulevard<br />
                    Las Vegas, NV 89101<br />
                    United States
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">Business Hours</span>
                  </div>
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{schedule.day}</span>
                      <span className="font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full btn-secondary">
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Quick Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium mb-1">How long does a wrap take?</div>
                  <div className="text-sm text-muted-foreground">
                    Most full wraps take 2-3 days, depending on complexity.
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Do you offer warranties?</div>
                  <div className="text-sm text-muted-foreground">
                    Yes! We provide 3-10 year warranties depending on the service.
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Can I see my car before deciding?</div>
                  <div className="text-sm text-muted-foreground">
                    Absolutely! We offer free consultations with mockups.
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Do you work on all vehicle types?</div>
                  <div className="text-sm text-muted-foreground">
                    Yes, from economy cars to exotic supercars.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="card-glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent inquiries or same-day service needs, call our priority line.
                </p>
                <Button className="w-full btn-hero">
                  <Phone className="mr-2 w-4 h-4" />
                  (555) 123-RUSH
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;