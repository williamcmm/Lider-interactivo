// ...existing code...
// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Fragment, TextSelectionPopup as TextSelectionPopupType } from '@/types';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';
import { TextSelectionPopup } from '../ui/TextSelectionPopup';
import { useNotes } from '../../context/NotesContext';

interface ReadingPanelProps {
  lesson: Lesson | null;
  fragment: Fragment | null;
  fragmentIndex: number;
  totalFragments: number;
  onNavigateFragment: (direction: 'prev' | 'next') => void;
}

export function ReadingPanel({ lesson, fragment, fragmentIndex, totalFragments, onNavigateFragment }: ReadingPanelProps) {
  const { fragmentNotes, setFragmentNotes } = useNotes();
  
  const [textSelectionPopup, setTextSelectionPopup] = useState<TextSelectionPopupType>({
    isVisible: false,
    selectedText: '',
    position: { x: 0, y: 0 },
    fragmentId: ''
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Cargar notas cuando cambie el fragmento
  useEffect(() => {
    if (fragment) {
      // Reset play state cuando cambie fragmento
      setIsPlaying(false);
      
      // Pausar audio si está reproduciendo
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      try {
        const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
        if (existingNotes) {
          const localNotes = JSON.parse(existingNotes);
          // Convertir las notas locales al formato del contexto
          const contextNotes = localNotes.map((note: any) => ({
            id: note.id,
            content: note.content,
            fragmentId: note.fragmentId,
            selectedText: note.selectedText,
            contentHtml: note.contentHtml
          }));
          setFragmentNotes(contextNotes);
        } else {
          setFragmentNotes([]);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        setFragmentNotes([]);
      }
    }
  }, [fragment, setFragmentNotes]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (selectedText && fragment) {
          let showPopup = true;
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

  // Función para manejar el play/pause con audio real
  const handlePlayPause = async () => {
    if (!fragment?.narrationAudio || !audioRef.current) {
      alert('No hay audio de narración disponible para este fragmento');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        // Pausar
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Reproducir
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error al reproducir audio:', error);
      alert('Error al reproducir el audio de narración. Verifica que el archivo sea válido.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar eventos del audio
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleAudioError = (error: any) => {
    console.error('Error de audio:', error);
    setIsPlaying(false);
    setIsLoading(false);
    alert('Error al cargar el audio de narración. Verifica la URL o el archivo.');
  };

  const handleAudioLoadStart = () => {
    setIsLoading(true);
  };

  const handleAudioCanPlay = () => {
    setIsLoading(false);
  };

  // Obtener URL del audio
  const getAudioSrc = () => {
    if (!fragment?.narrationAudio) return '';
    
    const audioFile = fragment.narrationAudio;
    if (audioFile.type === 'remote') {
      return audioFile.url;
    } else if (audioFile.file) {
      return URL.createObjectURL(audioFile.file);
    }
    return '';
  };

  const handleSaveSelectionNote = (noteContent: string) => {
    if (!lesson || !fragment || !noteContent.trim() || !textSelectionPopup.selectedText) {
      alert('Debes seleccionar texto y escribir una nota.');
      return;
    }
    
    // Crear nueva nota usando el contexto
    const newNote = {
      id: `selection_${fragment.id}_${Date.now()}`,
      content: noteContent.trim(),
      fragmentId: fragment.id,
      selectedText: textSelectionPopup.selectedText,
      contentHtml: undefined
    };
    
    // Agregar la nota al contexto (esto automáticamente la muestra en NotesPanel)
    setFragmentNotes([...fragmentNotes, newNote]);
    
    // También guardar en localStorage para persistencia
    try {
      const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
      let localNotes: any[] = existingNotes ? JSON.parse(existingNotes) : [];
      localNotes.push({
        ...newNote,
        userId: 'current-user',
        isShared: false,
        type: 'selection',
        position: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(localNotes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Limpiar selección
    window.getSelection()?.removeAllRanges();
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
          <div className="flex items-center w-full">
            <h1 className="text-xl font-bold text-gray-900 flex-1">
              {lesson ? lesson.title : 'Seleccione una lección'}
            </h1>
            {/* Botón de play con narración real */}
            <button
              onClick={handlePlayPause}
              disabled={!fragment?.narrationAudio || isLoading}
              className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full transition-colors duration-200 ${
                fragment?.narrationAudio && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                !fragment?.narrationAudio
                  ? 'Sin audio disponible'
                  : isLoading
                  ? 'Cargando audio...'
                  : isPlaying
                  ? 'Pausar narración'
                  : 'Reproducir narración'
              }
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <FiPause className="w-4 h-4" />
              ) : (
                <FiPlay className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
          {lesson && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateFragment('prev')}
                disabled={fragmentIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                title="Fragmento anterior"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs text-gray-500 flex items-center justify-center whitespace-nowrap">
                {fragmentIndex + 1} de {totalFragments}
              </div>
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
        className="flex-grow h-full max-h-full p-6 overflow-y-auto custom-scrollbar select-text"
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

      {/* Elemento de audio para la narración */}
      {fragment?.narrationAudio && (
        <audio
          ref={audioRef}
          src={getAudioSrc()}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          preload="metadata"
          className="hidden"
        />
      )}
    </div>
  );
}
