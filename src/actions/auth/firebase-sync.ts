'use server';

import prisma from '@/lib/prisma';
import { Note, SharedNote } from '@/types';
import { firebaseLogger } from '@/utils/logger';
import { dbNoteToUi, dbSharedNoteToUi } from '@/types/db';

interface SyncUserParams {
  uid: string;
  email: string;
  name?: string;
}

interface SyncUserResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    notes: Note[];
    sharedNotes: SharedNote[];
  };
  error?: string;
}

export async function syncFirebaseUser({ uid, email, name }: SyncUserParams): Promise<SyncUserResult> {
  try {
    firebaseLogger.auth("Firebase sync action:", { uid, email, name });

    if (!uid || !email) {
      return {
        success: false,
        error: 'UID and email are required'
      };
    }

    // Buscar usuario existente por Firebase UID
    let user = await prisma.user.findFirst({
      where: { firebaseUid: uid },
      include: {
        notes: true,
        sharedNotes: true,
      },
    });

    if (!user) {
      // Verificar si existe un usuario con el mismo email
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          notes: true,
          sharedNotes: true,
        },
      });

      if (existingUser) {
        // Actualizar el usuario existente con el Firebase UID
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            firebaseUid: uid,
            name: name || existingUser.name,
          },
          include: {
            notes: true,
            sharedNotes: true,
          },
        });
        firebaseLogger.success("Updated existing user with Firebase UID");
      } else {
        // Crear nuevo usuario
        user = await prisma.user.create({
          data: {
            firebaseUid: uid,
            email,
            name: name || email.split('@')[0],
            role: 'USER', // Role por defecto
          },
          include: {
            notes: true,
            sharedNotes: true,
          },
        });
        firebaseLogger.success("Created new user");
      }
    } else {
      // Actualizar información si es necesaria
      if (name && user.name !== name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
          include: {
            notes: true,
            sharedNotes: true,
          },
        });
        firebaseLogger.success("Updated user name");
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        notes: user.notes.map(dbNoteToUi),
        sharedNotes: user.sharedNotes.map(dbSharedNoteToUi),
      }
    };

  } catch (error) {
    firebaseLogger.error("Firebase sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sync error'
    };
  }
}
