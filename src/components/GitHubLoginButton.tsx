
import React from 'react';
import { Button } from "@/components/ui/button";
import { signInWithPopup } from "firebase/auth";
import { auth, githubProvider } from "@/lib/firebase";
import { Github } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const GitHubLoginButton = () => {
  const handleGitHubSignIn = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      // The user will be redirected automatically by the AuthContext
    } catch (error: any) {
      console.error("GitHub auth error:", error);
      
      let errorMessage = "Failed to sign in with GitHub. Please try again.";
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white border-gray-600"
      onClick={handleGitHubSignIn}
    >
      <Github className="h-5 w-5" />
      <span>Sign in with GitHub</span>
    </Button>
  );
};
