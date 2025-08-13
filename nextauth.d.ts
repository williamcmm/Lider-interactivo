import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
      notes: Note[];
      sharedNotes: SharedNote[];
    } & DefaultSession["user"];
  }
}

interface Note {
  id: string;
  content: string;
  userId: string;
  isShared: boolean;
  type: string; // Tipo de nota
  selectedText: string | null; // Texto seleccionado (para notas de selección)
  position?: {              // Posición del texto seleccionado
    start: number;
    end: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  contentHtml?: string | null; // nuevo campo para contenido enriquecido
  fragmentId?: string | null;   // Asociada al fragmento específico
}

interface SharedNote {
  id: string;
  noteId: string;
  content: string;          // Contenido de la nota compartida
  authorName: string;
  selectedText: string | null;    // Texto seleccionado original
  comment?: string | null;
  lessonTitle: string;
  seminarTitle: string;
  fragmentOrder: number;    // Orden del fragmento
  sharedAt: Date;
}
