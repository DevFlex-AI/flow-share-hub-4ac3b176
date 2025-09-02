import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Eye, EyeOff, Mail } from "lucide-react";

const SupabaseLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, signUp, login, loginWithGoogle, resetPassword } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignUp && !name)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password, name);
      } else {
        result = await login(email, password);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      if (isSignUp) {
        toast({
          title: "Success",
          description: "Account created! Please check your email for verification.",
        });
      } else {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let errorMessage = isSignUp 
        ? "Failed to create account. Please try again."
        : "Failed to sign in. Please check your credentials.";
      
      if (error.message) {
        if (error.message.includes('already registered')) {
          errorMessage = "An account with this email already exists.";
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes('too many requests')) {
          errorMessage = "Too many failed attempts. Please try again later.";
        }
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password reset email sent! Check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-social-primary/20 via-social-secondary/20 to-social-accent/20 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-social-primary to-social-accent rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">V</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-social-primary to-social-accent bg-clip-text text-transparent">
            VortexSocial
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={isSignUp ? "signup" : "signin"} className="space-y-4 mt-6">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm text-social-primary hover:text-social-primary/80"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-social-primary to-social-accent hover:from-social-primary/90 hover:to-social-accent/90"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            By continuing, you agree to our{" "}
            <Button variant="link" className="px-0 h-auto text-sm">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="px-0 h-auto text-sm">
              Privacy Policy
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupabaseLogin;