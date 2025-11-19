import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Target, Heart, Star, Quote } from "lucide-react";

const teamMembers = [
  {
    name: "Alex Rodriguez",
    role: "Founder & Master Installer",
    experience: "15+ years",
    specialty: "Vinyl Wraps & Custom Designs",
    avatar: "👨‍💼"
  },
  {
    name: "Sarah Chen",
    role: "Lead PPF Technician",
    experience: "10+ years",
    specialty: "Paint Protection Film",
    avatar: "👩‍🔧"
  },
  {
    name: "Mike Johnson",
    role: "Ceramic Coating Specialist",
    experience: "8+ years",
    specialty: "Ceramic Coatings & Detailing",
    avatar: "👨‍🔬"
  },
  {
    name: "Jessica Park",
    role: "Design Consultant",
    experience: "6+ years",
    specialty: "Customer Relations & Design",
    avatar: "👩‍🎨"
  }
];

const values = [
  {
    icon: Target,
    title: "Precision",
    description: "Every project is executed with meticulous attention to detail and craftsmanship."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We're automotive enthusiasts who genuinely love transforming vehicles."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We use only premium materials and proven techniques for lasting results."
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your vision drives our work. We listen, collaborate, and deliver beyond expectations."
  }
];

const achievements = [
  { number: "500+", label: "Vehicles Transformed" },
  { number: "5★", label: "Average Customer Rating" },
  { number: "10+", label: "Years in Business" },
  { number: "98%", label: "Customer Satisfaction" }
];

const testimonials = [
  {
    name: "David Wilson",
    text: "Absolutely incredible work! My Tesla looks like it came from the future. The team's attention to detail is unmatched.",
    rating: 5,
    vehicle: "Tesla Model S"
  },
  {
    name: "Maria Garcia",
    text: "The PPF installation was flawless. Six months later, my car still looks brand new despite daily driving.",
    rating: 5,
    vehicle: "BMW M3"
  },
  {
    name: "James Thompson",
    text: "From consultation to completion, the entire process was professional and the results exceeded my expectations.",
    rating: 5,
    vehicle: "Audi R8"
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            About <span className="text-gradient-primary">WrapStudio</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're passionate automotive professionals dedicated to transforming vehicles 
            into works of art while protecting their value for years to come.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <section className="mb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Our Story
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  From Passion to <span className="text-gradient-accent">Perfection</span>
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2014 by automotive enthusiast Alex Rodriguez, WrapStudio began as a 
                  small shop with a big vision: to make vehicle customization accessible to everyone 
                  while maintaining the highest standards of quality and craftsmanship.
                </p>
                <p>
                  What started as a one-person operation has grown into a team of certified specialists, 
                  each bringing unique expertise in vinyl wraps, paint protection films, ceramic coatings, 
                  and automotive detailing. Our commitment to excellence has made us the trusted choice 
                  for vehicle customization in the region.
                </p>
                <p>
                  Today, we've transformed over 500 vehicles, from everyday drivers to exotic supercars, 
                  always with the same attention to detail and passion for perfection that defined our 
                  humble beginnings.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-secondary rounded-2xl flex items-center justify-center text-8xl">
                🏎️
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-4xl">
                ⭐
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">Values</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-glass text-center group hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Meet Our <span className="text-gradient-accent">Team</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Certified professionals with a passion for automotive excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="card-glass text-center group hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-4xl group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Experience</div>
                    <div className="font-medium">{member.experience}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Specialty</div>
                    <div className="font-medium">{member.specialty}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-24">
          <div className="bg-gradient-secondary rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-12">Our Achievements</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index}>
                  <div className="text-4xl lg:text-5xl font-bold text-gradient-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-muted-foreground">{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              What Our <span className="text-gradient-primary">Customers</span> Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from real customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-glass">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.vehicle}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="card-glass p-12">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the WrapStudio difference. Let's bring your vision to life with 
              premium materials, expert craftsmanship, and unmatched customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero text-lg px-8 py-4">
                Schedule Consultation
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                View Our Work
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;