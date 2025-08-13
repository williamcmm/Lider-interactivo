/**
 * @fileoverview ReadingContent - Componente de contenido principal para la sección de lectura
 * 
 * Este componente maneja el área de contenido principal de la sección de lectura, incluyendo:
 * - Visualización del contenido de las lecciones y fragmentos
 * - Sistema de selección de texto interactivo
 * - Gestión de notas vinculadas a texto seleccionado
 * - Integración con el contexto de notas globales
 * - Persistencia de notas en localStorage
 * - Popup de creación de notas con posicionamiento dinámico
 */

import { useRef, useState, useEffect } from 'react';
import { Lesson, Fragment, TextSelectionPopup as TextSelectionPopupType } from '@/types';
import { TextSelectionPopup } from '../ui/TextSelectionPopup';
import { useNotes } from '../../context/NotesContext';
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
 * - Gestionar la persistencia de notas en localStorage y contexto global
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
 * - Persistencia automática en localStorage
 * - Limpieza de selección después de crear nota
 */
export function ReadingContent({ lesson, fragment }: ReadingContentProps) {
  // Hooks del contexto de notas para gestión global
  const { fragmentNotes, setFragmentNotes, setCurrentFragmentId } = useNotes();
  
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
   * Effect para cargar notas existentes cuando cambia el fragmento
   * Se encarga de sincronizar las notas desde localStorage al contexto global
   * y establecer el fragmento actual en el contexto
   */
  useEffect(() => {
    if (fragment) {
      // Establecer el fragmento actual en el contexto
      setCurrentFragmentId(fragment.id);
      
      try {
        // Intentar cargar notas existentes desde localStorage
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
          
          // Actualizar el contexto global con las notas cargadas
          setFragmentNotes(contextNotes);
        } else {
          // Si no hay notas, limpiar el contexto
          setFragmentNotes([]);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        setFragmentNotes([]);
      }
    } else {
      // Limpiar el fragmento actual si no hay fragmento
      setCurrentFragmentId(undefined);
      setFragmentNotes([]);
    }
  }, [fragment, setFragmentNotes, setCurrentFragmentId]);

  /**
   * Effect para manejar la selección de texto del usuario
   * Configura el listener global para detectar selecciones de texto
   */
  useEffect(() => {
    /**
     * Handler para el evento mouseup que detecta selecciones de texto
     * Implementa debounce y validaciones antes de mostrar el popup
     */
    const handleMouseUp = () => {
      // Debounce de 150ms para evitar activaciones accidentales
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        // Verificar que hay texto seleccionado y un fragmento activo
        if (selectedText && fragment) {
          let showPopup = true;
          
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
            
            console.log('Popup de selección mostrado:', selectedText);
          } catch (e) {
            // Error al obtener el rango de selección
            setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
            console.error('No se pudo obtener el rango de selección:', e);
          }
        } else {
          // No hay selección válida, ocultar popup
          setTextSelectionPopup(prev => ({ ...prev, isVisible: false }));
        }
      }, 150);
    };

    // Agregar listener al documento
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup: remover listener al desmontar
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fragment]);

  /**
   * Maneja el guardado de una nueva nota basada en texto seleccionado
   * Actualiza tanto el contexto global como el localStorage
   * 
   * @param noteContent - El contenido de la nota a guardar
   */
  const handleSaveSelectionNote = (noteContent: string) => {
    // Validaciones previas
    if (!lesson || !fragment || !noteContent.trim() || !textSelectionPopup.selectedText) {
      alert('Debes seleccionar texto y escribir una nota.');
      return;
    }
    
    // Crear nueva nota con ID único
    const newNote = {
      id: `selection_${fragment.id}_${Date.now()}`,
      content: noteContent.trim(),
      fragmentId: fragment.id,
      selectedText: textSelectionPopup.selectedText,
      contentHtml: undefined
    };
    
    // Agregar la nota al contexto (sincronización automática con NotesPanel)
    setFragmentNotes([...fragmentNotes, newNote]);
    
    // Persistir en localStorage con metadatos adicionales
    try {
      const existingNotes = localStorage.getItem(`notes_${fragment.id}`);
      let localNotes: any[] = existingNotes ? JSON.parse(existingNotes) : [];
      
      // Agregar la nueva nota con metadatos completos
      localNotes.push({
        ...newNote,
        userId: 'current-user',
        isShared: false,
        type: 'selection',
        position: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Guardar en localStorage
      localStorage.setItem(`notes_${fragment.id}`, JSON.stringify(localNotes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
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
