"use server";

import prisma from "@/lib/prisma";

export async function updateLessonTitle(lessonId: string, title: string) {
  try {
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
