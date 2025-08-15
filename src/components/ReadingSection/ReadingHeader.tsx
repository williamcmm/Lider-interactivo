import React from 'react';
import { Lesson, Fragment } from '@/types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { NarrationPlayButton } from './NarrationPlayButton';

interface ReadingHeaderProps {
  /** La lección actual seleccionada o null si no hay ninguna */
  lesson: Lesson | null;
  
  /** El fragmento actual de la lección o null si no hay ninguno */
  fragment: Fragment | null;
  
  /** Índice del fragmento actual (basado en 0) para navegación */
  fragmentIndex: number;
  
  /** Número total de fragmentos disponibles en la lección */
  totalFragments: number;
  
  /** Función callback para navegación entre fragmentos */
  onNavigateFragment: (direction: 'prev' | 'next') => void;
}

/**
 * ReadingHeader - Componente de encabezado simplificado con navegación
 * 
 * Este componente se encarga de:
 * - Mostrar el título de la lección actual
 * - Integrar el botón de reproducción de audio (componente separado)
 * - Proporcionar controles de navegación entre fragmentos
 * - Mostrar el progreso actual (fragmento X de Y)
 * - Mostrar información del fragmento actual
 * 
 * Responsabilidades delegadas:
 * - Gestión de audio: delegada a AudioPlayButton
 * - Estados de reproducción: manejados en AudioPlayButton
 * - Lógica de audio HTML5: encapsulada en AudioPlayButton
 */
export function ReadingHeader({ 
  lesson, 
  fragment, 
  fragmentIndex, 
  totalFragments, 
  onNavigateFragment 
}: ReadingHeaderProps) {

  return (
    <>
      {/* Contenedor principal del header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        {/* Fila principal: Título + Botón Audio + Navegación */}
        <div className="flex items-center justify-between mb-2">
          {/* Sección izquierda: Título y botón de audio */}
          <div className="flex items-center w-full">
            <h1 className="text-xl font-bold text-gray-900 flex-1 ml-8">
              {lesson ? lesson.title : 'Seleccione una lección'}
            </h1>
            
            {/* Botón de reproducción de narración - Componente separado */}
            <NarrationPlayButton fragment={fragment} />
          </div>
          
          {/* Sección derecha: Controles de navegación entre fragmentos */}
          {lesson && (
            <div className="flex items-center gap-2">
              {/* Botón fragmento anterior */}
              <button
                onClick={() => onNavigateFragment('prev')}
                disabled={fragmentIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                title="Fragmento anterior"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Indicador de progreso */}
              <div className="text-xs text-gray-500 flex items-center justify-center whitespace-nowrap">
                {fragmentIndex + 1} de {totalFragments}
              </div>
              
              {/* Botón fragmento siguiente */}
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
        
        {/* Información adicional del fragmento actual */}
        {fragment && totalFragments > 0 && (
          <div className="text-sm text-gray-500">
            Fragmento {fragment.order} - Material de Lectura
          </div>
        )}
      </div>
    </>
  );
}
