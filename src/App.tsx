
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/SupabaseAuthContext";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useState } from "react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import EnhancedHome from "./pages/EnhancedHome";
import SupabaseLogin from "./pages/SupabaseLogin";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import EnhancedMessages from "./pages/EnhancedMessages";
import NotFound from "./pages/NotFound";
import CreatePost from "./pages/CreatePost";
import VideoCall from "./pages/VideoCall";
import LocationShare from "./pages/LocationShare";
import GenerateImage from "./pages/GenerateImage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminDashboard from "./pages/AdminDashboard";
import PDFEditor from "./pages/PDFEditor";
import Explore from "./pages/Explore";
import Friends from "./pages/Friends";
import Call from "./pages/Call";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin route component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, userProfile } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!currentUser || !userProfile?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <>
      {currentUser && <EnhancedNavigation />}
      <Routes>
        <Route path="/" element={!currentUser ? <Landing /> : <Navigate to="/home" replace />} />
        <Route path="/login" element={!currentUser ? <SupabaseLogin /> : <Navigate to="/home" replace />} />
        <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to="/home" replace />} />
        <Route path="/forgot-password" element={!currentUser ? <ForgotPassword /> : <Navigate to="/home" replace />} />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <EnhancedHome />
          </ProtectedRoute>
        } />
        
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <EnhancedMessages />
          </ProtectedRoute>
        } />
        
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
        
        <Route path="/friends" element={
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        } />
        
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        
        <Route path="/video-call" element={
          <ProtectedRoute>
            <VideoCall />
          </ProtectedRoute>
        } />
        
        <Route path="/call" element={
          <ProtectedRoute>
            <Call />
          </ProtectedRoute>
        } />
        
        <Route path="/location-share" element={
          <ProtectedRoute>
            <LocationShare />
          </ProtectedRoute>
        } />
        
        <Route path="/generate-image" element={
          <ProtectedRoute>
            <GenerateImage />
          </ProtectedRoute>
        } />
        
        <Route path="/pdf-editor" element={
          <ProtectedRoute>
            <PDFEditor />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton theme="light" richColors />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
