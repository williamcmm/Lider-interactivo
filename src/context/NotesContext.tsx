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
  deleteNote: (id: string) => void;
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
  const deleteNote = (id: string) => {
    setFragmentNotes(fragmentNotes.filter(note => note.id !== id));
  };

  return (
    <NotesContext.Provider value={{
      fragmentNotes, setFragmentNotes,
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
