import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Quote } from "lucide-react";

const services = [
  "Vinyl Wrap",
  "Paint Protection Film",
  "Ceramic Coating",
  "Window Tinting",
  "Detailing Services",
  "Custom Design",
];

const RequestQuote = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="pt-24 pb-12 bg-gradient-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Request a <span className="text-gradient-primary">Quote</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Tell us about the vehicle and finish you want. We will prepare a detailed estimate.
        </p>
      </div>
    </section>

    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Quote className="mr-3 w-6 h-6 text-primary" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote-name">Full Name</Label>
              <Input id="quote-name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-phone">Phone</Label>
              <Input id="quote-phone" type="tel" placeholder="Your phone number" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote-email">Email</Label>
              <Input id="quote-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-vehicle">Vehicle</Label>
              <Input id="quote-vehicle" placeholder="2023 BMW M3" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service.toLowerCase().replaceAll(" ", "-")}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-budget">Budget Range</Label>
              <Input id="quote-budget" placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-message">What are you looking for?</Label>
            <Textarea id="quote-message" rows={5} placeholder="Color, finish, timeline, design ideas, and any photos or references you have." />
          </div>

          <Button className="btn-hero w-full md:w-auto">Submit Quote Request</Button>
        </CardContent>
      </Card>
    </main>

    <Footer />
  </div>
);

export default RequestQuote;
