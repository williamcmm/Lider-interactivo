import React, { createContext, useContext, useState, ReactNode } from 'react';

type TabType = 'ayuda' | 'notas' | 'compartidas' | 'compartir';
interface Note {
  id: string;
  content: string;
  selectedText?: string;
  contentHtml?: string;
  fragmentId?: string;
}

interface NotesContextType {
  fragmentNotes: Note[];
  setFragmentNotes: (notes: Note[]) => void;
  currentFragmentId?: string;
  setCurrentFragmentId: (id?: string) => void;
  sharedUsers: string[];
  setSharedUsers: (users: string[]) => void;
  selectedSharedUser?: string;
  setSelectedSharedUser: (user?: string) => void;
  sharedUserNotes: Note[];
  setSharedUserNotes: (notes: Note[]) => void;
  shareEmail: string;
  setShareEmail: (email: string) => void;
  shareStatus: string;
  setShareStatus: (status: string) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAddingNote: boolean;
  setIsAddingNote: (v: boolean) => void;
  newNoteText: string;
  setNewNoteText: (v: string) => void;
  handleShare: () => void;
  handleSelectSharedUser: (email: string) => void;
  saveNewNote: () => void;
  deleteNote: (id: string, fragmentId?: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes debe usarse dentro de NotesProvider');
  return ctx;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('notas');
  const [fragmentNotes, setFragmentNotes] = useState<Note[]>([]);
  const [currentFragmentId, setCurrentFragmentId] = useState<string | undefined>(undefined);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [selectedSharedUser, setSelectedSharedUser] = useState<string | undefined>(undefined);
  const [sharedUserNotes, setSharedUserNotes] = useState<Note[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  const handleShare = () => {
    setShareStatus('Notas compartidas correctamente');
  };
  const handleSelectSharedUser = (email: string) => {
    setSelectedSharedUser(email);
    setSharedUserNotes([]); // Aquí deberías cargar las notas compartidas reales
  };
  const saveNewNote = () => {
    if (newNoteText.trim()) {
      setFragmentNotes([
        ...fragmentNotes,
        {
          id: Date.now().toString(),
          content: newNoteText,
          contentHtml: newNoteText.startsWith('<') ? newNoteText : undefined
        }
      ]);
      setNewNoteText('');
      setIsAddingNote(false);
    }
  };
  /**
   * Elimina una nota tanto del estado como del localStorage
   * @param id - ID de la nota a eliminar
   * @param fragmentId - ID del fragmento (opcional, para eliminar del localStorage)
   */
  const deleteNote = (id: string, fragmentId?: string) => {
    // Eliminar del estado
    const updatedNotes = fragmentNotes.filter(note => note.id !== id);
    setFragmentNotes(updatedNotes);
    
    // Eliminar del localStorage si tenemos fragmentId
    if (fragmentId) {
      try {
        const existingNotes = localStorage.getItem(`notes_${fragmentId}`);
        if (existingNotes) {
          const localNotes = JSON.parse(existingNotes);
          const updatedLocalNotes = localNotes.filter((note: any) => note.id !== id);
          localStorage.setItem(`notes_${fragmentId}`, JSON.stringify(updatedLocalNotes));
        }
      } catch (error) {
        console.error('Error deleting note from localStorage:', error);
      }
    } else {
      // Si no tenemos fragmentId, intentar buscar en todas las claves de localStorage
      // que contengan "notes_" y eliminar la nota de todas
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
  };

  return (
    <NotesContext.Provider value={{
      fragmentNotes, setFragmentNotes,
      currentFragmentId, setCurrentFragmentId,
      sharedUsers, setSharedUsers,
      selectedSharedUser, setSelectedSharedUser,
      sharedUserNotes, setSharedUserNotes,
      shareEmail, setShareEmail,
      shareStatus, setShareStatus,
      activeTab, setActiveTab,
      isAddingNote, setIsAddingNote,
      newNoteText, setNewNoteText,
      handleShare, handleSelectSharedUser, saveNewNote, deleteNote
    }}>
      {children}
    </NotesContext.Provider>
  );
}
