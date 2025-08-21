import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    console.log("🔍 Firebase Middleware ejecutado para:", req.nextUrl.pathname);
    
    // Obtener token de Firebase desde las cookies del request
    const firebaseToken = req.cookies.get('firebase-token')?.value;
    
    if (!firebaseToken) {
      console.log("❌ No Firebase token - redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Por ahora, vamos a usar una validación simple del token
    // En el futuro podemos agregar firebase-admin para validación completa
    try {
      // Decodificar el token JWT básico (sin verificar firma por ahora)
      const tokenParts = firebaseToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("🔍 Token payload:", { email: payload.email, uid: payload.user_id });

      // Verificar si el token no ha expirado
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Token expired');
      }

      // TODO: Validar rol del usuario consultando la DB
      // Por ahora permitimos el acceso si el token es válido
      console.log("✅ Token válido - acceso permitido");
      return NextResponse.next();
      
    } catch (tokenError) {
      console.log("❌ Invalid token:", tokenError);
      return NextResponse.redirect(new URL("/auth/login?error=invalid_token", req.url));
    }
    
  } catch (error) {
    console.error("🚨 Firebase Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=middleware_error", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin"], // Reactivado para validar admin
};
