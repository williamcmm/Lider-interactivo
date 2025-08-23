"use server";

import prisma from "@/lib/prisma";
import { verifyUser } from "./verify-user";

export async function updateSeriesTitle(
  seriesId: string,
  title: string,
  userId: string | null | undefined
) {
  try {
    const { user } = await verifyUser(userId);

    if (!user) {
      return {
        ok: false,
        message: "Usuario no autorizado",
        status: 401,
        type: null,
      };
    }

    if (user.role !== "ADMIN") {
      return {
        ok: false,
        message: "Usuario no autorizado",
        status: 403,
        type: null,
      };
    }
    const series = await prisma.series.update({
      where: { id: seriesId },
      data: { title: title.trim() },
      select: { id: true, title: true, updatedAt: true },
    });
    return { ok: true as const, series };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateSeriesTitle error:", message);
    return { ok: false as const, message: message };
  }
}

export async function updateSeminarTitle(
  seminarId: string,
  title: string,
  userId: string | null | undefined
) {
  try {
    const { user } = await verifyUser(userId);

    if (!user) {
      return {
        ok: false,
        message: "Usuario no autorizado",
        status: 401,
        type: null,
      };
    }

    if (user.role !== "ADMIN") {
      return {
        ok: false,
        message: "Usuario no autorizado",
        status: 403,
        type: null,
      };
    }
    const seminar = await prisma.seminar.update({
      where: { id: seminarId },
      data: { title: title.trim() },
      select: { id: true, title: true, updatedAt: true },
    });
    return { ok: true as const, seminar };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateSeminarTitle error:", message);
    return { ok: false as const, message: message };
  }
}
