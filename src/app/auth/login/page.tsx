import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>

        {/* Tarjeta de login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">CMM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-gray-600">
              Inicia sesión en Líder Interactivo CMM
            </p>
          </div>

          <div className="px-8 pb-8">
            {/* Botón de Google */}
            <GoogleLoginButton />

            {/* Formulario de credenciales */}
            <CredentialsForm />

            {/* Link de registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  // onClick={() =>
                  //   alert("Funcionalidad de registro próximamente")
                  // }
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política
            de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
