"use client";

import { submitAlert } from "@/utils/alerts";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseLogger } from '@/utils/logger';

export function CredentialsForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Prefill once from localStorage on mount
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("auth.remember")
        : null;
    if (raw) {
      const stored = JSON.parse(raw) as { email?: string; remember?: boolean };
      if (stored?.email) setEmail(stored.email);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      // 1. Primero hacer login en el cliente con Firebase Auth
      firebaseLogger.auth("Starting client-side Firebase login...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseLogger.success("Client-side Firebase login successful:", userCredential.user.uid);

      // 2. El hook useFirebaseAuth se encargará del resto automáticamente
      // (sincronización con DB, actualización de estado, etc.)

      // Persist or clear remembered email on successful auth
      if (rememberMe && email) {
        localStorage.setItem(
          "auth.remember",
          JSON.stringify({ email, remember: true })
        );
      } else {
        localStorage.removeItem("auth.remember");
      }

      // Redirigir sin mostrar alerta de éxito
      router.push("/");

    } catch (error) {
      firebaseLogger.error("Login error:", error);
      
      // Manejar errores específicos de Firebase
      let errorMessage = 'Error de autenticación';

      // Narrow error type before accessing properties
      if (typeof error === "object" && error !== null && "code" in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/operation-not-allowed':
            errorMessage = 'El método de autenticación no está habilitado. Contacta al administrador.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico.';
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
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
            errorMessage = firebaseError.message || 'Error de autenticación';
        }
      } else {
        errorMessage = 'Error de autenticación';
      }
      
      submitAlert(errorMessage, "error");
    } finally {
      setIsPending(false);
    }
  };

  // Keep localStorage in sync when user toggles remember or edits email
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem(
        "auth.remember",
        JSON.stringify({ email, remember: true })
      );
    } else {
      localStorage.removeItem("auth.remember");
    }
  }, [rememberMe, email]);
  return (
    <>
      {/* Divisor */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            O continúa con email
          </span>
        </div>
      </div>

      {/* Formulario de credenciales */}
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        {/* Campo de email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email username"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="tu@ejemplo.com"
            />
          </div>
        </div>

        {/* Campo de contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Recordarme y Olvidé contraseña */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Recordarme
            </label>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={() =>
              submitAlert("Funcionalidad de recuperación de contraseña próximamente", "info")
            }
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Botón de login */}
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>
    </>
  );
}
