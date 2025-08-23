"use server";

import prisma from "@/lib/prisma";

export const verifyUser = async (id: string | null | undefined) => {
  try {
    if (!id) {
      return {
        ok: false,
        message: "Usuario no autorizado",
        status: 401,
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        message: "Usuario no encontrado",
        status: 404,
      };
    }

    return {
      ok: true,
      status: 200,
      user,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error al verificar el usuario",
      status: 500,
    };
  }
};
