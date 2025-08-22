"use server";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { syncFirebaseUser } from "./firebase-sync";
import { firebaseLogger } from "@/utils/logger";

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

export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    firebaseLogger.auth("🔥 Attempting email login for:", email);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Sincronizar con la DB
    const syncResult = await syncFirebaseUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || undefined,
    });

    if (syncResult.success && syncResult.user) {
      firebaseLogger.auth("✅ Login successful");
      return {
        success: true,
        user: {
          id: syncResult.user.id,
          name: syncResult.user.name,
          email: syncResult.user.email,
          role: syncResult.user.role,
        },
      };
    } else {
      throw new Error(syncResult.error || "Failed to sync user");
    }
  } catch (error) {
    firebaseLogger.error("❌ Login error:", error);

    // Manejar errores específicos de Firebase
    let errorMessage = "Error de autenticación";

    // Asegurarse de que error es un objeto con 'code' y 'message'
    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string; message?: string };
      switch (firebaseError.code) {
        case "auth/operation-not-allowed":
          errorMessage =
            "El método de autenticación no está habilitado. Contacta al administrador.";
          break;
        case "auth/invalid-credential":
          errorMessage =
            "Credenciales incorrectas. Verifica tu email y contraseña.";
          break;
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este correo electrónico.";
          break;
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta.";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta cuenta ha sido deshabilitada.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde.";
          break;
        default:
          errorMessage = firebaseError.message || "Error de autenticación";
      }
    } else {
      errorMessage =
        typeof error === "string" ? error : "Error de autenticación";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function loginWithGoogle(): Promise<LoginResult> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;

    // Sincronizar con la DB
    const syncResult = await syncFirebaseUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || undefined,
    });

    if (syncResult.success && syncResult.user) {
      return {
        success: true,
        user: {
          id: syncResult.user.id,
          name: syncResult.user.name,
          email: syncResult.user.email,
          role: syncResult.user.role,
        },
      };
    } else {
      throw new Error(syncResult.error || "Failed to sync user");
    }
  } catch (error) {
    console.error("❌ Google login error:", error);
    let errorMessage = "Google login failed";
    if (typeof error === "object" && error !== null && "message" in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Función legacy para mantener compatibilidad temporal
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<{ status: number; message: string; ok: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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
