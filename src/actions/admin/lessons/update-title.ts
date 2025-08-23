"use server";

import prisma from "@/lib/prisma";
import { verifyUser } from "../verify-user";

export async function updateLessonTitle(
  lessonId: string,
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
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title: title.trim() },
      select: { id: true, title: true, updatedAt: true },
    });
    return { ok: true as const, lesson };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateLessonTitle error:", message);
    return { ok: false as const, error: message };
  }
}
