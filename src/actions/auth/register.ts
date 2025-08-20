"use server";

import prisma from "@/lib/prisma";
import { signIn } from "@/auth.config";
import bcrypt from "bcryptjs";
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        ok: false,
        status: 409,
        message: "Ya existe una cuenta con este correo",
        fieldErrors: { email: "El correo ya está en uso" },
      };
    }

    const hashed = bcrypt.hashSync(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    // Iniciar sesión sin redirigir desde el servidor para evitar NEXT_REDIRECT
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { ok: true, status: 201, message: "Registro exitoso" };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        ok: false,
        status: 409,
        message: "Ya existe una cuenta con este correo",
        fieldErrors: { email: "El correo ya está en uso" },
      };
    }

    console.error("Error en registro: ", error);
    return {
      ok: false,
      status: 500,
      message: "Error interno al registrar usuario",
    };
  }
}
