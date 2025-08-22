'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { firebaseLogger, logger } from '@/utils/logger';

/**
 * Obtiene el usuario autenticado actual desde el token de Firebase en las cookies
 * Para uso en Server Actions y API Routes
 */
export async function getCurrentUser() {
  try {
    firebaseLogger.auth("getCurrentUser called");
    console.log("getCurrentUser called");

    const cookieStore = await cookies();
    const firebaseToken = cookieStore.get('firebase-token')?.value;

    console.log("Cookies:", cookieStore);
    console.log("Firebase token:", cookieStore.get('firebase-token'));

    // Debug: listar todas las cookies
    const allCookies = cookieStore.getAll();
    logger.debug("All server cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    console.log("All server cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    if (!firebaseToken) {
      firebaseLogger.error("No firebase-token cookie found in server");
      console.log("No firebase-token cookie found in server");
      return null;
    }

    logger.debug("Firebase token found in server, length:", firebaseToken.length);
    console.log("Firebase token found in server, length:", firebaseToken.length);

    // Decodificar token JWT básico para obtener el UID
    const tokenParts = firebaseToken.split('.');
    if (tokenParts.length !== 3) {
      firebaseLogger.error("Invalid token format - parts:", tokenParts.length);
      console.log("Invalid token format - parts:", tokenParts.length);
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    logger.debug("Token payload in server:", { email: payload.email, uid: payload.user_id, exp: payload.exp });
    console.log("Token payload in server:", { email: payload.email, uid: payload.user_id, exp: payload.exp });
    
    // Verificar si el token no ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      firebaseLogger.error("Token expired in server", { exp: payload.exp, now });
      console.log("Token expired in server:", { exp: payload.exp, now });
      return null;
    }

    // Buscar usuario en la DB usando el UID de Firebase
    const user = await prisma.user.findUnique({
      where: { firebaseUid: payload.user_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firebaseUid: true,
      }
    });

    if (!user) {
      firebaseLogger.error("User not found in DB for UID:", payload.user_id);
      console.log("User not found:", payload.user_id);
      return null;
    }

    firebaseLogger.success("User found in server:", { email: user.email, role: user.role });
    return user;
  } catch (error) {
    logger.error('Error getting current user:', error);
    return null;
  }
}
