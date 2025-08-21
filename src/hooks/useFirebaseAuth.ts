import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { syncFirebaseUser } from '@/actions/auth/firebase-sync';
import { firebaseLogger, logger } from '@/utils/logger';

interface FirebaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  notes: any[];
  sharedNotes: any[];
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
    firebaseLogger.auth("Setting up Firebase Auth listener");
    logger.debug("Current auth state:", auth.currentUser);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        firebaseLogger.auth("Auth state changed:", !!firebaseUser);
        logger.debug("FirebaseUser details:", firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified
        } : 'null');
        
        if (firebaseUser) {
          logger.debug("Firebase user:", { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email 
          });

          // Obtener el token de Firebase y guardarlo en cookies
          const token = await firebaseUser.getIdToken();
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=strict`;

          // Sincronizar usuario con la DB usando Server Action
          const result = await syncFirebaseUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined,
          });

          if (result.success && result.user) {
            firebaseLogger.success("DB User synced:", result.user);
            
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
            throw new Error(result.error || 'Failed to sync user with database');
          }
        } else {
          firebaseLogger.auth("No Firebase user");
          // Limpiar cookie al cerrar sesión
          document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setUser(null);
        }
      } catch (error) {
        firebaseLogger.error("Auth error:", error);
        setError(error instanceof Error ? error.message : 'Auth error');
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
