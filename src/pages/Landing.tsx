import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Video, Users, Shield, Zap, Globe, Heart, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Instant Messaging",
      description: "Send messages to anyone, even without the app installed. Cross-platform messaging via SMS fallback."
    },
    {
      icon: Phone,
      title: "Voice Calls",
      description: "Crystal clear voice calls to any phone number worldwide. Internet or cellular, we've got you covered."
    },
    {
      icon: Video,
      title: "Video Calling",
      description: "HD video calls with smart compression. Face-to-face conversations that feel natural."
    },
    {
      icon: Users,
      title: "Group Chats",
      description: "Create groups with up to 1000 people. Manage permissions and stay organized."
    },
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Your messages are private and secure. Only you and the recipient can read them."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with anyone worldwide. No boundaries, no limits, just pure communication."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Business Owner",
      content: "FlowShare has revolutionized how our team communicates. The ability to reach clients even without the app is game-changing.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Remote Worker",
      content: "Best communication app I've used. Video quality is amazing and it works seamlessly across all my devices.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Student",
      content: "Love how I can message anyone with just their phone number. Makes staying in touch with family so much easier.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for personal use",
      features: [
        "Unlimited messaging",
        "Voice calls (100 min/month)",
        "Video calls (50 min/month)",
        "Groups up to 50 people",
        "Basic file sharing"
      ]
    },
    {
      name: "Pro",
      price: "9.99",
      description: "For power users",
      features: [
        "Everything in Free",
        "Unlimited voice calls",
        "Unlimited video calls",
        "Groups up to 500 people",
        "Advanced file sharing",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "19.99",
      description: "For teams and businesses",
      features: [
        "Everything in Pro",
        "Groups up to 1000 people",
        "Admin controls",
        "Analytics dashboard",
        "API access",
        "24/7 support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FlowShare
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Connect Everyone, Everywhere
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            The only communication app you'll ever need. Message, call, and video chat with anyone - 
            even if they don't have the app installed.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/signup">
              <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6">
                Start Messaging Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full md:w-auto text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          
          {/* Hero Image/Demo */}
          <div className="relative mx-auto max-w-3xl">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 backdrop-blur-sm border">
              <div className="bg-background rounded-xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                    <div className="bg-primary/10 rounded-lg px-4 py-2 flex-1">
                      <p className="text-sm">Hey! Just downloaded FlowShare 🚀</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 justify-end">
                    <div className="bg-secondary/10 rounded-lg px-4 py-2">
                      <p className="text-sm">Welcome! Love the interface already 💙</p>
                    </div>
                    <div className="w-8 h-8 bg-secondary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for seamless communication</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10M+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">150+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5B+</div>
              <div className="text-muted-foreground">Messages Sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What People Say</h2>
            <p className="text-xl text-muted-foreground">Join millions of happy users worldwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`border-0 shadow-lg ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''}`}>
                <CardHeader className="text-center pb-2">
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium px-3 py-1 rounded-full mb-4 mx-auto w-fit">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${plan.price}
                    <span className="text-base text-muted-foreground font-normal">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? '' : 'variant-outline'}`}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-12 border">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Connect?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join millions of users who trust FlowShare for their daily communications
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6">
                  Start Free Today
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">FlowShare</span>
              </div>
              <p className="text-muted-foreground">
                Connecting people across the globe with seamless communication.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FlowShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;