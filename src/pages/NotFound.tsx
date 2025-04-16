
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Mail, Users, FileText } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        className="text-center max-w-md"
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
            Page Not Found
          </h2>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 mb-8 dark:text-gray-300">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              <span>Go to Home</span>
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button asChild variant="outline">
              <Link to="/explore">
                <Search className="h-4 w-4 mr-2" />
                <span>Explore</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/friends">
                <Users className="h-4 w-4 mr-2" />
                <span>Friends</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/messages">
                <Mail className="h-4 w-4 mr-2" />
                <span>Messages</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/pdf-editor">
                <FileText className="h-4 w-4 mr-2" />
                <span>PDF Editor</span>
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="link"
            onClick={() => navigate(-1)}
            className="w-full mt-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Go Back</span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
