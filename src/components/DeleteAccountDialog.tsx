
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

export default function DeleteAccountDialog() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.email) {
        throw new Error("Authentication error. Please log in again.");
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Delete user from Firebase Auth
      await deleteUser(currentUser);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      
      setOpen(false);
      
      // Logout and redirect to login page
      await logout();
      navigate("/login");
    } catch (error: any) {
      let errorMessage = "Failed to delete account.";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many unsuccessful attempts. Please try again later.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "For security reasons, please log out and log back in before deleting your account.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="mt-4 w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. All your data, including posts, comments, and profile information will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Enter your password to confirm</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete My Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
