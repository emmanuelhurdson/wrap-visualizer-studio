import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

const serviceDetails = {
  "vinyl-wraps": {
    title: "Vinyl Wraps",
    price: "From $2,500",
    duration: "2-3 days",
    warranty: "3 years",
    summary: "Full or partial vehicle wraps using premium films for color changes, branded graphics, accents, and custom finishes.",
    points: [
      "Matte, gloss, satin, chrome, metallic, and color-shift finishes",
      "Full body wraps, roof wraps, hood wraps, accents, and decals",
      "Surface prep, panel alignment, post-heating, and edge finishing",
      "Removable film that protects original paint when maintained properly",
    ],
  },
  "paint-protection-film": {
    title: "Paint Protection Film",
    price: "From $1,800",
    duration: "1-2 days",
    warranty: "10 years",
    summary: "Clear protective film for high-impact painted surfaces, designed to defend against chips, road rash, and daily wear.",
    points: [
      "Clear gloss or stealth matte protection",
      "Front bumper, hood, mirrors, rocker panels, and full-body packages",
      "Self-healing top coat for light swirl marks",
      "Excellent for new vehicles and freshly corrected paint",
    ],
  },
  "ceramic-coating": {
    title: "Ceramic Coating",
    price: "From $800",
    duration: "1 day",
    warranty: "5 years",
    summary: "A durable nano-coating that boosts gloss, makes washing easier, and adds chemical and UV resistance.",
    points: [
      "Hydrophobic finish that sheds water and grime",
      "Enhanced gloss and richer paint depth",
      "Works on paint, wheels, trim, and glass packages",
      "Ideal after paint correction or PPF installation",
    ],
  },
  "window-tinting": {
    title: "Window Tinting",
    price: "From $400",
    duration: "Half day",
    warranty: "Lifetime",
    summary: "Premium automotive tint for heat rejection, privacy, UV protection, and a cleaner finished look.",
    points: [
      "Multiple shade levels and film technologies",
      "High UV rejection and improved cabin comfort",
      "Clean edges, dot-matrix care, and proper curing guidance",
      "Available for side, rear, windshield strip, and panoramic glass",
    ],
  },
  "detailing-services": {
    title: "Detailing Services",
    price: "From $200",
    duration: "1-2 days",
    warranty: "30 days",
    summary: "Interior and exterior detailing packages to restore clarity, texture, and finish quality.",
    points: [
      "Foam wash, decontamination, clay treatment, and sealants",
      "Paint correction for swirls, oxidation, and haze",
      "Interior deep cleaning, leather care, and fabric protection",
      "Maintenance details for wrapped, coated, or protected vehicles",
    ],
  },
  "ppf-ceramic-coating": {
    title: "PPF & Ceramic Coating",
    price: "From $2,200",
    duration: "1-3 days",
    warranty: "10 years",
    summary: "A combined protection package pairing impact-resistant film with a slick ceramic top layer.",
    points: [
      "PPF on high-impact panels with ceramic coating over paint and film",
      "Improved washability, gloss, and long-term protection",
      "Great for daily drivers, performance cars, and SUVs",
      "Package options based on driving habits and vehicle exposure",
    ],
  },
  "tint-face-lift": {
    title: "Tint & Face-lift",
    price: "From $400",
    duration: "Half day",
    warranty: "Lifetime",
    summary: "Aesthetic upgrades that sharpen the vehicle stance with tint, trim accents, and visual refresh options.",
    points: [
      "Window tinting, chrome deletes, badges, and trim blackouts",
      "Light smoke accents where legally appropriate",
      "Small changes that make the vehicle look newer and more cohesive",
      "Pairs well with partial wraps and detailing",
    ],
  },
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = serviceDetails[serviceId as keyof typeof serviceDetails];

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
          <Button asChild className="btn-hero">
            <Link to="/services">Back to Services</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/services">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Services
            </Link>
          </Button>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {service.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">{service.summary}</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="card-glass lg:col-span-2">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">What Is Included</h2>
              <div className="space-y-4">
                {service.points.map((point) => (
                  <div key={point} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-8 space-y-6">
              <Badge className="bg-gradient-primary text-primary-foreground">{service.price}</Badge>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="mr-2 w-4 h-4" />
                    Duration
                  </span>
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <ShieldCheck className="mr-2 w-4 h-4" />
                    Warranty
                  </span>
                  <span className="font-medium">{service.warranty}</span>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <Button asChild className="btn-hero w-full">
                  <Link to="/request-quote">Request Quote</Link>
                </Button>
                <Button asChild className="btn-secondary w-full">
                  <Link to="/consultation">Schedule Consultation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
