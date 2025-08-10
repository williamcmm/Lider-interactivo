import React, { useState } from "react";

const TABS = [
  { key: "ayuda", label: "Ayuda" },
  { key: "notas", label: "Notas" },
  { key: "compartidas", label: "Compartidas" },
  { key: "compartir", label: "Compartir" },
];

export default function NotesPanel() {
  const [activeTab, setActiveTab] = useState("ayuda");
  const [notes, setNotes] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Función para agregar una nota
  const handleAddNote = () => {
    if (noteContent.trim()) {
      setNotes([...notes, noteContent]);
      setNoteContent("");
    }
  };

  // Función para eliminar una nota
  const handleDeleteNote = (idx: number) => {
    setNotes(notes.filter((_, i) => i !== idx));
  };

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
        <div className="p-4 flex flex-col h-full">
          {/* Eliminado título redundante */}

          {/* Lista de notas, la nota nueva aparece arriba */}
          <ul className="space-y-2 flex-1 overflow-y-auto mb-2">
            {/* Sin mensaje ni comentario si no hay notas */}
            {notes.slice().reverse().map((note, idx) => (
              <li key={notes.length - 1 - idx} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{note}</span>
                <button
                  className="text-red-500 ml-2"
                  onClick={() => handleDeleteNote(notes.length - 1 - idx)}
                  title="Eliminar nota"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
          {/* Botón + y cuadro para agregar nota solo en la parte inferior, separado 1cm */}
          <div style={{ marginBottom: '1cm' }}>
            {!showNoteInput && (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm w-full"
                onClick={() => setShowNoteInput(true)}
              >
                + Agregar nota
              </button>
            )}
            {showNoteInput && (
              <div className="mt-2 flex flex-col items-stretch">
                <textarea
                  className="w-full border rounded p-1 text-sm"
                  rows={2}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Escribe una nota..."
                  autoFocus
                />
                <div className="flex gap-2 mt-1">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    onClick={() => {
                      handleAddNote();
                      setShowNoteInput(false);
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    onClick={() => {
                      setNoteContent("");
                      setShowNoteInput(false);
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
            onClick={() => alert("Función de compartir en desarrollo")}
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
