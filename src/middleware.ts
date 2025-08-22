export async function middleware() {
  // Middleware temporalmente deshabilitado para evitar problemas con Firebase Admin
  // La validación se hace completamente en el AdminGuard y useServerAuth
}

export const config = {
  // Temporalmente deshabilitar el matcher para que no intercepte rutas
  matcher: [],
};
