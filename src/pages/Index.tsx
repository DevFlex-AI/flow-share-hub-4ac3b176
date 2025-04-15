
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-social-primary">UwuSocial</h1>
        <p className="text-xl text-gray-600">Loading your social world...</p>
      </div>
    </div>
  );
};

export default Index;
