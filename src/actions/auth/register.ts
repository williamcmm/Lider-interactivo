"use server";

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncFirebaseUser } from './firebase-sync';
import { z } from "zod";

interface Response {
  ok: boolean;
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

const registrationSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Correo inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm: z.string().min(6, "Confirma tu contraseña"),
    terms: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

export async function registerUser(
  _prev: Response | undefined,
  formData: FormData
): Promise<Response> {
  try {
    const raw = Object.fromEntries(formData);
    const parsed = registrationSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return {
        ok: false,
        status: 400,
        message: "Revisa los campos del formulario",
        fieldErrors,
      };
    }

    const { name, email, password, terms } = parsed.data;

    if (typeof terms === "undefined") {
      return {
        ok: false,
        status: 400,
        message: "Debes aceptar los términos y condiciones",
        fieldErrors: { terms: "Debes aceptar los términos y condiciones" },
      };
    }

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Sincronizar con la DB
    const syncResult = await syncFirebaseUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: name,
    });

    if (syncResult.success) {
      return { ok: true, status: 201, message: "Registro exitoso" };
    } else {
      throw new Error(syncResult.error || 'Failed to sync user with database');
    }

  } catch (error: any) {
    console.error("❌ Registration error:", error);
    
    // Manejar errores específicos de Firebase
    let errorMessage = 'Error en el registro';
    
    switch (error.code) {
      case 'auth/operation-not-allowed':
        errorMessage = 'El registro no está habilitado. Contacta al administrador.';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Ya existe una cuenta con este correo electrónico.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'El formato del correo electrónico no es válido.';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Error de conexión. Verifica tu internet.';
        break;
      default:
        errorMessage = error.message || 'Error en el registro';
    }
    
    return {
      ok: false,
      status: 500,
      message: errorMessage
    };
  }
}
