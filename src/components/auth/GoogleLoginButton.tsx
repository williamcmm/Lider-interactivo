'use client';

import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { submitAlert } from '@/utils/alerts';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseLogger } from '@/utils/logger';

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

export function GoogleLoginButton({ disabled = false }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      firebaseLogger.auth("Starting Google login...");
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      firebaseLogger.success("Google login successful:", result.user.uid);
      
      // El hook useFirebaseAuth se encargará del resto automáticamente
      // (sincronización con DB, actualización de estado, etc.)
      
      // Redirigir sin mostrar alerta de éxito
      router.push("/");
      
    } catch (error) {
      firebaseLogger.error("Google login error:", error);
      
      let errorMessage = 'Error al iniciar sesión con Google';

      // Narrow error type to access code/message
      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch ((error as { code: string }).code) {
          case 'auth/operation-not-allowed':
            errorMessage = 'El login con Google no está habilitado. Contacta al administrador.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'El popup fue bloqueado. Permite popups para este sitio.';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'Login cancelado por el usuario.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Solo puede haber un popup de login a la vez.';
            break;
          default:
            errorMessage = (error as { message?: string }).message || 'Error al iniciar sesión con Google';
        }
      } else {
        errorMessage = 'Error al iniciar sesión con Google';
      }
      
      submitAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className="cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
          Conectando...
        </>
      ) : (
        <>
          <FcGoogle className="w-5 h-5 mr-3" />
          Continuar con Google
        </>
      )}
    </button>
  );
}
