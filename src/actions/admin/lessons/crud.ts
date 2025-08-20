"use server";

import prisma from "@/lib/prisma";

type Container = { containerType: "SEMINAR" | "SERIES"; containerId: string };

export async function createLesson(input: {
  title: string;
  content?: string;
} & Container) {
  try {
    const { containerType, containerId } = input;
    // Determine next order within container
    const orderAgg = await prisma.lesson.aggregate({
      _max: { order: true },
      where:
        containerType === "SEMINAR"
          ? { seminarId: containerId }
          : { seriesId: containerId },
    });
    const nextOrder = (orderAgg._max.order ?? 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        title: input.title,
        content: input.content ?? "Contenido por defecto...",
        order: nextOrder,
        containerType,
        seminarId: containerType === "SEMINAR" ? containerId : null,
        seriesId: containerType === "SERIES" ? containerId : null,
      },
      include: { fragments: true },
    });
    return { ok: true as const, lesson };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("createLesson error:", message);
    return { ok: false as const, error: message };
  }
}

export async function updateLesson(id: string, data: { title?: string; content?: string }) {
  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data,
      include: { fragments: true },
    });
    return { ok: true as const, lesson };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateLesson error:", message);
    return { ok: false as const, error: message };
  }
}

export async function deleteLesson(id: string) {
  try {
    await prisma.lesson.delete({ where: { id } });
    return { ok: true as const, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("deleteLesson error:", message);
    return { ok: false as const, error: message };
  }
}

export async function reorderLessons(input: Container & { orderedIds: string[] }) {
  try {
    const updates = input.orderedIds.map((id, idx) =>
      prisma.lesson.update({ where: { id }, data: { order: idx + 1 } })
    );
    await prisma.$transaction(updates);
    return { ok: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reorderLessons error:", message);
    return { ok: false as const, error: message };
  }
}
