"use server";

import prisma from "@/lib/prisma";
import {
  Seminar,
  Fragment as UiFragment,
  Slide as UiSlide,
  Video as UiVideo,
  AudioFile as UiAudioFile,
} from "@/types";
import type { CreationForm } from "@/components/admin/types";

/**
 * Create a Seminar and all nested content using a single Prisma transaction.
 * Accepts either a full Seminar-like payload (from UI state) or a minimal form payload.
 * Returns { ok, seminar?, error? } to keep server-action friendly semantics.
 */
export const createSerieOrSeminar = async (
  data:
    | Seminar
    | ({
        title: string;
        description?: string;
        audioFiles?: UiAudioFile[];
        lessons: {
          title: string;
          order?: number;
          content?: string;
          fragments?: UiFragment[];
        }[];
  } & { type?: "seminar" | "series" })
) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const title = data.title;
      const description = data.description ?? null;
      const audioFiles = data.audioFiles as UiAudioFile[] | undefined;
      const lessonsInput = data.lessons as
        | Seminar["lessons"]
        | {
            title: string;
            order?: number;
            content?: string;
            fragments?: UiFragment[];
          }[];
  const type =
    "type" in data && (data as { type?: "seminar" | "series" }).type
      ? (data as { type?: "seminar" | "series" }).type
      : "seminar";

      // Normalize lessons: ensure order, content, and fragments with defaults
      const normalizedLessons = (lessonsInput ?? []).map((lesson, idx) => {
        const order = lesson.order ?? idx + 1;
        const content = lesson.content ?? "Contenido por defecto...";
        const fragments = lesson.fragments ?? [defaultFragment(1)];
        return { title: lesson.title, order, content, fragments };
      });

      if (type === "series") {
        // Compute unique global order for series
        const aggSeries = await tx.series.aggregate({ _max: { order: true } });
        const nextSeriesOrder = (aggSeries._max.order ?? 0) + 1;

        const createdSeries = await tx.series.create({
          data: {
            title,
            description,
            order: nextSeriesOrder,
            audioFiles:
              audioFiles && audioFiles.length > 0
                ? {
                    create: audioFiles.map((a) => ({
                      name: a.name,
                      url: a.url ?? null,
                      type: mapAudioType(a.type),
                    })),
                  }
                : undefined,
            lessons: {
              create: normalizedLessons.map((l) => ({
                title: l.title,
                content: l.content,
                order: l.order,
                containerType: "SERIES",
                fragments: {
                  create: l.fragments.map((f: UiFragment) => toFragmentCreate(f)),
                },
              })),
            },
          },
          include: {
            audioFiles: true,
            lessons: {
              include: {
                fragments: {
                  include: { slides: true, videos: true, narrationAudio: true },
                },
              },
            },
          },
        });

        return { kind: "series" as const, value: createdSeries };
      } else {
        // Compute unique global order for seminars
        const aggSem = await tx.seminar.aggregate({ _max: { order: true } });
        const nextSeminarOrder = (aggSem._max.order ?? 0) + 1;

        const createdSeminar = await tx.seminar.create({
          data: {
            title,
            description,
            order: nextSeminarOrder,
            audioFiles:
              audioFiles && audioFiles.length > 0
                ? {
                    create: audioFiles.map((a) => ({
                      name: a.name,
                      url: a.url ?? null,
                      type: mapAudioType(a.type),
                    })),
                  }
                : undefined,
            lessons: {
              create: normalizedLessons.map((l) => ({
                title: l.title,
                content: l.content,
                order: l.order,
                containerType: "SEMINAR",
                fragments: {
                  create: l.fragments.map((f: UiFragment) => toFragmentCreate(f)),
                },
              })),
            },
          },
          include: {
            audioFiles: true,
            lessons: {
              include: {
                fragments: {
                  include: { slides: true, videos: true, narrationAudio: true },
                },
              },
            },
          },
        });

        return { kind: "seminar" as const, value: createdSeminar };
      }
    });

    if (result.kind === "series") {
      return {
        ok: true,
        series: result.value,
        message: "Serie creada correctamente",
        status: 201,
      } as const;
    } else {
      return {
        ok: true,
        seminar: result.value,
        message: "Seminario creado correctamente",
        status: 201,
      } as const;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("createSerieOrSeminar error:", message);
    return { ok: false, error: message, status: 500 };
  }
};

/**
 * Convenience wrapper: create a Seminar from the AdminPanel CreationForm.
 * Uses default one-fragment/one-slide seed per lesson like the UI mock.
 */
export const createSeminarFromAdminForm = async (form: CreationForm) => {
  const lessons = (form.lessons ?? []).map((l, idx) => ({
    title: l.title,
    order: l.order ?? idx + 1,
    content: "Contenido por defecto...",
    fragments: [defaultFragment(1)],
  }));

  return createSerieOrSeminar({
    title: form.title,
    description: form.description,
    audioFiles: form.audioFiles,
    lessons,
    type: "seminar",
  });
};

export const createSeriesFromAdminForm = async (form: CreationForm) => {
  const lessons = (form.lessons ?? []).map((l, idx) => ({
    title: l.title,
    order: l.order ?? idx + 1,
    content: "Contenido por defecto...",
    fragments: [defaultFragment(1)],
  }));

  return createSerieOrSeminar({
    title: form.title,
    description: form.description,
    audioFiles: form.audioFiles,
    lessons,
    type: "series",
  });
};

// =============== Helpers ===============

function mapAudioType(t: UiAudioFile["type"]) {
  return t === "local" ? "LOCAL" : ("REMOTE" as const);
}

function toFragmentCreate(fragment: UiFragment) {
  const slides = (fragment.slides ?? []).map((s: UiSlide) => ({
    title: s.title,
    content: s.content,
    order: s.order,
  }));
  const videos = (fragment.videos ?? []).map((v: UiVideo) => ({
    title: v.title,
    youtubeId: v.youtubeId,
    description: v.description ?? null,
    order: v.order,
  }));

  type FragmentCreateInput = {
    order: number;
    readingMaterial: string;
    studyAids: string;
    isCollapsed: boolean;
    slides: { create: { title: string; content: string; order: number }[] };
    videos: { create: { title: string; youtubeId: string; description: string | null; order: number }[] };
    narrationAudio?: {
      create: {
        name: string;
        url: string | null;
        type: string;
      };
    };
  };

  const base: FragmentCreateInput = {
    order: fragment.order,
    readingMaterial: fragment.readingMaterial,
    studyAids: fragment.studyAids ?? "",
    isCollapsed: fragment.isCollapsed ?? false,
    slides: { create: slides },
    videos: { create: videos },
  };

  if (fragment.narrationAudio) {
    base.narrationAudio = {
      create: {
        name: fragment.narrationAudio.name,
        url: fragment.narrationAudio.url ?? null,
        type: mapAudioType(fragment.narrationAudio.type),
      },
    };
  }

  return base;
}

function defaultFragment(order: number): UiFragment {
  return {
    id: `fragment_seed_${Date.now()}_${order}`,
    order,
    readingMaterial: "Contenido de lectura por defecto...",
    studyAids: "Ayudas de estudio por defecto...",
    isCollapsed: false,
    slides: [
      {
        id: `slide_seed_${Date.now()}_${order}_1`,
        order: 1,
        title: "Diapositiva por defecto",
        content:
          "<h2>Título de la diapositiva</h2><p>Contenido de la diapositiva...</p>",
      },
    ],
    videos: [
      {
        id: `video_seed_${Date.now()}_${order}_1`,
        order: 1,
        title: "Video de ejemplo",
        youtubeId: "dQw4w9WgXcQ",
        description: "Descripción del video...",
      },
    ],
    narrationAudio: undefined,
  };
}
