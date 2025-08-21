'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * Obtiene el usuario autenticado actual desde el token de Firebase en las cookies
 * Para uso en Server Actions y API Routes
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const firebaseToken = cookieStore.get('firebase-token')?.value;
    
    if (!firebaseToken) {
      return null;
    }

    // Decodificar token JWT básico para obtener el UID
    const tokenParts = firebaseToken.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Verificar si el token no ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
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

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
