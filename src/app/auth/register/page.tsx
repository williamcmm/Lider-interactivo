
import Link from "next/link";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { FiArrowLeft } from "react-icons/fi";

export default async function RegisterPage() {
  return (
    <div className="h-[100dvh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-start justify-center px-4">
      <div className="w-full max-w-md pt-10 pb-10">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a iniciar sesión
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">CMM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
            <p className="text-gray-600">Regístrate en Líder Interactivo CMM</p>
          </div>

          <div className="px-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <GoogleLoginButton />

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">O crea una cuenta con email</span>
              </div>
            </div>

            <RegistrationForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta? {""}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-800">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}