
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock, Phone, User, ArrowRight, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Login() {
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const { login, signUp, loginWithGoogle, loginWithApple, sendPhoneVerification, verifyPhoneCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || (!password && !isForgotPassword)) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (isForgotPassword) {
        await resetPassword(email);
        toast({
          title: "Success",
          description: "Password reset email sent. Check your inbox.",
        });
        setIsForgotPassword(false);
        return;
      }
      
      if (isSignUp) {
        if (!name) {
          toast({
            title: "Error",
            description: "Please enter your name",
            variant: "destructive"
          });
          return;
        }
        
        await signUp(email, password, name);
        
        toast({
          title: "Success",
          description: "Account created! Please verify your email before logging in.",
        });
        
        setNeedsVerification(true);
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleLogin() {
    try {
      setLoading(true);
      await loginWithApple();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPhoneVerification() {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      const confirmationResult = await sendPhoneVerification(phoneNumber);
      setVerificationId(confirmationResult.verificationId);
      
      toast({
        title: "Success",
        description: "Verification code sent to your phone",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhoneCode() {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      await verifyPhoneCode(verificationId, verificationCode);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Render verification screen for email signup
  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-amber-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>Please check your email inbox.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => setNeedsVerification(false)} 
              variant="outline" 
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render forgot password screen
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              onClick={() => setIsForgotPassword(false)}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-social-warning to-social-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-social-accent">VortexSocial</h1>
          <p className="text-social-light/80">Connect with friends and the world around you</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{isSignUp ? "Create account" : "Welcome back"}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Fill in your details to get started" 
                : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <CardContent className="space-y-4 pt-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="phone">
              <CardContent className="space-y-4 pt-4">
                {!verificationId ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          placeholder="+1 234 567 8900"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSendPhoneVerification}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Code"}
                    </Button>
                    
                    <div id="recaptcha-container"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <div className="flex justify-center py-4">
                        <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleVerifyPhoneCode}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify Code"}
                    </Button>
                    
                    <p className="text-center text-sm">
                      <button 
                        onClick={() => setVerificationId("")} 
                        className="text-social-primary hover:underline"
                        type="button"
                      >
                        Change phone number
                      </button>
                    </p>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <div className="relative px-6 py-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <CardContent className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full"
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </Button>
            
            <Button
              variant="outline"
              onClick={handleAppleLogin}
              className="w-full"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5557 12.5128C17.5407 10.5956 18.6632 9.2549 20.9132 8.37865C19.7757 6.73615 18.0382 5.84365 15.8057 5.67115C13.6857 5.5049 11.3857 6.9624 10.6932 6.9624C9.96816 6.9624 7.95066 5.7204 6.3057 5.7204C3.36066 5.7689 0.22566 8.12865 0.22566 12.9389C0.22566 14.3209 0.50316 15.7539 1.0582 17.2329C1.79066 19.1921 4.5957 23.9166 7.52316 23.8229C8.97566 23.7756 9.9982 22.7114 11.9107 22.7114C13.7707 22.7114 14.7132 23.8229 16.3957 23.8229C19.3382 23.7756 21.8732 19.5131 22.5582 17.5494C18.6782 15.6974 17.5557 12.5744 17.5557 12.5128V12.5128ZM14.5157 3.76865C16.3582 1.55965 16.2182 0.24115 16.1557 0C15.1057 0.0704 13.8807 0.67615 13.1257 1.4214C12.2982 2.2374 11.7432 3.3004 11.8832 4.76365C13.0207 4.88115 13.9957 4.39115 14.5157 3.76865V3.76865Z" fill="#000"/>
              </svg>
              Apple
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="ml-1 text-social-primary hover:underline"
                type="button"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
            
            {!isSignUp && (
              <button 
                className="mt-2 text-sm text-social-primary hover:underline"
                type="button"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot password?
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
