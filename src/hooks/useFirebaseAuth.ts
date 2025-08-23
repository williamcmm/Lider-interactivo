import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { syncFirebaseUser } from "@/actions/auth/firebase-sync";
import { firebaseLogger, logger } from "@/utils/logger";
import { Note, SharedNote } from "@/types";

interface FirebaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  notes: Note[];
  sharedNotes: SharedNote[];
  firebaseUser: User;
}

interface UseFirebaseAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.debug("Current auth state:", auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        logger.debug(
          "FirebaseUser details:",
          firebaseUser
            ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
              }
            : "null"
        );

        if (firebaseUser) {
          logger.debug("Firebase user:", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });

          // Obtener el token de Firebase y guardarlo en cookies con configuración simplificada
          const token = await firebaseUser.getIdToken();

          // Configuración de cookie más simple y robusta
          const isProduction = process.env.NODE_ENV === "production";
          
          // En desarrollo, usar configuración simple
          if (!isProduction) {
            document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
          } else {
            // En producción, ajustar según el protocolo
            const isHTTPS = window.location.protocol === "https:";
            if (isHTTPS) {
              document.cookie = `firebase-token=${token}; path=/; max-age=3600; Secure; SameSite=None`;
            } else {
              document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
            }
          }

          logger.debug("Cookie set with simplified config:", {
            isProduction,
            protocol: window.location.protocol,
            domain: window.location.hostname,
          });

          // Sincronizar usuario con la DB usando Server Action
          const result = await syncFirebaseUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || undefined,
          });

          if (result.success && result.user) {
            setUser({
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
              notes: result.user.notes || [],
              sharedNotes: result.user.sharedNotes || [],
              firebaseUser,
            });
          } else {
            throw new Error(
              result.error || "Failed to sync user with database"
            );
          }
        } else {
          // Limpiar cookie al cerrar sesión
          document.cookie =
            "firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          setUser(null);
        }
      } catch (error) {
        firebaseLogger.error("Auth error:", error);
        setError(error instanceof Error ? error.message : "Auth error");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      firebaseLogger.auth("Cleaning up Firebase Auth listener");
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
