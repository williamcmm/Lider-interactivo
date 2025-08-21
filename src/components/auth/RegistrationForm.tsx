"use client";

import React, { useEffect, useState } from "react";
import { useActionState } from "react";
import { registerUser } from "@/actions/auth/register";
import { submitAlert } from "@/utils/alerts";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );
  const router = useRouter();

  useEffect(() => {
    if (state) {
      if (!state.ok) {
        submitAlert(state.message, "error");
      } else {
        // Redirigir sin mostrar alerta de éxito
        router.push("/");
        window.location.reload()
      }
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Nombre */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nombre completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              state?.fieldErrors?.name ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Tu nombre"
          />
        </div>
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
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
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              state?.fieldErrors?.email ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="tu@ejemplo.com"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
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
            className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              state?.fieldErrors?.password
                ? "border-red-400"
                : "border-gray-300"
            }`}
            placeholder="Crea una contraseña"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirmar contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirm"
            name="confirm"
            type={showConfirm ? "text" : "password"}
            required
            className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              state?.fieldErrors?.confirm ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? (
              <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {state?.fieldErrors?.confirm && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.confirm}
          </p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              state?.fieldErrors?.terms ? "border-red-400" : ""
            }`}
          />
        </div>
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          Acepto los términos y condiciones
        </label>
      </div>
      {state?.fieldErrors?.terms && (
        <p className="mt-1 text-sm text-red-600">{state.fieldErrors.terms}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Registrando...
          </>
        ) : (
          <>
            <FiCheckCircle className="w-5 h-5 mr-2" />
            Crear cuenta
          </>
        )}
      </button>
    </form>
  );
}
