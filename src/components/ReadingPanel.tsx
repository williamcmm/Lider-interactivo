import { useState, useRef, useEffect } from 'react';
import { Lesson, Fragment, Note, TextSelectionPopup as TextSelectionPopupType } from '@/types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CompactAudioPlayer } from './CompactAudioPlayer';
import { TextSelectionPopup } from './TextSelectionPopup';

interface ReadingPanelProps {
  lesson: Lesson | null;
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  onNavigateFragment: (direction: 'prev' | 'next') => void;
}

export function ReadingPanel({ lesson, fragment, fragmentIndex, totalFragments, onNavigateFragment }: ReadingPanelProps) {
  const [textSelectionPopup, setTextSelectionPopup] = useState<TextSelectionPopupType>({
    isVisible: false,
    selectedText: '',
    position: { x: 0, y: 0 },
    fragmentId: ''
  });
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (selectedText && fragment) {
          let showPopup = true;
          // Si el texto es muy corto, mostrar advertencia pero permitir popup
          if (selectedText.length <= 3) {
            console.warn('Texto seleccionado muy corto:', selectedText);
          }
          try {
            const range = selection!.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setTextSelectionPopup({
              isVisible: showPopup,
              selectedText,
              position: {
                x: rect.left + (rect.width / 2),
                y: rect.bottom + window.scrollY + 10
              },
              fragmentId: fragment.id
            });
            console.log('Popup de selección mostrado:', selectedText);
          } catch (e) {
            setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
            console.error('No se pudo obtener el rango de selección:', e);
          }
        } else {
          setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
        }
      }, 150);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fragment]);

  const handleSaveSelectionNote = (noteContent: string) => {
    if (!lesson || !fragment || !noteContent.trim() || !textSelectionPopup.selectedText) {
      alert('Debes seleccionar texto y escribir una nota.');
      return;
    }
    try {
      const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
      let notes: Note[] = existingNotes ? JSON.parse(existingNotes) : [];
      const newNote: Note = {
        id: `selection_${fragment.id}_${Date.now()}`,
        content: noteContent.trim(),
        lessonId: lesson.id,
        fragmentId: fragment.id,
        userId: 'current-user',
        isShared: false,
        type: 'selection',
        selectedText: textSelectionPopup.selectedText,
        position: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      notes.push(newNote);
      localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(notes));
      window.dispatchEvent(new CustomEvent('noteAdded', { detail: { fragmentId: fragment.id } }));
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      alert('Error guardando la nota de selección.');
      console.error('Error saving selection note:', error);
    }
  };

  const handleClosePopup = () => {
    setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
    // Limpiar selección
    window.getSelection()?.removeAllRanges();
  };
  const defaultContent = (
    <>
      <p><b>A continuación, encontrará un texto de ejemplo. Puede hacer scroll para leerlo completo.</b></p>
      <p>La Biblia, la colección de libros sagrados en el cristianismo y el judaísmo, ha sido una fuente de inspiración y estudio durante milenios. Su influencia se extiende a la teología, la literatura, el arte, la música y el derecho, impactando profundamente la civilización occidental.</p>
      <p>El primer libro, el Génesis, narra la creación del mundo, la historia de Adán y Eva, el diluvio universal y el pacto de Dios con Abraham. Estos relatos establecen los fundamentos de la fe en un creador todopoderoso y en un plan divino para la humanidad.</p>
      <p>A lo largo de los libros proféticos, encontramos mensajes de advertencia, esperanza y redención. Profetas como Isaías, Jeremías y Daniel registraron visiones y mensajes divinos que hablaban tanto a su tiempo como al futuro. Sus escritos son una rica fuente de sabiduría y un testimonio de la fidelidad de Dios.</p>
      <p>El Nuevo Testamento se centra en la vida, muerte y resurrección de Jesucristo. Los Evangelios de Mateo, Marcos, Lucas y Juan documentan su ministerio, sus enseñanzas y los milagros que realizó. Estos textos son la base del cristianismo, presentando a Jesús como el Mesías prometido y el Hijo de Dios.</p>
      <p>Las Epístolas, escritas por apóstoles como Pablo, Pedro y Juan, son cartas que explican la doctrina cristiana, dan instrucciones para la vida en comunidad y ofrecen aliento a los creyentes. Son documentos fundamentales para entender la fe y la práctica de la iglesia primitiva.</p>
      <p>El libro del Apocalipsis, el último de la Biblia, es una visión profética del fin de los tiempos y la victoria final de Dios sobre el mal. Aunque a menudo se interpreta de diversas maneras, su mensaje central es de esperanza y la promesa de un nuevo cielo y una nueva tierra para los fieles.</p>
      <p>El estudio de la Biblia es un viaje personal y espiritual. Requiere dedicación, meditación y, a menudo, la guía de otros creyentes. Con herramientas como esta aplicación, el acceso al material de estudio y la capacidad de tomar notas y compartir descubrimientos pueden enriquecer enormemente esta experiencia.</p>
      <p>Esta es solo una pequeña introducción. En esta aplicación, podrás explorar cada seminario en detalle, con lecciones dedicadas a cada libro, profeta, y tema de estudio. ¡Te animamos a comenzar tu viaje!</p>
    </>
  );

  // Determinar qué contenido mostrar
  const getDisplayContent = () => {
    if (fragment && fragment.readingMaterial && fragment.readingMaterial.trim()) {
      // Mostrar contenido del fragmento
      return <div dangerouslySetInnerHTML={{ __html: fragment.readingMaterial }} />;
    } else if (lesson && lesson.content && lesson.content.trim()) {
      // Fallback al contenido de la lección
      return <div dangerouslySetInnerHTML={{ __html: lesson.content }} />;
    } else {
      // Contenido por defecto
      return defaultContent;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con navegación */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {lesson ? lesson.title : 'Seleccione una lección'}
            </h1>
            {lesson && (
              <div className="flex items-center space-x-4">
                <CompactAudioPlayer audioFile={fragment?.narrationAudio || null} />
              </div>
            )}
          </div>
          {lesson && totalFragments > 1 && (
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => onNavigateFragment('prev')}
                disabled={fragmentIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                title="Fragmento anterior"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 px-2">
                {fragmentIndex + 1} de {totalFragments}
              </span>
              <button
                onClick={() => onNavigateFragment('next')}
                disabled={fragmentIndex === totalFragments - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                title="Fragmento siguiente"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {fragment && totalFragments > 0 && (
          <div className="text-sm text-gray-500">
            Fragmento {fragment.order} - Material de Lectura
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div 
        ref={contentRef}
        className="flex-grow p-6 overflow-y-auto custom-scrollbar select-text"
      >
        <div className="text-base text-gray-700 space-y-4">
          {getDisplayContent()}
        </div>
      </div>

      {/* Popup de selección de texto */}
      <TextSelectionPopup
        popup={textSelectionPopup}
        onSaveNote={handleSaveSelectionNote}
        onClose={handleClosePopup}
      />
    </div>
  );
}
