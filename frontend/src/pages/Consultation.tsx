import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";

const Consultation = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="pt-24 pb-12 bg-gradient-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Schedule <span className="text-gradient-primary">Consultation</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Book a session to review finishes, inspect the vehicle, and plan the installation.
        </p>
      </div>
    </section>

    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Calendar className="mr-3 w-6 h-6 text-primary" />
            Appointment Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consult-name">Full Name</Label>
              <Input id="consult-name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consult-phone">Phone</Label>
              <Input id="consult-phone" type="tel" placeholder="Your phone number" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consult-date">Preferred Date</Label>
              <Input id="consult-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consult-vehicle">Vehicle</Label>
            <Input id="consult-vehicle" placeholder="Year, make, model" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consult-notes">What should we prepare?</Label>
            <Textarea id="consult-notes" rows={5} placeholder="Mention services, colors, wraps, protection film, or design references you want to discuss." />
          </div>

          <Button className="btn-hero w-full md:w-auto">Request Consultation</Button>
        </CardContent>
      </Card>
    </main>

    <Footer />
  </div>
);

export default Consultation;
