import Link from 'next/link';
import { FiShield, FiAlertTriangle, FiHome, FiUser, FiLock } from 'react-icons/fi';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono principal */}
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            {/* Escudo de fondo */}
            <FiShield className="w-32 h-32 text-red-200 absolute" />
            {/* Candado central */}
            <FiLock className="w-16 h-16 text-red-500 relative z-10" />
            {/* Triángulo de alerta */}
            <FiAlertTriangle className="w-8 h-8 text-red-600 absolute top-2 right-2 z-20" />
          </div>
        </div>

        {/* Código de error */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-500 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 leading-relaxed">
            No tienes permisos suficientes para acceder a esta sección. 
            Solo los administradores pueden ingresar a esta área.
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiUser className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Permisos Insuficientes</span>
          </div>
          <p className="text-red-700 text-sm">
            Esta página requiere privilegios de administrador. Si crees que esto es un error, 
            contacta con el administrador del sistema.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Ir al Inicio
          </Link>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Necesitas acceso de administrador?{' '}
            <a 
              href="mailto:admin@lider-interactivo.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}