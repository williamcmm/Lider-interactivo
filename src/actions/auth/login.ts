'use server';

import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { syncFirebaseUser } from './firebase-sync';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  try {
    console.log("🔥 Attempting email login for:", email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Sincronizar con la DB
    const syncResult = await syncFirebaseUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || undefined,
    });

    if (syncResult.success && syncResult.user) {
      console.log("✅ Login successful");
      return {
        success: true,
        user: {
          id: syncResult.user.id,
          name: syncResult.user.name,
          email: syncResult.user.email,
          role: syncResult.user.role,
        }
      };
    } else {
      throw new Error(syncResult.error || 'Failed to sync user');
    }
  } catch (error: any) {
    console.error("❌ Login error:", error);
    
    // Manejar errores específicos de Firebase
    let errorMessage = 'Error de autenticación';
    
    switch (error.code) {
      case 'auth/operation-not-allowed':
        errorMessage = 'El método de autenticación no está habilitado. Contacta al administrador.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este correo electrónico.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'El formato del correo electrónico no es válido.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Esta cuenta ha sido deshabilitada.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
        break;
      default:
        errorMessage = error.message || 'Error de autenticación';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function loginWithGoogle(): Promise<LoginResult> {
  try {
    console.log("🔥 Attempting Google login");
    
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;
    
    // Sincronizar con la DB
    const syncResult = await syncFirebaseUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || undefined,
    });

    if (syncResult.success && syncResult.user) {
      console.log("✅ Google login successful");
      return {
        success: true,
        user: {
          id: syncResult.user.id,
          name: syncResult.user.name,
          email: syncResult.user.email,
          role: syncResult.user.role,
        }
      };
    } else {
      throw new Error(syncResult.error || 'Failed to sync user');
    }
  } catch (error: any) {
    console.error("❌ Google login error:", error);
    return {
      success: false,
      error: error.message || 'Google login failed'
    };
  }
}

// Función legacy para mantener compatibilidad temporal
export async function authenticate(
  prevState: any,
  formData: FormData
): Promise<{ status: number; message: string; ok: boolean }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = await loginWithEmail(email, password);
  
  if (result.success) {
    return {
      status: 200,
      message: "Autenticado",
      ok: true,
    };
  } else {
    return {
      status: 401,
      message: result.error || "Error de autenticación",
      ok: false,
    };
  }
}
