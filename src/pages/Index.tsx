
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Users, Shield, MessageSquare, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!loading && currentUser) {
      navigate("/home");
    }
  }, [currentUser, loading, navigate]);

  const scrollToContent = () => {
    if (landingRef.current) {
      window.scrollTo({
        top: landingRef.current.offsetTop,
        behavior: "smooth"
      });
    }
  };

  // If the user is logged in, we'll redirect them to the home page
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-social-warning to-social-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-social-accent">VortexSocial</h1>
          <p className="text-xl text-social-light/80">Loading your social world...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return null; // Will redirect to home
  }

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?technology,network')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(5px)",
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        ></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-social-accent via-purple-500 to-social-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Welcome to VortexSocial
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            The cybernetic social platform for the digital age
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button 
              onClick={() => navigate("/login")}
              className="bg-social-accent hover:bg-social-accent/90 text-white px-8 py-6 text-lg"
              size="lg"
            >
              Get Started <ArrowRight className="ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={scrollToContent}
              className="border-social-accent text-social-accent hover:bg-social-accent/10 px-8 py-6 text-lg"
              size="lg"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={scrollToContent}
        >
          <ChevronDown className="h-10 w-10 text-social-accent" />
        </motion.div>
      </section>
      
      {/* Features Section with Apple-like Scroll Effects */}
      <section ref={landingRef} className="py-20 bg-gradient-to-b from-social-dark to-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-social-accent to-social-primary">
            Experience the Future of Social Media
          </h2>
          
          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-social-accent">Connect with Everyone</h3>
                <p className="text-gray-300 text-lg mb-6">
                  Build meaningful connections with friends, family, and like-minded individuals from around the world.
                  Our advanced AI-powered recommendations help you find the perfect community.
                </p>
                <div className="flex items-center text-social-primary">
                  <Users className="mr-2" />
                  <span>Global community of millions</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-gradient-to-r from-purple-900 to-social-primary p-1 rounded-lg shadow-xl shadow-purple-500/20">
                  <img 
                    src="https://source.unsplash.com/random/600x400/?social,friends" 
                    alt="Social Connections" 
                    className="rounded-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-social-accent">Express with AI</h3>
                <p className="text-gray-300 text-lg mb-6">
                  Generate stunning, unique images with our integrated Gemini AI technology.
                  Express yourself in ways never before possible with cutting-edge artificial intelligence.
                </p>
                <div className="flex items-center text-social-primary">
                  <Sparkles className="mr-2" />
                  <span>Powered by advanced Gemini AI</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-gradient-to-r from-social-primary to-blue-600 p-1 rounded-lg shadow-xl shadow-blue-500/20">
                  <img 
                    src="https://source.unsplash.com/random/600x400/?ai,digital,art" 
                    alt="AI Generated Content" 
                    className="rounded-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-social-accent">Call with Style</h3>
                <p className="text-gray-300 text-lg mb-6">
                  Experience video calls like never before with Apple-inspired Memoji integration.
                  Add fun filters, backgrounds, and effects to make every conversation memorable.
                </p>
                <div className="flex items-center text-social-primary">
                  <MessageSquare className="mr-2" />
                  <span>Enhanced with Memoji and filters</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-gradient-to-r from-pink-600 to-orange-500 p-1 rounded-lg shadow-xl shadow-pink-500/20">
                  <img 
                    src="https://source.unsplash.com/random/600x400/?video,call,chat" 
                    alt="Video Calling" 
                    className="rounded-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Feature 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-social-accent">Safe Community</h3>
                <p className="text-gray-300 text-lg mb-6">
                  Our platform prioritizes your safety with robust content moderation and easy reporting.
                  Be part of a respectful community where harassment and inappropriate content have no place.
                </p>
                <div className="flex items-center text-social-primary">
                  <Shield className="mr-2" />
                  <span>Protected by advanced moderation</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-gradient-to-r from-teal-600 to-green-500 p-1 rounded-lg shadow-xl shadow-teal-500/20">
                  <img 
                    src="https://source.unsplash.com/random/600x400/?security,privacy" 
                    alt="Community Safety" 
                    className="rounded-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 text-center bg-gradient-to-t from-social-dark to-black">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-social-accent via-purple-500 to-social-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Join the Vortex?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Start connecting with friends, share amazing AI-generated content, and experience the social network of the future.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              onClick={() => navigate("/login")}
              className="bg-social-accent hover:bg-social-accent/90 text-white px-12 py-7 text-xl"
              size="lg"
            >
              Sign Up Now <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-social-dark py-10 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-social-accent">VortexSocial</h2>
              <p className="text-gray-400">© 2025 VortexSocial. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="/privacy-policy" className="text-gray-400 hover:text-social-accent transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-social-accent transition-colors">
                Terms of Service
              </a>
              <a href="/login" className="text-gray-400 hover:text-social-accent transition-colors">
                Login
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
