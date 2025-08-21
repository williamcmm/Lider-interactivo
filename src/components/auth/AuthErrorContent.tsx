import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FiAlertTriangle, 
  FiXCircle, 
  FiRefreshCw, 
  FiHome, 
  FiShield,
  FiWifi,
  FiClock,
  FiKey
} from 'react-icons/fi';

// Mapeo de errores de NextAuth
const errorMessages = {
  default: {
    title: "Error de Autenticación",
    description: "Ha ocurrido un error durante el proceso de autenticación. Por favor, inténtalo de nuevo.",
    icon: FiAlertTriangle,
    color: "red"
  },
  configuration: {
    title: "Error de Configuración",
    description: "Hay un problema con la configuración del servidor. Contacta al administrador.",
    icon: FiXCircle,
    color: "red"
  },
  accessdenied: {
    title: "Acceso Denegado",
    description: "No tienes permisos para acceder a esta aplicación.",
    icon: FiShield,
    color: "orange"
  },
  verification: {
    title: "Error de Verificación",
    description: "El enlace de verificación ha expirado o es inválido.",
    icon: FiKey,
    color: "orange"
  },
  timeout: {
    title: "Tiempo Agotado",
    description: "La sesión ha expirado. Por favor, inicia sesión nuevamente.",
    icon: FiClock,
    color: "yellow"
  },
  networkerror: {
    title: "Error de Red",
    description: "No se pudo conectar al servidor. Verifica tu conexión a internet.",
    icon: FiWifi,
    color: "blue"
  },
  three_times: {
    title: "Demasiados Intentos",
    description: "Has sido redirigido varias veces. Por favor, espera unos minutos antes de intentar nuevamente.",
    icon: FiRefreshCw,
    color: "orange"
  },
  middleware_error: {
    title: "Error del Sistema",
    description: "Error interno del sistema. Por favor, inténtalo más tarde.",
    icon: FiXCircle,
    color: "red"
  }
};





export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'default';

  console.error("AuthErrorContent - Error:", error);

  const errorInfo = errorMessages[error as keyof typeof errorMessages] || errorMessages.default;
  const IconComponent = errorInfo.icon;

  const getColorClasses = (color: string) => {
    const colors = {
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-500",
        title: "text-red-800",
        description: "text-red-700",
        button: "bg-red-600 hover:bg-red-700"
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-500",
        title: "text-orange-800",
        description: "text-orange-700",
        button: "bg-orange-600 hover:bg-orange-700"
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: "text-yellow-500",
        title: "text-yellow-800",
        description: "text-yellow-700",
        button: "bg-yellow-600 hover:bg-yellow-700"
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-500",
        title: "text-blue-800",
        description: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700"
      }
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  const colorClasses = getColorClasses(errorInfo.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con icono */}
          <div className={`${colorClasses.bg} ${colorClasses.border} border-b px-6 py-8 text-center`}>
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <IconComponent className={`w-16 h-16 ${colorClasses.icon}`} />
            </div>
            <h1 className={`text-2xl font-bold ${colorClasses.title} mb-2`}>
              {errorInfo.title}
            </h1>
            <p className={`${colorClasses.description} leading-relaxed`}>
              {errorInfo.description}
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Información adicional según el tipo de error */}
            {error === 'three_times' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">¿Qué puedes hacer?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Espera 5 minutos antes de intentar nuevamente</li>
                  <li>• Verifica que tu sesión no esté activa en otra pestaña</li>
                  <li>• Borra las cookies del navegador si persiste el problema</li>
                </ul>
              </div>
            )}

            {error.toLowerCase() === 'configuration' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Información técnica</h3>
                <p className="text-sm text-gray-600">
                  Error de configuración del servidor de autenticación. 
                  Este problema debe ser resuelto por el equipo técnico.
                </p>
              </div>
            )}

            {error === 'networkerror' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Soluciones sugeridas</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Intenta refrescar la página</li>
                  <li>• Revisa si hay restricciones de firewall</li>
                </ul>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className={`inline-flex items-center justify-center w-full px-6 py-3 ${colorClasses.button} text-white font-medium rounded-lg transition-colors duration-200 shadow-sm`}
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Intentar Nuevamente
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                <FiHome className="w-5 h-5 mr-2" />
                Ir al Inicio
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              {/* Código de error para soporte */}
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-500 font-mono">
                Error Code: AUTH_{error.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Líder Interactivo CMM - Sistema de Autenticación</p>
        </div>
      </div>
    </div>
  );
}