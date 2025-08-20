"use server";

import prisma from "@/lib/prisma";

export async function getLessonById(id: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        fragments: {
          orderBy: { order: "asc" },
          include: {
            slides: { orderBy: { order: "asc" } },
            videos: { orderBy: { order: "asc" } },
            narrationAudio: true,
          },
        },
      },
    });
    if (!lesson) return { ok: false as const, error: "NOT_FOUND" };
    return { ok: true as const, lesson };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("getLessonById error:", message);
    return { ok: false as const, error: message };
  }
}
