"use server";

import prisma from "@/lib/prisma";

export async function addFragment(lessonId: string) {
  try {
    const agg = await prisma.fragment.aggregate({
      _max: { order: true },
      where: { lessonId },
    });
    const nextOrder = (agg._max.order ?? 0) + 1;

    const fragment = await prisma.fragment.create({
      data: {
        lessonId,
        order: nextOrder,
        readingMaterial: "Nuevo contenido de lectura...",
        studyAids: "Nuevas ayudas de estudio...",
        isCollapsed: false,
        slides: {
          create: [
            {
              title: "Nueva Diapositiva",
              content: "<h2>Título</h2><p>Contenido...</p>",
              order: 1,
            },
          ],
        },
        videos: { create: [] },
      },
      include: { slides: true, videos: true, narrationAudio: true },
    });
    return { ok: true as const, fragment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("addFragment error:", message);
    return { ok: false as const, error: message };
  }
}

export async function updateFragment(
  id: string,
  data: { readingMaterial?: string; studyAids?: string; isCollapsed?: boolean }
) {
  try {
    const fragment = await prisma.fragment.update({
      where: { id },
      data,
      include: { slides: true, videos: true, narrationAudio: true },
    });
    return { ok: true as const, fragment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateFragment error:", message);
    return { ok: false as const, error: message };
  }
}

export async function removeFragment(id: string) {
  try {
    await prisma.fragment.delete({ where: { id } });
    return { ok: true as const, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("removeFragment error:", message);
    return { ok: false as const, error: message };
  }
}

export async function reorderFragments(lessonId: string, orderedIds: string[]) {
  try {
    const updates = orderedIds.map((id, idx) =>
      prisma.fragment.update({ where: { id }, data: { order: idx + 1 } })
    );
    await prisma.$transaction(updates);
    return { ok: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reorderFragments error:", message);
    return { ok: false as const, error: message };
  }
}
