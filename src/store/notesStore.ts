import { getNotesForFragment } from "@/actions/notes/crud";
import { create } from "zustand";

// Tipos principales
export type TabType = "ayuda" | "notas" | "compartidas" | "compartir";

export interface Note {
  id: string;
  content: string;
  selectedText?: string;
  contentHtml?: string;
  fragmentId?: string;
}

interface NotesState {
  // Estados de navegación y UI
  activeTab: TabType;
  isAddingNote: boolean;
  newNoteText: string;

  // Estados de notas
  fragmentNotes: Note[];
  currentFragmentId?: string;

  // Estados de notas compartidas
  sharedUsers: string[];
  selectedSharedUser?: string;
  sharedUserNotes: Note[];
  shareEmail: string;
  shareStatus: string;

  // Acciones de navegación y UI
  setActiveTab: (tab: TabType) => void;
  setIsAddingNote: (isAdding: boolean) => void;
  setNewNoteText: (text: string) => void;

  // Acciones de notas principales
  setFragmentNotes: (notes: Note[]) => void;
  setCurrentFragmentId: (id?: string) => void;
  addNote: (note: Omit<Note, "id">) => void;
  deleteNote: (id: string, fragmentId?: string) => void;
  saveNewNote: () => void;
  loadNotesForFragment: (fragmentId: string) => void;

  // Acciones de notas compartidas
  setSharedUsers: (users: string[]) => void;
  setSelectedSharedUser: (user?: string) => void;
  setSharedUserNotes: (notes: Note[]) => void;
  setShareEmail: (email: string) => void;
  setShareStatus: (status: string) => void;
  handleShare: () => void;
  handleSelectSharedUser: (email: string) => void;

  // Utilidades
  clearAllNotes: () => void;
  resetNotesState: () => void;
}

/**
 * Store de Zustand para el manejo de notas
 *
 * Centraliza todo el estado relacionado con notas:
 * - Notas por fragmento persistidas en servidor (Server Actions)
 * - Sistema de pestañas y navegación
 * - Notas compartidas entre usuarios
 * - Funcionalidades de compartir y colaborar
 *
 * Beneficios sobre Context API:
 * - Mejor rendimiento (sin re-renders innecesarios)
 * - Código más limpio y mantenible
 * - DevTools integradas
 * - Acceso directo desde cualquier componente
 */
export const useNotesStore = create<NotesState>((set, get) => ({
  // ==========================================
  // ESTADO INICIAL
  // ==========================================

  // UI y navegación
  activeTab: "notas",
  isAddingNote: false,
  newNoteText: "",

  // Notas principales
  fragmentNotes: [],
  currentFragmentId: undefined,

  // Notas compartidas
  sharedUsers: [],
  selectedSharedUser: undefined,
  sharedUserNotes: [],
  shareEmail: "",
  shareStatus: "",

  // ==========================================
  // ACCIONES DE UI Y NAVEGACIÓN
  // ==========================================

  setActiveTab: (tab: TabType) => {
    set({ activeTab: tab });
  },

  setIsAddingNote: (isAdding: boolean) => {
    set({ isAddingNote: isAdding });
    // Si se cancela la adición, limpiar el texto
    if (!isAdding) {
      set({ newNoteText: "" });
    }
  },

  setNewNoteText: (text: string) => {
    set({ newNoteText: text });
  },

  // ==========================================
  // ACCIONES DE NOTAS PRINCIPALES
  // ==========================================

  setFragmentNotes: (notes: Note[]) => {
    set({ fragmentNotes: notes });
  },

  setCurrentFragmentId: (id?: string) => {
    const state = get();
    set({ currentFragmentId: id });

    // Auto-cargar notas cuando cambia el fragmento
    if (id && id !== state.currentFragmentId) {
      state.loadNotesForFragment(id);
    } else if (!id) {
      // Limpiar notas si no hay fragmento
      set({ fragmentNotes: [] });
    }
  },

  /**
   * Agregar una nueva nota al fragmento actual
   */
  addNote: async (noteData: Omit<Note, "id">) => {
    const { fragmentNotes, currentFragmentId } = get();
    const fragmentId = currentFragmentId || noteData.fragmentId;
    const payload = {
      content: noteData.content,
      contentHtml: noteData.contentHtml,
      selectedText: noteData.selectedText,
      fragmentId,
    };
    try {
      const { createNote } = await import("@/actions/notes/crud");
      const res = await createNote(payload);
      if (res.ok) {
        const created = res.note;
        const mapped: Note = {
          id: created.id,
          content: created.content,
          contentHtml: created.contentHtml ?? undefined,
          selectedText: created.selectedText ?? undefined,
          fragmentId: created.fragmentId ?? undefined,
        };
        set({ fragmentNotes: [...fragmentNotes, mapped] });
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  },

  /**
   * Eliminar una nota tanto del estado como del servidor
   */
  deleteNote: async (id: string) => {
    const { fragmentNotes } = get();
    try {
      const { deleteNote } = await import("@/actions/notes/crud");
      const res = await deleteNote(id);
      if (res.ok) {
        const updatedNotes = fragmentNotes.filter((n) => n.id !== id);
        set({ fragmentNotes: updatedNotes });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  },

  /**
   * Guardar la nota que se está escribiendo
   */
  saveNewNote: () => {
    const { newNoteText, addNote } = get();

    if (newNoteText.trim()) {
      addNote({
        content: newNoteText.trim(),
        contentHtml: newNoteText.startsWith("<") ? newNoteText : undefined,
      });

      // Limpiar el formulario
      set({
        newNoteText: "",
        isAddingNote: false,
      });
    }
  },

  /**
   * Cargar notas desde el servidor para un fragmento específico
   */
  loadNotesForFragment: async (fragmentId: string) => {
    try {
      const res = await getNotesForFragment(fragmentId);
      if (res.ok) {
        const contextNotes = res.notes.map((note) => ({
          id: note.id,
          content: note.content,
          fragmentId: note.fragmentId ?? undefined,
          selectedText: note.selectedText ?? undefined,
          contentHtml: note.contentHtml ?? undefined,
        }));
        set({ fragmentNotes: contextNotes });
      } else {
        set({ fragmentNotes: [] });
      }
    } catch (error) {
      console.error("Error loading notes for fragment:", error);
      set({ fragmentNotes: [] });
    }
  },

  // ==========================================
  // ACCIONES DE NOTAS COMPARTIDAS
  // ==========================================

  setSharedUsers: (users: string[]) => {
    set({ sharedUsers: users });
  },

  setSelectedSharedUser: (user?: string) => {
    set({ selectedSharedUser: user });
  },

  setSharedUserNotes: (notes: Note[]) => {
    set({ sharedUserNotes: notes });
  },

  setShareEmail: (email: string) => {
    set({ shareEmail: email });
  },

  setShareStatus: (status: string) => {
    set({ shareStatus: status });
  },

  /**
   * Compartir notas con otro usuario
   */
  handleShare: () => {
    const { shareEmail, sharedUsers } = get();

    if (shareEmail.trim()) {
      // Agregar usuario a la lista de compartidos
      const updatedUsers = [...sharedUsers, shareEmail.trim()];
      set({
        sharedUsers: updatedUsers,
        shareStatus: "Notas compartidas correctamente",
        shareEmail: "",
      });

      // Limpiar el estado después de 3 segundos
      setTimeout(() => {
        set({ shareStatus: "" });
      }, 3000);
    }
  },

  /**
   * Seleccionar un usuario compartido y cargar sus notas
   */
  handleSelectSharedUser: (email: string) => {
    set({
      selectedSharedUser: email,
      sharedUserNotes: [], // Aquí se cargarían las notas reales del usuario
    });

    // TODO: Implementar carga de notas compartidas reales
    // En una implementación real, aquí se haría una consulta a la base de datos
  },

  // ==========================================
  // UTILIDADES Y RESET
  // ==========================================

  /**
   * Limpiar todas las notas del fragmento actual
   */
  clearAllNotes: async () => {
    const { currentFragmentId } = get();
    set({ fragmentNotes: [] });
    if (currentFragmentId) {
      try {
        const { clearNotesForFragment } = await import("@/actions/notes/crud");
        await clearNotesForFragment(currentFragmentId);
      } catch (error) {
        console.error("Error clearing notes:", error);
      }
    }
  },

  /**
   * Resetear todo el estado de notas
   */
  resetNotesState: () => {
    set({
      // UI y navegación
      activeTab: "notas",
      isAddingNote: false,
      newNoteText: "",

      // Notas principales
      fragmentNotes: [],
      currentFragmentId: undefined,

      // Notas compartidas
      sharedUsers: [],
      selectedSharedUser: undefined,
      sharedUserNotes: [],
      shareEmail: "",
      shareStatus: "",
    });
  },
}));
