"use server";

import prisma from "@/lib/prisma";

export async function updateSeriesTitle(seriesId: string, title: string) {
  try {
    const series = await prisma.series.update({
      where: { id: seriesId },
      data: { title: title.trim() },
      select: { id: true, title: true, updatedAt: true },
    });
    return { ok: true as const, series };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateSeriesTitle error:", message);
    return { ok: false as const, error: message };
  }
}

export async function updateSeminarTitle(seminarId: string, title: string) {
  try {
    const seminar = await prisma.seminar.update({
      where: { id: seminarId },
      data: { title: title.trim() },
      select: { id: true, title: true, updatedAt: true },
    });
    return { ok: true as const, seminar };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("updateSeminarTitle error:", message);
    return { ok: false as const, error: message };
  }
}