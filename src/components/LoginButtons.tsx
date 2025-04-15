
import React from 'react';
import { Button } from "@/components/ui/button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider, githubProvider } from "@/lib/firebase";
import { Github } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple, FaGithub } from "react-icons/fa";

export const GoogleLoginButton = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // The user will be redirected automatically by the AuthContext
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="h-5 w-5" />
      <span>Sign in with Google</span>
    </Button>
  );
};

export const FacebookLoginButton = () => {
  const handleFacebookSignIn = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      // The user will be redirected automatically by the AuthContext
    } catch (error: any) {
      console.error("Facebook auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Facebook. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white"
      onClick={handleFacebookSignIn}
    >
      <FaFacebook className="h-5 w-5" />
      <span>Sign in with Facebook</span>
    </Button>
  );
};

export const AppleLoginButton = () => {
  const handleAppleSignIn = async () => {
    try {
      await signInWithPopup(auth, appleProvider);
      // The user will be redirected automatically by the AuthContext
    } catch (error: any) {
      console.error("Apple auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Apple. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white"
      onClick={handleAppleSignIn}
    >
      <FaApple className="h-5 w-5" />
      <span>Sign in with Apple</span>
    </Button>
  );
};

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
      <FaGithub className="h-5 w-5" />
      <span>Sign in with GitHub</span>
    </Button>
  );
};
