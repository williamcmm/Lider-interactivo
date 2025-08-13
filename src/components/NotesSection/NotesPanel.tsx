import React from "react";
import { useNotes } from '../../context/NotesContext';
import { FiTrash2 } from "react-icons/fi";

const TABS = [
  { key: "ayuda", label: "Ayuda" },
  { key: "notas", label: "Notas" },
  { key: "compartidas", label: "Compartidas" },
  { key: "compartir", label: "Compartir" },
] as const;

export default function NotesPanel() {
  const {
    activeTab,
    setActiveTab,
    fragmentNotes,
    currentFragmentId,
    shareEmail,
    setShareEmail,
    isAddingNote,
    setIsAddingNote,
    newNoteText,
    setNewNoteText,
    saveNewNote,
    deleteNote,
    handleShare
  } = useNotes();

  // Renderizado de contenido por pestaña
  let tabContent;
  switch (activeTab) {
    case "ayuda":
      tabContent = (
        <div className="p-4">
          <h2 className="font-bold mb-2">Ayuda para tomar notas</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>Escribe tus ideas o apuntes en la pestaña "Notas".</li>
            <li>Puedes eliminar notas haciendo clic en el botón de borrar.</li>
            <li>Las notas son privadas y solo visibles para ti.</li>
            <li>Próximamente podrás sincronizarlas en la nube.</li>
          </ul>
        </div>
      );
      break;
    case "notas":
      tabContent = (
        <div className="flex flex-col h-full">
          {/* Lista de notas con scroll */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {fragmentNotes.slice().reverse().map((note, idx) => (
                <li key={note.id} className="flex flex-col bg-gray-100 p-3 rounded">
                  {note.selectedText && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2 border-l-4 border-blue-400">
                      <strong>Texto seleccionado:</strong> "{note.selectedText}"
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="flex-1">{note.content}</span>
                    <button
                      className="text-red-500 ml-2 hover:text-red-700"
                      onClick={() => deleteNote(note.id, currentFragmentId)}
                      title="Eliminar nota"
                    >
                      <FiTrash2/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Área fija para agregar notas */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            {!isAddingNote && (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm w-full"
                onClick={() => setIsAddingNote(true)}
              >
                + Agregar nota
              </button>
            )}
            {isAddingNote && (
              <div className="flex flex-col items-stretch">
                <textarea
                  className="w-full border rounded p-2 text-sm mb-2"
                  rows={2}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Escribe una nota..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    onClick={saveNewNote}
                  >
                    Guardar
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    onClick={() => {
                      setNewNoteText("");
                      setIsAddingNote(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
      break;
    case "compartidas":
      tabContent = (
        <div className="p-4">
          <h2 className="font-bold mb-2">Notas compartidas</h2>
          <p className="text-sm text-gray-500">
            Aquí verás las notas que otros han compartido contigo. (Demo)
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>Ejemplo: "Recuerda revisar el capítulo 3"</li>
            <li>Ejemplo: "Pregunta sobre la parábola del sembrador"</li>
          </ul>
        </div>
      );
      break;
    case "compartir":
      tabContent = (
        <div className="p-4">
          <h2 className="font-bold mb-2">Compartir nota</h2>
          <input
            type="email"
            className="border rounded p-2 w-full mb-2"
            value={shareEmail}
            onChange={e => setShareEmail(e.target.value)}
            placeholder="Correo del destinatario"
          />
          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={handleShare}
          >
            Compartir
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Pronto podrás enviar tus notas por correo o WhatsApp.
          </p>
        </div>
      );
      break;
    default:
      tabContent = null;
  }

  return (
    <div className="h-full flex flex-col bg-white rounded shadow">
      <div className="flex border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`flex-1 py-2 px-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">{tabContent}</div>
    </div>
  );
}
