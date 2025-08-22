"use client";

import Link from 'next/link';
import { FiShield, FiHome, FiUser } from 'react-icons/fi';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono principal */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <FiShield className="w-24 h-24 text-red-400" />
          </div>
        </div>

        {/* Código de error */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-lg">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Link>
          
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiUser className="w-5 h-5 mr-2" />
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}