import { useRef, useState, useEffect } from 'react';
import { Lesson, Fragment, TextSelectionPopup as TextSelectionPopupType } from '@/types';
import { TextSelectionPopup } from '../ui/TextSelectionPopup';
import { useNotesStore } from '../../store/notesStore';
import { defaultContentHtml } from '../../constants/defaultContent';

interface ReadingContentProps {
  /** La lección actual seleccionada o null si no hay ninguna */
  lesson: Lesson | null;
  
  /** El fragmento actual de la lección o null si no hay ninguno */
  fragment: Fragment | null;
}

/**
 * ReadingContent - Componente de contenido principal con selección de texto
 * 
 * Este componente se encarga de:
 * - Renderizar el contenido de lecciones y fragmentos usando dangerouslySetInnerHTML
 * - Detectar selecciones de texto del usuario
 * - Mostrar popup contextual para crear notas sobre texto seleccionado
 * - Gestionar la persistencia de notas con Server Actions y contexto global
 * - Cargar y sincronizar notas existentes al cambiar de fragmento
 * - Proporcionar fallbacks de contenido cuando no hay datos específicos
 * 
 * Funcionalidades de selección de texto:
 * - Detección automática de selección con debounce de 150ms
 * - Validación de longitud mínima de texto (>3 caracteres)
 * - Posicionamiento dinámico del popup basado en la posición del texto
 * - Manejo de errores de selección con logs detallados
 * 
 * Sistema de notas:
 * - Creación de notas vinculadas a texto específico
 * - Sincronización bidireccional con contexto global
 * - Persistencia en servidor
 * - Limpieza de selección después de crear nota
 */
export function ReadingContent({ lesson, fragment }: ReadingContentProps) {
  // Hooks del store de notas para gestión global
  const { setCurrentFragmentId, addNote } = useNotesStore();
  
  /** Referencia al contenedor principal para scroll y manipulación */
  const contentRef = useRef<HTMLDivElement>(null);
  
  /**
   * Estado del popup de selección de texto
   * Controla visibilidad, posición y contenido del popup
   */
  const [textSelectionPopup, setTextSelectionPopup] = useState<TextSelectionPopupType>({
    isVisible: false,
    selectedText: '',
    position: { x: 0, y: 0 },
    fragmentId: ''
  });

  /**
   * Effect para establecer el fragmento actual en el store
   * El store automáticamente carga las notas cuando cambia el fragmento
   */
  useEffect(() => {
    setCurrentFragmentId(fragment?.id);
  }, [fragment?.id, setCurrentFragmentId]);

  /**
   * Effect para manejar la selección de texto del usuario
   * Configura el listener global para detectar selecciones de texto
   */
  useEffect(() => {
    /**
     * Handler para el evento mouseup que detecta selecciones de texto
     * Implementa debounce y validaciones antes de mostrar el popup
     */
    const handleMouseUp = (event: MouseEvent) => {
      // Si el click fue dentro del popup, no hacer nada
      const target = event.target as HTMLElement;
      if (target.closest('[data-popup="text-selection"]')) {
        return;
      }
      
      // Debounce de 150ms para evitar activaciones accidentales
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        // Verificar que hay texto seleccionado y un fragmento activo
        if (selectedText && fragment) {
          const showPopup = true;
          
          // Validar longitud mínima del texto seleccionado
          if (selectedText.length <= 3) {
            console.warn('Texto seleccionado muy corto:', selectedText);
          }
          
          try {
            // Obtener posición de la selección para posicionar el popup
            const range = selection!.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Configurar el popup con la información de la selección
            setTextSelectionPopup({
              isVisible: showPopup,
              selectedText,
              position: {
                x: rect.left + (rect.width / 2), // Centrado horizontalmente
                y: rect.bottom + window.scrollY + 10 // 10px debajo de la selección
              },
              fragmentId: fragment.id
            });
          } catch (e) {
            // Error al obtener el rango de selección
            setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
            console.error('No se pudo obtener el rango de selección:', e);
          }
        } else {
          // No hay selección válida, ocultar popup solo si no está ya visible
          // o si el click fue fuera del popup
          if (textSelectionPopup.isVisible) {
            // Solo ocultar si el click no fue dentro del popup
            const target = event.target as HTMLElement;
            if (!target.closest('[data-popup="text-selection"]')) {
              setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
            }
          }
        }
      }, 150);
    };

    // Agregar listener al documento
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup: remover listener al desmontar
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fragment, textSelectionPopup.isVisible]);

  /**
   * Maneja el guardado de una nueva nota basada en texto seleccionado
   * Usa el store de Zustand para agregar la nota con persistencia automática
   * 
   * @param noteContent - El contenido de la nota a guardar
   */
  const handleSaveSelectionNote = (noteContent: string) => {
    // Validaciones previas
    if (!lesson || !fragment || !noteContent.trim() || !textSelectionPopup.selectedText) {
      alert('Debes seleccionar texto y escribir una nota.');
      return;
    }
    
    // Usar el store para agregar la nota (persistencia automática)
    addNote({
      content: noteContent.trim(),
      fragmentId: fragment.id,
      selectedText: textSelectionPopup.selectedText,
      contentHtml: undefined
    });
    
    // Limpiar la selección de texto
    window.getSelection()?.removeAllRanges();
  };

  /**
   * Maneja el cierre del popup de selección
   * Oculta el popup y limpia la selección de texto
   */
  const handleClosePopup = () => {
    setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
    // Limpiar selección de texto
    window.getSelection()?.removeAllRanges();
  };

  /**
   * Determina qué contenido mostrar basado en la prioridad:
   * 1. Contenido del fragmento actual (si existe)
   * 2. Contenido de la lección (fallback)
   * 3. Contenido por defecto (último recurso)
   * 
   * @returns JSX.Element - El contenido a renderizar
   */
  const getDisplayContent = () => {
    if (fragment && fragment.readingMaterial && fragment.readingMaterial.trim()) {
      // Prioridad 1: Mostrar contenido específico del fragmento
      return <div dangerouslySetInnerHTML={{ __html: fragment.readingMaterial }} />;
    } else if (lesson && lesson.content && lesson.content.trim()) {
      // Prioridad 2: Fallback al contenido general de la lección
      return <div dangerouslySetInnerHTML={{ __html: lesson.content }} />;
    } else {
      // Prioridad 3: Contenido por defecto cuando no hay datos específicos
      return <div dangerouslySetInnerHTML={{ __html: defaultContentHtml }} />;
    }
  };

  return (
    <>
      {/* Área principal de contenido con scroll independiente */}
      <div 
        ref={contentRef}
        className="flex-grow h-full max-h-full p-6 overflow-y-auto custom-scrollbar select-text"
      >
        {/* Wrapper del contenido con estilos base */}
        <div className="text-base text-gray-700 space-y-4">
          {getDisplayContent()}
        </div>
      </div>

      {/* Popup de selección de texto posicionado absolutamente */}
      <TextSelectionPopup
        popup={textSelectionPopup}
        onSaveNote={handleSaveSelectionNote}
        onClose={handleClosePopup}
      />
    </>
  );
}
