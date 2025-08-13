/**
 * @fileoverview ReadingPanel - Componente principal orquestador para la sección de lectura
 * 
 * Este componente actúa como el contenedor principal que combina y coordina
 * el encabezado de navegación y el contenido de lectura. Es responsable de
 * mantener la estructura de layout y pasar las props necesarias a sus 
 * componentes hijos.
 */

import React from 'react';
import { Lesson, Fragment } from '@/types';
import { ReadingHeader } from './ReadingHeader';
import { ReadingContent } from './ReadingContent';

/**
 * Props para el componente ReadingPanel
 * 
 * @interface ReadingPanelProps
 */
interface ReadingPanelProps {
  /** La lección actual seleccionada o null si no hay ninguna */
  lesson: Lesson | null;
  
  /** El fragmento actual de la lección o null si no hay ninguno */
  fragment: Fragment | null;
  
  /** Índice del fragmento actual (basado en 0) */
  fragmentIndex: number;
  
  /** Número total de fragmentos disponibles en la lección */
  totalFragments: number;
  
  /** Función callback para navegación entre fragmentos */
  onNavigateFragment: (direction: 'prev' | 'next') => void;
}

// Exportar el tipo para uso externo
export type { ReadingPanelProps };

/**
 * ReadingPanel - Componente orquestrador principal de la sección de lectura
 * 
 * Este componente se encarga de:
 * - Estructurar el layout principal con flexbox vertical
 * - Coordinar la comunicación entre header y content
 * - Distribuir las props apropiadas a cada subcomponente
 * - Mantener la responsabilidad de layout sin lógica de negocio
 *
 * @param props - Las propiedades del componente
 * @returns JSX.Element - El panel de lectura completo
 * 
 * @example
 * ```tsx
 * <ReadingPanel
 *   lesson={currentLesson}
 *   fragment={currentFragment}
 *   fragmentIndex={2}
 *   totalFragments={10}
 *   onNavigateFragment={(direction) => handleNavigation(direction)}
 * />
 * ```
 */
export function ReadingPanel({ 
  lesson, 
  fragment, 
  fragmentIndex, 
  totalFragments, 
  onNavigateFragment 
}: ReadingPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* 
        Header Component - Maneja navegación y reproducción de audio
        Recibe toda la información necesaria para mostrar controles apropiados
      */}
      <ReadingHeader
        lesson={lesson}
        fragment={fragment}
        fragmentIndex={fragmentIndex}
        totalFragments={totalFragments}
        onNavigateFragment={onNavigateFragment}
      />
      
      {/* 
        Content Component - Maneja el contenido principal y selección de texto
        Recibe solo la información necesaria para mostrar contenido
      */}
      <ReadingContent
        lesson={lesson}
        fragment={fragment}
      />
    </div>
  );
}
