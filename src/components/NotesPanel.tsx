import React from 'react';
import { useNotes } from '@/context/NotesContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

type TabType = 'ayuda' | 'notas' | 'compartidas' | 'compartir';

interface Note {
  id: string;
  content: string;
  selectedText?: string;
}

export function NotesPanel({ fragment, lesson }: { fragment?: any; lesson?: any }) {
  const {
    fragmentNotes,
    sharedUsers,
    selectedSharedUser,
    sharedUserNotes,
    shareEmail,
    shareStatus,
    setActiveTab,
    activeTab,
    setShareEmail,
    handleShare,
    handleSelectSharedUser,
    saveNewNote,
    deleteNote,
    isAddingNote,
    setIsAddingNote,
    newNoteText,
    setNewNoteText,
  } = useNotes();

  const tabs = [
    { id: 'ayuda' as TabType, label: 'Ayuda' },
    { id: 'notas' as TabType, label: 'Notas' },
    { id: 'compartidas' as TabType, label: 'Compartidas' },
    { id: 'compartir' as TabType, label: 'Compartir' },
  ];

  return (
    <div className="h-full max-h-full flex flex-col p-4 pb-16 overflow-y-auto custom-scrollbar">
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
              <div style={{ marginBottom: '16px' }}>
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
                      className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
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
                  </div>
                )}
              </div>
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
                    {sharedUserNotes.map((note: any) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-grow">
                          {note.selectedText && (
                            <div className="text-xs text-blue-600 mb-1 font-medium">
                              &quot;{note.selectedText}&quot;
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
