"use server";

import { signIn } from "@/auth.config";
import { AuthError } from "next-auth";

interface Response {
  status: number;
  message: string;
  ok: boolean;
}

export async function authenticate(
  prevState: Response | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
    });
    return {
      status: 200,
      message: "Autenticado",
      ok: true,
    } satisfies Response;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          status: 401,
          message: "Credenciales incorrectas",
          ok: false,
        };
      } else {
        return {
          status: 500,
          message: "Error de autenticación",
          ok: false,
        };
      }
    }
    throw error;
  }
}
