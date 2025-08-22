import { Note, SharedNote } from "@/types";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Google provider
const googleProvider = new GoogleAuthProvider();

// Tipos para la aplicación
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
  notes?: Note[];
  sharedNotes?: SharedNote[];
}

export interface AuthSession {
  user: AppUser;
  authenticated: true;
}

// Servicios de autenticación
export const authService = {
  // Login con email/password
  async signInWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(result.user.uid);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Error signing in:", error);
      return {
        success: false,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      };
    }
  },

  // Login con Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verificar si el usuario existe en Firestore
      let userData = await getUserData(user.uid);

      if (!userData) {
        // Crear usuario en Firestore si no existe
        userData = await createUserProfile(user);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return {
        success: false,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      };
    }
  },

  // Registro con email/password
  async signUp(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await createUserProfile(result.user, name);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Error signing up:", error);
      return {
        success: false,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      };
    }
  },

  // Logout
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return {
        success: false,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      };
    }
  },

  // Listener para cambios de autenticación
  onAuthStateChanged(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  },
};

// Función para obtener datos del usuario desde Firestore
async function getUserData(uid: string): Promise<AppUser | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: uid,
        email: data.email,
        name: data.name,
        role: data.role || "USER",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        notes: data.notes || [],
        sharedNotes: data.sharedNotes || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Función para crear perfil de usuario en Firestore
async function createUserProfile(
  firebaseUser: User,
  displayName?: string
): Promise<AppUser> {
  const userData: AppUser = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    name:
      displayName ||
      firebaseUser.displayName ||
      firebaseUser.email!.split("@")[0],
    role: "USER", // Por defecto USER, cambiar manualmente a ADMIN en Firestore
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: [],
    sharedNotes: [],
  };

  try {
    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return userData;
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
    throw error;
  }
}

export { auth, db };
