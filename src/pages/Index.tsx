
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate("/");
      } else {
        navigate("/login");
      }
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-social-warning to-social-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-social-accent">VortexSocial</h1>
        <p className="text-xl text-social-light/80">Loading your social world...</p>
      </div>
    </div>
  );
};

export default Index;
