
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4 dark:text-white">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 dark:text-gray-100">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 dark:text-gray-300">
          The page you're looking for doesn't exist or has been moved. 
          Check the URL or try navigating back to the homepage.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              <span>Go to Home</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/explore">
              <Search className="h-4 w-4 mr-2" />
              <span>Explore</span>
            </Link>
          </Button>
          
          <Button 
            variant="link"
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
