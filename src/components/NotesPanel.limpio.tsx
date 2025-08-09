import { useState, useEffect } from 'react';
import { Fragment, Lesson, Note, SharedNote } from '@/types';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface NotesPanelProps {
  fragment: Fragment | null;
  lesson: Lesson | null;
}

export const NotesPanel = ({ fragment, lesson }: NotesPanelProps) => {
  const [activeTab, setActiveTab] = useState<'notas' | 'compartidas'>('notas');
  const [fragmentNotes, setFragmentNotes] = useState<Note[]>([]);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [selectedSharedUser, setSelectedSharedUser] = useState<string | null>(null);
  const [sharedUserNotes, setSharedUserNotes] = useState<SharedNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    if (fragment) {
      const storedNotes = localStorage.getItem(`notes_${fragment.id}`);
      setFragmentNotes(storedNotes ? JSON.parse(storedNotes) : []);
    } else {
      setFragmentNotes([]);
    }
  }, [fragment]);

  useEffect(() => {
    const myEmail = localStorage.getItem('currentUserEmail') || 'yo@ejemplo.com';
    const sharedFrom = localStorage.getItem(`sharedWith_${myEmail}`);
    setSharedUsers(sharedFrom ? JSON.parse(sharedFrom) : []);
    if (selectedSharedUser) {
      const notes = localStorage.getItem(`notes_${selectedSharedUser}`);
      setSharedUserNotes(notes ? JSON.parse(notes) : []);
    } else {
      setSharedUserNotes([]);
    }
  }, [lesson, selectedSharedUser]);

  const handleAddNote = () => {
    if (!fragment || !lesson || !newNoteText.trim()) return;
    const now = new Date();
    const newNote: Note = {
      id: `note_${Date.now()}`,
      content: newNoteText.trim(),
      lessonId: lesson.id,
      fragmentId: fragment.id,
      userId: 'current-user',
      isShared: false,
      type: 'direct',
      selectedText: '',
      createdAt: now,
      updatedAt: now
    };
    const notes = [...fragmentNotes, newNote];
    setFragmentNotes(notes);
    localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(notes));
    setNewNoteText('');
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button onClick={() => setActiveTab('notas')} className={activeTab === 'notas' ? 'font-bold' : ''}>Notas</button>
        <button onClick={() => setActiveTab('compartidas')} className={activeTab === 'compartidas' ? 'font-bold' : ''}>Compartidas</button>
      </div>
      {activeTab === 'notas' && (
        <div>
          <ul>
            {fragmentNotes.map(note => (
              <li key={note.id} className="mb-2 p-2 border rounded">
                {note.content}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input value={newNoteText} onChange={e => setNewNoteText(e.target.value)} className="border p-2 rounded w-full" placeholder="Escribe una nota..." />
            <button onClick={handleAddNote} className="bg-blue-500 text-white px-4 py-2 rounded">Agregar</button>
          </div>
        </div>
      )}
      {activeTab === 'compartidas' && (
        <div>
          <div className="mb-2">Usuarios que te han compartido:</div>
          <ul className="mb-4">
            {sharedUsers.map(email => (
              <li key={email}>
                <button onClick={() => setSelectedSharedUser(email)} className={selectedSharedUser === email ? 'font-bold' : ''}>{email}</button>
              </li>
            ))}
          </ul>
          <div>Notas compartidas:</div>
          <ul>
            {sharedUserNotes.map(note => (
              <li key={note.id} className="mb-2 p-2 border rounded">
                {note.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
