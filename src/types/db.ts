// Reusable DB payload shapes matching our Prisma includes

export type DbSlide = { id: string; title: string; content: string; order: number };
export type DbVideo = {
  id: string;
  title: string;
  youtubeId: string;
  description: string | null;
  order: number;
};
export type DbAudio = { id: string; name: string; url: string | null; type: string | null };

export type DbFragment = {
  id: string;
  order: number;
  readingMaterial: string;
  studyAids: string;
  isCollapsed?: boolean | null;
  slides: DbSlide[];
  videos: DbVideo[];
  narrationAudio: DbAudio | null;
};

export type DbLesson = {
  id: string;
  title: string;
  content: string;
  order: number;
  fragments: DbFragment[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export type DbSeminar = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  audioFiles: DbAudio[];
  lessons: DbLesson[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export type DbSeries = DbSeminar;

// Variant used by getLessonById that may include container pointers and enum
export type DbLessonWithContainer = DbLesson & {
  seminarId?: string | null;
  seriesId?: string | null;
  containerType?: 'SEMINAR' | 'SERIES';
};

// ===================== MAPPERS TO UI TYPES =====================
import type {
  AudioFile as UiAudioFile,
  Slide as UiSlide,
  Video as UiVideo,
  Fragment as UiFragment,
  Lesson as UiLesson,
  Seminar as UiSeminar,
  Series as UiSeries,
} from '@/types';

export const mapAudioTypeToUi = (t: unknown): UiAudioFile['type'] =>
  String(t ?? '').toLowerCase() === 'local' ? 'local' : 'remote';

export const dbSlideToUi = (sl: DbSlide): UiSlide => ({
  id: sl.id,
  title: sl.title,
  content: sl.content,
  order: sl.order,
});

export const dbVideoToUi = (v: DbVideo): UiVideo => ({
  id: v.id,
  title: v.title,
  youtubeId: v.youtubeId,
  description: v.description ?? undefined,
  order: v.order,
});

export const dbFragmentToUi = (f: DbFragment): UiFragment => ({
  id: f.id,
  order: f.order,
  readingMaterial: f.readingMaterial,
  slides: (f.slides ?? [])
    .sort((a, b) => a.order - b.order)
    .map(dbSlideToUi),
  videos: (f.videos ?? [])
    .sort((a, b) => a.order - b.order)
    .map(dbVideoToUi),
  studyAids: f.studyAids,
  narrationAudio: f.narrationAudio
    ? {
        id: f.narrationAudio.id,
        name: f.narrationAudio.name,
        url: f.narrationAudio.url ?? undefined,
        type: mapAudioTypeToUi(f.narrationAudio.type),
      }
    : undefined,
  isCollapsed: f.isCollapsed ?? false,
});

export const dbLessonToUi = (
  l: DbLesson,
  containerId: string,
  containerType: UiLesson['containerType']
): UiLesson => ({
  id: l.id,
  title: l.title,
  content: l.content,
  containerId,
  containerType,
  order: l.order,
  fragments: (l.fragments ?? [])
    .sort((a, b) => a.order - b.order)
    .map(dbFragmentToUi),
  createdAt: l.createdAt ? new Date(l.createdAt) : undefined,
  updatedAt: l.updatedAt ? new Date(l.updatedAt) : undefined,
});

export const dbSeminarToUi = (s: DbSeminar): UiSeminar => ({
  id: s.id,
  title: s.title,
  description: s.description ?? undefined,
  order: s.order,
  audioFiles: (s.audioFiles ?? []).map<UiAudioFile>((a: DbAudio) => ({
    id: a.id,
    name: a.name,
    url: a.url ?? undefined,
    type: mapAudioTypeToUi(a.type),
  })),
  lessons: (s.lessons ?? [])
    .sort((a, b) => a.order - b.order)
    .map((l) => dbLessonToUi(l, s.id, 'seminar')),
  createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
  updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
});

export const dbSeriesToUi = (s: DbSeries): UiSeries => ({
  id: s.id,
  title: s.title,
  description: s.description ?? undefined,
  order: s.order,
  audioFiles: (s.audioFiles ?? []).map<UiAudioFile>((a: DbAudio) => ({
    id: a.id,
    name: a.name,
    url: a.url ?? undefined,
    type: mapAudioTypeToUi(a.type),
  })),
  lessons: (s.lessons ?? [])
    .sort((a, b) => a.order - b.order)
    .map((l) => dbLessonToUi(l, s.id, 'series')),
  createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
  updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
});

export const dbLessonWithContainerToUi = (l: DbLessonWithContainer): UiLesson => ({
  id: l.id,
  title: l.title,
  content: l.content,
  containerId: l.seminarId ?? l.seriesId ?? '',
  containerType: l.containerType === 'SEMINAR' ? 'seminar' : 'series',
  order: l.order,
  fragments: (l.fragments ?? [])
    .sort((a, b) => a.order - b.order)
    .map(dbFragmentToUi),
  createdAt: l.createdAt ? new Date(l.createdAt) : undefined,
  updatedAt: l.updatedAt ? new Date(l.updatedAt) : undefined,
});

// ===================== MAPPERS PARA NOTES Y SHARED NOTES =====================
import type { Note as UiNote, SharedNote as UiSharedNote } from '@/types';

// Definir tipos de Prisma para Notes y SharedNotes
type PrismaNoteType = 'DIRECT' | 'SELECTION' | 'IMPORTED';

export type DbNote = {
  id: string;
  content: string;
  contentHtml: string | null;
  isShared: boolean;
  type: PrismaNoteType;
  selectedText: string | null;
  positionStart: number | null;
  positionEnd: number | null;
  userId: string;
  lessonId: string | null;
  fragmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DbSharedNote = {
  id: string;
  content: string;
  selectedText: string | null;
  noteId: string;
  authorName: string;
  comment: string | null;
  lessonTitle: string;
  seminarTitle: string;
  fragmentOrder: number;
  sharedAt: Date;
  authorId: string;
};

// Función auxiliar para convertir NoteType de Prisma a tipo de aplicación
export function convertNoteType(prismaType: PrismaNoteType): UiNote['type'] {
  switch (prismaType) {
    case 'DIRECT':
      return 'direct';
    case 'SELECTION':
      return 'selection';
    case 'IMPORTED':
      return 'imported';
    default:
      return 'direct';
  }
}

// Función para convertir nota de Prisma a tipo de aplicación
export function dbNoteToUi(prismaNote: DbNote): UiNote {
  return {
    id: prismaNote.id,
    content: prismaNote.content,
    userId: prismaNote.userId,
    isShared: prismaNote.isShared,
    type: convertNoteType(prismaNote.type),
    selectedText: prismaNote.selectedText || undefined,
    position: (prismaNote.positionStart !== null && prismaNote.positionEnd !== null) ? {
      start: prismaNote.positionStart,
      end: prismaNote.positionEnd
    } : undefined,
    createdAt: prismaNote.createdAt,
    updatedAt: prismaNote.updatedAt,
    contentHtml: prismaNote.contentHtml || undefined,
    fragmentId: prismaNote.fragmentId || undefined,
  };
}

// Función para convertir nota compartida de Prisma a tipo de aplicación
export function dbSharedNoteToUi(prismaSharedNote: DbSharedNote): UiSharedNote {
  return {
    id: prismaSharedNote.id,
    noteId: prismaSharedNote.noteId,
    content: prismaSharedNote.content,
    authorName: prismaSharedNote.authorName,
    selectedText: prismaSharedNote.selectedText || undefined,
    comment: prismaSharedNote.comment || undefined,
    lessonTitle: prismaSharedNote.lessonTitle,
    seminarTitle: prismaSharedNote.seminarTitle,
    fragmentOrder: prismaSharedNote.fragmentOrder,
    sharedAt: prismaSharedNote.sharedAt,
  };
}
