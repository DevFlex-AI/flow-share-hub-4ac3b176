import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJ36ChqE5WKj-peSpU2zU2eLGUQjCZEBQ",
  authDomain: "firea-9dea6.firebaseapp.com",
  projectId: "firea-9dea6",
  storageBucket: "firea-9dea6.firebasestorage.app",
  messagingSenderId: "517517181708",
  appId: "1:517517181708:web:b411d32420d9ed42fcff29",
  measurementId: "G-E3Y8FH0RNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { 
  app, 
  auth, 
  firestore, 
  storage, 
  googleProvider, 
  facebookProvider, 
  appleProvider 
};
