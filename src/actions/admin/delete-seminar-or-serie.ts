"use server";

import prisma from "@/lib/prisma";
import { verifyUser } from "./verify-user";

export const deleteSeminarOrSerie = async (id: string, userId: string | null | undefined) => {
  try {
    
    const { user } = await verifyUser(userId);

    if (!user) {
      return {
        ok: false,
        error: "Usuario no autorizado",
        status: 401,
        type: null,
      };
    }

    if (user.role !== "ADMIN") {
      return {
        ok: false,
        error: "Usuario no autorizado",
        status: 403,
        type: null,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const seminar = await tx.seminar.findUnique({ where: { id } });
      if (seminar) {
        await tx.seminar.delete({ where: { id } });
        return { ok: true as const, type: "seminar" as const, id };
      }

      const series = await tx.series.findUnique({ where: { id } });
      if (series) {
        await tx.series.delete({ where: { id } });
        return { ok: true as const, type: "series" as const, id };
      }

      return { ok: false as const, error: "No encontrado" };
    });

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("deleteSeminarOrSerie error:", message);
    return { ok: false as const, error: message };
  }
};
