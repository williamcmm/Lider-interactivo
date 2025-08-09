&quot;Texto con comillas&quot;
import { useState } from 'react';
import { TextSelectionPopup as TextSelectionPopupType } from '@/types';

interface TextSelectionPopupProps {
  popup: TextSelectionPopupType;
  onSaveNote: (noteContent: string) => void;
  onClose: () => void;
}

export function TextSelectionPopup({ popup, onSaveNote, onClose }: TextSelectionPopupProps) {
  const [noteContent, setNoteContent] = useState('');

  const handleSave = () => {
    if (noteContent.trim()) {
      onSaveNote(noteContent);
      setNoteContent('');
      onClose();
    }
  };

  const handleCancel = () => {
    setNoteContent('');
    onClose();
  };

  if (!popup.isVisible) return null;

  console.log('Popup should be visible:', popup); // Debug

  // Calcular posición del popup basado en la posición del texto
  const getPopupStyle = () => {
    const { x, y } = popup.position;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 200; // Altura estimada del popup
    const popupWidth = 300;  // Ancho del popup

    let top = y;
    let left = x;

    // Si el popup se sale por abajo, mostrarlo arriba del texto
    if (y + popupHeight > viewportHeight) {
      top = y - popupHeight - 10;
    } else {
      top = y + 10;
    }

    // Si el popup se sale por la derecha, ajustar hacia la izquierda
    if (x + popupWidth > viewportWidth) {
      left = viewportWidth - popupWidth - 10;
    }

    // Si el popup se sale por la izquierda, ajustar hacia la derecha
    if (left < 10) {
      left = 10;
    }

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000,
    };
  };

  return (
    <div style={getPopupStyle()}>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
        {/* Texto seleccionado */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Texto seleccionado:
          </label>
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400 max-h-16 overflow-y-auto">
            "{popup.selectedText}"
          </div>
        </div>

        {/* Área de nota */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tu nota:
          </label>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Escribe tu nota sobre este texto..."
            className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!noteContent.trim()}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Guardar Nota
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
