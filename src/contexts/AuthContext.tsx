import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { auth, firestore, googleProvider, storage } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<any>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<User>;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  updateOnlineStatus: (status: boolean) => Promise<void>;
  deleteUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update online status when window/app focus changes
  useEffect(() => {
    const handleOnline = () => {
      if (currentUser) updateOnlineStatus(true);
    };
    
    const handleOffline = () => {
      if (currentUser) updateOnlineStatus(false);
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleOnline();
      } else {
        handleOffline();
      }
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    if (currentUser) handleOnline();
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (currentUser) handleOffline();
    };
  }, [currentUser]);

  async function signUp(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Create user document in Firestore
    await setDoc(doc(firestore, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      photoURL: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastActive: serverTimestamp(),
      bio: "",
      followers: [],
      following: [],
      notifications: true
    });
    
    await sendVerificationEmail();
  }

  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update online status
    await updateOnlineStatus(true);
    
    return userCredential.user;
  }

  async function loginWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check if it's a new user
    const userDoc = await getDoc(doc(firestore, "users", userCredential.user.uid));
    if (!userDoc.exists()) {
      // Create user document in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isOnline: true,
        lastActive: serverTimestamp(),
        bio: "",
        followers: [],
        following: [],
        notifications: true
      });
    } else {
      // Update online status
      await updateOnlineStatus(true);
    }
    
    return userCredential.user;
  }

  async function sendVerificationEmail() {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  }

  async function logout() {
    await updateOnlineStatus(false);
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(data: any) {
    if (!currentUser) return;
    
    // Update profile in Firebase Auth
    if (data.displayName || data.photoURL) {
      await updateProfile(currentUser, {
        displayName: data.displayName || currentUser.displayName,
        photoURL: data.photoURL || currentUser.photoURL
      });
    }
    
    // Update profile in Firestore
    const userRef = doc(firestore, "users", currentUser.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Update local state
    const updatedUserDoc = await getDoc(userRef);
    setUserProfile(updatedUserDoc.data());
  }

  async function sendPhoneVerification(phoneNumber: string) {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible'
    });
    
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  }

  async function verifyPhoneCode(verificationId: string, code: string) {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithPopup(auth, credential as any);
    
    // Check if it's a new user
    const userDoc = await getDoc(doc(firestore, "users", userCredential.user.uid));
    if (!userDoc.exists()) {
      // Create user document in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        phoneNumber: userCredential.user.phoneNumber,
        displayName: userCredential.user.displayName || "User",
        photoURL: userCredential.user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isOnline: true,
        lastActive: serverTimestamp(),
        bio: "",
        followers: [],
        following: [],
        notifications: true
      });
    } else {
      // Update online status
      await updateOnlineStatus(true);
    }
    
    return userCredential.user;
  }

  async function updateOnlineStatus(status: boolean) {
    if (!currentUser) return;
    
    setIsOnline(status);
    
    const userRef = doc(firestore, "users", currentUser.uid);
    await updateDoc(userRef, {
      isOnline: status,
      lastActive: serverTimestamp()
    });
  }

  async function deleteUserData() {
    if (!currentUser) return;
    
    try {
      // Get all user documents to delete
      const userRef = doc(firestore, "users", currentUser.uid);
      
      // Delete posts
      const postsQuery = query(collection(firestore, "posts"), where("userId", "==", currentUser.uid));
      const postsSnapshot = await getDocs(postsQuery);
      
      const batch = writeBatch(firestore);
      
      // Add posts to batch delete
      postsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete user document
      batch.delete(userRef);
      
      // Commit the batch
      await batch.commit();
      
      // Storage cleanup
      const storageRef = ref(storage, `users/${currentUser.uid}`);
      // This would need recursive delete in a real implementation
      // For simple cases like profile picture:
      const profilePicRef = ref(storage, `users/${currentUser.uid}/profile.jpg`);
      
      try {
        await deleteObject(profilePicRef);
      } catch (error) {
        // Profile pic might not exist, so ignore error
      }
      
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    login,
    loginWithGoogle,
    sendVerificationEmail,
    logout,
    resetPassword,
    updateUserProfile,
    sendPhoneVerification,
    verifyPhoneCode,
    isOnline,
    setIsOnline,
    updateOnlineStatus,
    deleteUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
