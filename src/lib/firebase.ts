
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAovfTZVrCd61c-0f0jsqm2574vCSFHtPw",
  authDomain: "my-awsome-app-96444.firebaseapp.com",
  projectId: "my-awsome-app-96444",
  storageBucket: "my-awsome-app-96444.firebasestorage.app",
  messagingSenderId: "819352555411",
  appId: "1:819352555411:web:0b1da0d54fcdf8b4c32266",
  measurementId: "G-BG0E3SM48K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const githubProvider = new GithubAuthProvider();

export { 
  app, 
  auth, 
  firestore, 
  storage, 
  googleProvider, 
  facebookProvider, 
  appleProvider,
  githubProvider,
  analytics
};
