"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

// Create a note for the current authenticated user
export async function createNote(input: {
  content: string;
  contentHtml?: string;
  selectedText?: string;
  fragmentId?: string;
  lessonId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "UNAUTHENTICATED" };

    // Determine type
    const type = input.selectedText ? "SELECTION" : "DIRECT";

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        content: input.content,
        contentHtml: input.contentHtml ?? null,
        selectedText: input.selectedText ?? null,
        type,
        fragmentId: input.fragmentId ?? null,
        lessonId: input.lessonId ?? null,
      },
    });

    return { ok: true as const, note };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("createNote error:", message);
    return { ok: false as const, error: message };
  }
}

// Delete a note owned by the current user
export async function deleteNote(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "UNAUTHENTICATED" };

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== user.id) {
      return { ok: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
    }

    await prisma.note.delete({ where: { id } });
    return { ok: true as const, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("deleteNote error:", message);
    return { ok: false as const, error: message };
  }
}

// Get notes for a fragment for current user
export async function getNotesForFragment(fragmentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: true as const, notes: [] };

    const notes = await prisma.note.findMany({
      where: { fragmentId, userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    return { ok: true as const, notes };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("getNotesForFragment error:", message);
    return { ok: false as const, error: message };
  }
}

// Clear notes for a fragment for current user
export async function clearNotesForFragment(fragmentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "UNAUTHENTICATED" };

    await prisma.note.deleteMany({ where: { fragmentId, userId: user.id } });
    return { ok: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("clearNotesForFragment error:", message);
    return { ok: false as const, error: message };
  }
}
