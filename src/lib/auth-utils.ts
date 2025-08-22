"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { firebaseLogger, logger } from "@/utils/logger";

/**
 * Obtiene el usuario autenticado actual desde el token de Firebase en las cookies
 * Para uso en Server Actions y API Routes
 */
export async function getCurrentUser() {
  try {
    // Solo log en debug mode para evitar spam en desarrollo
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      firebaseLogger.auth("getCurrentUser called");
    }

    const cookieStore = await cookies();
    const firebaseToken = cookieStore.get("firebase-token")?.value;

    // Debug detallado solo si está habilitado
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      const allCookies = cookieStore.getAll();
      logger.debug(
        "All server cookies:",
        allCookies.map((c) => ({ name: c.name, hasValue: !!c.value }))
      );
    }

    if (!firebaseToken) {
      firebaseLogger.error("No firebase-token cookie found in server");
      return null;
    }

    // Solo mostrar longitud del token en debug mode
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      logger.debug(
        "Firebase token found in server, length:",
        firebaseToken.length
      );
    }

    // Decodificar token JWT básico para obtener el UID
    const tokenParts = firebaseToken.split(".");
    if (tokenParts.length !== 3) {
      firebaseLogger.error("Invalid token format - parts:", tokenParts.length);

      return null;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Solo mostrar payload en debug mode
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      logger.debug("Token payload in server:", {
        email: payload.email,
        uid: payload.user_id,
        exp: payload.exp,
      });
    }

    // Verificar si el token no ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      firebaseLogger.error("Token expired in server", {
        exp: payload.exp,
        now,
      });

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
      },
    });

    if (!user) {
      firebaseLogger.error("User not found in DB for UID:", payload.user_id);
      return null;
    }

    // Solo log de éxito en debug mode para evitar spam
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      firebaseLogger.success("User found in server:", {
        email: user.email,
        role: user.role,
      });
    } else {
      // Log conciso para producción
      firebaseLogger.summary(`Auth: ${user.role} user authenticated`);
    }
    
    return user;
  } catch (error) {
    logger.error("Error getting current user:", error);
    return null;
  }
}
