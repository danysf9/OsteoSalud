import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define global types for the injected variables to avoid TS errors
declare global {
  var __firebase_config: string;
  var __app_id: string | undefined;
}

// Helper to safely parse config or return null if missing
const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error("Error parsing firebase config", e);
  }
  return null;
};

const config = getFirebaseConfig();

// Configuración de producción de OsteoSalud
const firebaseConfig = config || {
  apiKey: "AIzaSyBx7m4z3nVDyNF2Hpp1ZwEGyzu_LkuvDWw",
  authDomain: "osteosalud-eff4d.firebaseapp.com",
  projectId: "osteosalud-eff4d",
  storageBucket: "osteosalud-eff4d.firebasestorage.app",
  messagingSenderId: "613311361832",
  appId: "1:613311361832:web:9e29aacaaee4ea4b71561d",
  measurementId: "G-5958MQ97GF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';