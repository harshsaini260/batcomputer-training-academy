import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBo2AbB75E2TWoqcJ0oGhY-fCuga6yCyEI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vision-success-e05b4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vision-success-e05b4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vision-success-e05b4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "689667380328",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:689667380328:web:968bed97f1ed76b89057dd",
  measurementId: "G-SWR4RGTW3T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
