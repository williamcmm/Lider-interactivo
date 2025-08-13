import { create } from 'zustand';

// Tipos principales
export type TabType = 'ayuda' | 'notas' | 'compartidas' | 'compartir';

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
  addNote: (note: Omit<Note, 'id'>) => void;
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
 * - Notas por fragmento con persistencia en localStorage
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
  activeTab: 'notas',
  isAddingNote: false,
  newNoteText: '',
  
  // Notas principales
  fragmentNotes: [],
  currentFragmentId: undefined,
  
  // Notas compartidas
  sharedUsers: [],
  selectedSharedUser: undefined,
  sharedUserNotes: [],
  shareEmail: '',
  shareStatus: '',
  
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
      set({ newNoteText: '' });
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
  addNote: (noteData: Omit<Note, 'id'>) => {
    const { fragmentNotes, currentFragmentId } = get();
    
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...noteData,
      fragmentId: currentFragmentId || noteData.fragmentId
    };
    
    const updatedNotes = [...fragmentNotes, newNote];
    set({ fragmentNotes: updatedNotes });
    
    // Persistir en localStorage
    if (newNote.fragmentId) {
      try {
        const existingNotes = localStorage.getItem(`notes_${newNote.fragmentId}`);
        const localNotes = existingNotes ? JSON.parse(existingNotes) : [];
        
        localNotes.push({
          ...newNote,
          userId: 'current-user',
          isShared: false,
          type: noteData.selectedText ? 'selection' : 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        localStorage.setItem(`notes_${newNote.fragmentId}`, JSON.stringify(localNotes));
      } catch (error) {
        console.error('Error saving note to localStorage:', error);
      }
    }
  },
  
  /**
   * Eliminar una nota tanto del estado como del localStorage
   */
  deleteNote: (id: string, fragmentId?: string) => {
    const { fragmentNotes, currentFragmentId } = get();
    
    // Eliminar del estado
    const updatedNotes = fragmentNotes.filter(note => note.id !== id);
    set({ fragmentNotes: updatedNotes });
    
    // Determinar el fragmentId a usar
    const targetFragmentId = fragmentId || currentFragmentId;
    
    if (targetFragmentId) {
      // Eliminar del localStorage del fragmento específico
      try {
        const existingNotes = localStorage.getItem(`notes_${targetFragmentId}`);
        if (existingNotes) {
          const localNotes = JSON.parse(existingNotes);
          const updatedLocalNotes = localNotes.filter((note: any) => note.id !== id);
          localStorage.setItem(`notes_${targetFragmentId}`, JSON.stringify(updatedLocalNotes));
        }
      } catch (error) {
        console.error('Error deleting note from localStorage:', error);
      }
    } else {
      // Si no tenemos fragmentId, buscar en todos los localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('notes_')) {
            const notes = JSON.parse(localStorage.getItem(key) || '[]');
            const updatedNotes = notes.filter((note: any) => note.id !== id);
            if (notes.length !== updatedNotes.length) {
              localStorage.setItem(key, JSON.stringify(updatedNotes));
            }
          }
        }
      } catch (error) {
        console.error('Error deleting note from all localStorage keys:', error);
      }
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
        contentHtml: newNoteText.startsWith('<') ? newNoteText : undefined
      });
      
      // Limpiar el formulario
      set({ 
        newNoteText: '', 
        isAddingNote: false 
      });
    }
  },
  
  /**
   * Cargar notas desde localStorage para un fragmento específico
   */
  loadNotesForFragment: (fragmentId: string) => {
    try {
      const existingNotes = localStorage.getItem(`notes_${fragmentId}`);
      if (existingNotes) {
        const localNotes = JSON.parse(existingNotes);
        
        // Convertir las notas locales al formato del store
        const contextNotes = localNotes.map((note: any) => ({
          id: note.id,
          content: note.content,
          fragmentId: note.fragmentId,
          selectedText: note.selectedText,
          contentHtml: note.contentHtml
        }));
        
        set({ fragmentNotes: contextNotes });
      } else {
        // Si no hay notas, limpiar
        set({ fragmentNotes: [] });
      }
    } catch (error) {
      console.error('Error loading notes for fragment:', error);
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
        shareStatus: 'Notas compartidas correctamente',
        shareEmail: '' 
      });
      
      // Limpiar el estado después de 3 segundos
      setTimeout(() => {
        set({ shareStatus: '' });
      }, 3000);
    }
  },
  
  /**
   * Seleccionar un usuario compartido y cargar sus notas
   */
  handleSelectSharedUser: (email: string) => {
    set({ 
      selectedSharedUser: email,
      sharedUserNotes: [] // Aquí se cargarían las notas reales del usuario
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
  clearAllNotes: () => {
    const { currentFragmentId } = get();
    
    set({ fragmentNotes: [] });
    
    // Limpiar del localStorage también
    if (currentFragmentId) {
      try {
        localStorage.removeItem(`notes_${currentFragmentId}`);
      } catch (error) {
        console.error('Error clearing notes from localStorage:', error);
      }
    }
  },
  
  /**
   * Resetear todo el estado de notas
   */
  resetNotesState: () => {
    set({
      // UI y navegación
      activeTab: 'notas',
      isAddingNote: false,
      newNoteText: '',
      
      // Notas principales
      fragmentNotes: [],
      currentFragmentId: undefined,
      
      // Notas compartidas
      sharedUsers: [],
      selectedSharedUser: undefined,
      sharedUserNotes: [],
      shareEmail: '',
      shareStatus: ''
    });
  }
}));
