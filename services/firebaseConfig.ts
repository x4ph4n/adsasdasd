import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD0CBeDLnD4DplZPdDgP8wHsEBrDli5TNg",
  authDomain: "canteen-app-71b0a.firebaseapp.com",
  projectId: "canteen-app-71b0a",
  storageBucket: "canteen-app-71b0a.firebasestorage.app",
  messagingSenderId: "300931863356",
  appId: "1:300931863356:web:259e451f153a2357cac439"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);