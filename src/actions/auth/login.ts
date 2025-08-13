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
      redirect: true,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.log({ error });

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
