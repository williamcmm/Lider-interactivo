import { useState, useEffect } from 'react';
import { Fragment, Lesson, Note, SharedNote } from '@/types';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

type TabType = 'ayuda' | 'notas' | 'compartidas' | 'compartir';

interface NotesPanelProps {
  fragment: Fragment | null;
  lesson: Lesson | null;
}

export function NotesPanel({ fragment, lesson }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notas');
  const [fragmentNotes, setFragmentNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [selectedSharedUser, setSelectedSharedUser] = useState<string | null>(null);
  const [sharedUserNotes, setSharedUserNotes] = useState<SharedNote[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Simula cargar notas compartidas (de todos los usuarios que me han compartido)
  const loadSharedNotes = () => {
    try {
      const myEmail = localStorage.getItem('currentUserEmail') || 'yo@ejemplo.com';
      const sharedFrom = localStorage.getItem(`sharedWith_${myEmail}`);
      if (sharedFrom) {
        const users: string[] = JSON.parse(sharedFrom);
        setSharedUsers(users);
        if (selectedSharedUser) {
          const notes = localStorage.getItem(`notes_${selectedSharedUser}`);
          setSharedUserNotes(notes ? JSON.parse(notes) : []);
        } else {
          setSharedUserNotes([]);
        }
      } else {
        setSharedUsers([]);
        setSharedUserNotes([]);
      }
    } catch (error) {
      setSharedUsers([]);
      setSharedUserNotes([]);
    }
  };

  // Cargar notas cuando cambie el fragmento
  useEffect(() => {
    if (fragment) {
      loadFragmentNotes(fragment.id);
    } else {
      setFragmentNotes([]);
    }
  }, [fragment]);

  // Cargar notas compartidas y usuarios que me han compartido
  useEffect(() => {
    loadSharedNotes();
    loadSharedUsers();
  }, [lesson]);

  // Escuchar eventos de notas agregadas desde selección de texto
  useEffect(() => {
    const handleNoteAdded = (event: CustomEvent) => {
      const { fragmentId } = event.detail;
      if (fragment && fragment.id === fragmentId) {
        loadFragmentNotes(fragmentId);
      }
    };

    window.addEventListener('noteAdded', handleNoteAdded as EventListener);
    
    return () => {
      window.removeEventListener('noteAdded', handleNoteAdded as EventListener);
    };
  }, [fragment]);

  const loadFragmentNotes = (fragmentId: string) => {
    try {
      const storedNotes = localStorage.getItem(`notes_${fragmentId}`);
      if (storedNotes) {
        const notes: Note[] = JSON.parse(storedNotes);
        setFragmentNotes(notes);
      } else {
        setFragmentNotes([]);
      }
    } catch (error) {
      console.error('Error loading fragment notes:', error);
      setFragmentNotes([]);
    }
  };

  // Simula cargar notas compartidas (de todos los usuarios que me han compartido)
  // (Ya consolidada arriba)
    try {
      // Simulación: en localStorage, cada usuario tiene 'sharedWith_{email}' = [emails]
      // y 'notes_{email}' = [notas]
      const myEmail = localStorage.getItem('currentUserEmail') || 'yo@ejemplo.com';
      const sharedFrom = localStorage.getItem(`sharedWith_${myEmail}`);
      if (sharedFrom) {
        const users: string[] = JSON.parse(sharedFrom);
        setSharedUsers(users);
        // Si hay un usuario seleccionado, cargar sus notas
        if (selectedSharedUser) {
          const notes = localStorage.getItem(`notes_${selectedSharedUser}`);
          setSharedUserNotes(notes ? JSON.parse(notes) : []);
        } else {
          setSharedUserNotes([]);
        }
      } else {
        setSharedUsers([]);
        setSharedUserNotes([]);
      }
    } catch (error) {
      setSharedUsers([]);
      setSharedUserNotes([]);
    }
  };

  // Cargar lista de usuarios que me han compartido
  const loadSharedUsers = () => {
    try {
      const myEmail = localStorage.getItem('currentUserEmail') || 'yo@ejemplo.com';
      const sharedFrom = localStorage.getItem(`sharedWith_${myEmail}`);
      if (sharedFrom) {
        setSharedUsers(JSON.parse(sharedFrom));
      } else {
        setSharedUsers([]);
      }
    } catch {
      setSharedUsers([]);
    }
  };
  // Compartir mis notas con otro usuario (simulado)
  const handleShare = () => {
    setShareStatus(null);
    const email = shareEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setShareStatus('Ingrese un correo válido.');
      return;
    }
    // Simula que el usuario existe si hay notas en localStorage con ese email
    // En real: consultar Firestore si existe el usuario
    // Aquí, simplemente agregamos nuestro email a la lista de sharedWith_{email}
    const myEmail = localStorage.getItem('currentUserEmail') || 'yo@ejemplo.com';
    if (email === myEmail) {
      setShareStatus('No puede compartir notas consigo mismo.');
      return;
    }
    // Obtener lista actual de usuarios que han recibido mis notas
  const sharedList = localStorage.getItem(`sharedWith_${email}`);
  const sharedArr: string[] = sharedList ? JSON.parse(sharedList) : [];
    if (!sharedArr.includes(myEmail)) {
      sharedArr.push(myEmail);
      localStorage.setItem(`sharedWith_${email}`, JSON.stringify(sharedArr));
    }
    setShareStatus('Notas compartidas correctamente.');
    setShareEmail('');
  };
  // Seleccionar usuario para ver sus notas compartidas
  const handleSelectSharedUser = (email: string) => {
    setSelectedSharedUser(email);
    const notes = localStorage.getItem(`notes_${email}`);
    setSharedUserNotes(notes ? JSON.parse(notes) : []);
  };

  // Permitir guardar nota rápida siempre, aunque no haya fragmento o lección
  const saveNewNote = () => {
    if (!newNoteText.trim()) return;
    let notesKey = 'notes_general';
    let noteFragmentId = 'general';
    let noteLessonId = 'general';
    if (fragment && lesson) {
      notesKey = `notes_${fragment.id}`;
      noteFragmentId = fragment.id;
      noteLessonId = lesson.id;
    }
    try {
      const existingNotes = localStorage.getItem(notesKey);
  let notes: Note[] = existingNotes ? JSON.parse(existingNotes) : [];
      const newNote: Note = {
        id: `quick_${noteFragmentId}_${Date.now()}`,
        content: newNoteText.trim(),
        lessonId: noteLessonId,
        fragmentId: noteFragmentId,
        userId: 'current-user',
        isShared: false,
        type: 'direct',
        selectedText: '',
        position: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      notes = [newNote, ...notes];
      localStorage.setItem(notesKey, JSON.stringify(notes));
      if (fragment && lesson) {
        setFragmentNotes(notes);
        window.dispatchEvent(new CustomEvent('noteAdded', { detail: { fragmentId: fragment.id } }));
      } else if (!fragment) {
        // Si no hay fragmento, mostrar la nota general
        setFragmentNotes(notes);
      }
      setNewNoteText('');
      setIsAddingNote(false);
    } catch (error) {
      setNewNoteText("");
      setIsAddingNote(false);
      console.error('Error saving quick note:', error);
    }
  };

  const deleteNote = (noteId: string) => {
    if (!fragment) return;

    try {
      const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
      if (existingNotes) {
        const notes: Note[] = JSON.parse(existingNotes);
        const updatedNotes = notes.filter(note => note.id !== noteId);
        localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(updatedNotes));
        setFragmentNotes(prev => prev.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const addSharedNoteToMine = (sharedNote: SharedNote) => {
    if (!fragment || !lesson) return;

    try {
      const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
  const notes: Note[] = existingNotes ? JSON.parse(existingNotes) : [];
      
      const newNote: Note = {
        id: `imported_${fragment.id}_${Date.now()}`,
        content: `[Nota compartida] ${sharedNote.content}`,
        lessonId: lesson.id,
        fragmentId: fragment.id,
        userId: 'current-user',
        isShared: false,
        type: 'imported',
        selectedText: sharedNote.selectedText || '',
        position: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      notes.push(newNote);
      localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(notes));
      setFragmentNotes(prev => [...prev, newNote]);
      console.log('Nota compartida agregada a mis notas');
    } catch (error) {
      console.error('Error adding shared note:', error);
    }
  };

  const tabs = [
    { id: 'ayuda' as TabType, label: 'Ayuda' },
    { id: 'notas' as TabType, label: 'Notas' },
    { id: 'compartidas' as TabType, label: 'Compartidas' },
    { id: 'compartir' as TabType, label: 'Compartir' },
  ];

  return (
    <div className="h-full flex flex-col p-4">
      {/* Pestañas de navegación */}
      <div className="flex justify-around border-b border-gray-300 mb-4 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 text-center font-semibold transition-colors text-sm ${
              activeTab === tab.id
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de las pestañas */}
      <div className="flex-grow flex flex-col text-gray-800">
        {activeTab === 'ayuda' && (
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {fragment && fragment.studyAids && fragment.studyAids.trim() ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div 
                  className="text-blue-800 text-sm"
                  dangerouslySetInnerHTML={{ __html: fragment.studyAids }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  {lesson ? 'No hay ayudas disponibles para este fragmento.' : 'Seleccione una lección para ver las ayudas.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notas' && (
          <div className="flex-grow flex flex-col">
            {/* Lista de notas existentes */}
            <div className="flex-grow overflow-y-auto custom-scrollbar mb-4">
              {fragmentNotes.length > 0 ? (
                <div className="space-y-2">
                  {fragmentNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          {note.selectedText && (
                            <div className="text-xs text-blue-600 mb-1 font-medium">
                              &quot;{note.selectedText}&quot;
                            </div>
                          )}
                          <div className="text-sm text-gray-800">{note.content}</div>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                  <p className="text-sm">No hay notas para este fragmento</p>
                </div>
              )}
            </div>
            {/* Botón + y formulario de nueva nota (siempre abajo) */}
            <div className="flex-shrink-0">
              {!isAddingNote ? (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Agregar nota rápida
                </button>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Escribe tu nota aquí..."
                    className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveNewNote}
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteText('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                  {/* Siempre se puede guardar, sin advertencia */}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compartidas' && (
          <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar">
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">Usuarios que te han compartido notas:</h3>
              {sharedUsers.length > 0 ? (
                <ul className="space-y-2">
                  {sharedUsers.map((email) => (
                    <li key={email}>
                      <button
                        className={`px-3 py-2 rounded text-left w-full border ${selectedSharedUser === email ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'}`}
                        onClick={() => handleSelectSharedUser(email)}
                      >
                        {email}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">Nadie te ha compartido notas aún.</div>
              )}
            </div>
            {selectedSharedUser && (
              <div className="flex-grow">
                <h4 className="font-semibold text-sm mb-2">Notas de {selectedSharedUser}:</h4>
                {sharedUserNotes.length > 0 ? (
                  <div className="space-y-2">
                    {sharedUserNotes.map((note: SharedNote) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-grow">
                          {note.selectedText && (
                            <div className="text-xs text-blue-600 mb-1 font-medium">
                              "{note.selectedText}"
                            </div>
                          )}
                          <div className="text-sm text-gray-800">{note.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No hay notas compartidas de este usuario.</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compartir' && (
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            <div className="space-y-4 max-w-md mx-auto mt-8">
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico del usuario con quien compartir:</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="usuario@ejemplo.com"
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                />
              </div>
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                onClick={handleShare}
              >
                Compartir mis notas
              </button>
              {shareStatus && (
                <div className={`mt-2 text-sm ${shareStatus.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>{shareStatus}</div>
              )}
              <div className="text-xs text-gray-500 mt-4">
                La persona debe estar registrada con ese correo y podrá ver tus notas en la pestaña "Compartidas".
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
