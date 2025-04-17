
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Mail, Users, FileText, Image, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function NotFound() {
  const navigate = useNavigate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const handleNavigate = (path: string, name: string) => {
    toast.success(`Navigating to ${name}`, {
      description: "Taking you to the requested page",
      icon: "🚀"
    });
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        className="text-center max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="relative w-32 h-32 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 bg-primary/10 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <h1 className="text-6xl font-bold text-primary">404</h1>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 dark:text-gray-100">
            Oops! Page Not Found
          </h2>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 mb-8 dark:text-gray-300">
            We couldn't find the page you're looking for. Don't worry, here are some helpful options to get you back on track.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Popular Destinations</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button asChild className="flex flex-col h-auto py-3" variant="outline" onClick={() => handleNavigate("/", "Home")}>
              <Link to="/">
                <Home className="h-5 w-5 mb-1" />
                <span>Home</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3" variant="outline" onClick={() => handleNavigate("/explore", "Explore")}>
              <Link to="/explore">
                <Search className="h-5 w-5 mb-1" />
                <span>Explore</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3" variant="outline" onClick={() => handleNavigate("/friends", "Friends")}>
              <Link to="/friends">
                <Users className="h-5 w-5 mb-1" />
                <span>Friends</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3" variant="outline" onClick={() => handleNavigate("/messages", "Messages")}>
              <Link to="/messages">
                <Mail className="h-5 w-5 mb-1" />
                <span>Messages</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" variant="outline" onClick={() => handleNavigate("/pdf-editor", "PDF Editor")}>
              <Link to="/pdf-editor">
                <FileText className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">PDF Editor</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3 bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" variant="outline" onClick={() => handleNavigate("/generate-image", "Generate Image")}>
              <Link to="/generate-image">
                <Image className="h-5 w-5 mb-1 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-600 dark:text-purple-400">Generate Image</span>
              </Link>
            </Button>
            
            <Button asChild className="flex flex-col h-auto py-3 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800 col-span-2 sm:col-span-1" variant="outline" onClick={() => handleNavigate("/call", "Call")}>
              <Link to="/call">
                <Phone className="h-5 w-5 mb-1 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">Call</span>
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="default"
            onClick={() => {
              toast.info("Going back", { icon: "↩️" });
              navigate(-1);
            }}
            className="w-full mt-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Go Back</span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
