'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TopBar } from './TopBar';
import { IconBar } from './IconBar';
import { Sidebar } from './Sidebar';
import { ReadingPanel } from './ReadingPanel';
import { SlidePanel } from './SlidePanel';
import { MusicPanel } from './MusicPanel';
import { NotesPanel } from './NotesPanel';
import { Seminar, Series, Lesson } from '@/types';
import { LocalStorage } from '@/lib/storage';
import { initializeSharedNotes } from '@/data/sharedNotes';
import { initializeTestData } from '@/data/testData';

export function StudyApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    // Inicializar notas compartidas de ejemplo
    initializeSharedNotes();
    
    // Inicializar datos de prueba si no hay seminarios
    const existingSeminars = LocalStorage.getSeminars();
    if (existingSeminars.length === 0) {
      initializeTestData();
    }
    
    // Cargar datos existentes
    const storedSeminars = LocalStorage.getSeminars();
    const storedSeries = LocalStorage.getSeries();
    
    setSeminars(storedSeminars);
    setSeries(storedSeries);
    
    // Seleccionar la primera lección disponible por defecto
    if (storedSeminars.length > 0 && storedSeminars[0].lessons.length > 0) {
      setCurrentLesson(storedSeminars[0].lessons[0]);
    } else if (storedSeries.length > 0 && storedSeries[0].lessons.length > 0) {
      setCurrentLesson(storedSeries[0].lessons[0]);
    }
  }, []);

  // Combinar seminarios y series para la navegación
  const allContainers = [
    ...seminars.map(s => ({ ...s, type: 'seminar' as const })),
    ...series.map(s => ({ ...s, type: 'series' as const }))
  ].sort((a, b) => a.order - b.order);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentFragmentIndex(0); // Resetear al primer fragmento
    // Cerrar sidebar en móvil después de seleccionar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Navegación de fragmentos
  const navigateToFragment = (direction: 'prev' | 'next') => {
    if (!currentLesson || !currentLesson.fragments.length) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(currentFragmentIndex + 1, currentLesson.fragments.length - 1)
      : Math.max(currentFragmentIndex - 1, 0);
    
    setCurrentFragmentIndex(newIndex);
  };

  const goToFragment = (index: number) => {
    if (!currentLesson || !currentLesson.fragments.length) return;
    const clampedIndex = Math.max(0, Math.min(index, currentLesson.fragments.length - 1));
    setCurrentFragmentIndex(clampedIndex);
  };

  // Obtener fragmento actual
  const currentFragment = currentLesson?.fragments[currentFragmentIndex] || null;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Barra Superior */}
      <TopBar 
        currentLesson={currentLesson}
        currentFragment={currentFragment}
        fragmentIndex={currentFragmentIndex}
      />

      {/* Contenedor Principal - altura fija calculada */}
      <div className="flex flex-row flex-1 w-full relative" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Barra de Iconos */}
        <IconBar onToggleSidebar={toggleSidebar} />

        {/* Sidebar Desplegable */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          containers={allContainers}
          onSelectLesson={selectLesson}
        />

        {/* Paneles Principales Redimensionables */}
        <div className="flex-1 h-full p-2">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Panel de Lectura - Izquierda */}
            <Panel defaultSize={35} minSize={20} className="h-full">
              <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                <ReadingPanel 
                  lesson={currentLesson} 
                  fragment={currentFragment}
                  fragmentIndex={currentFragmentIndex}
                  totalFragments={currentLesson?.fragments.length || 0}
                  onNavigateFragment={navigateToFragment}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle-vertical" />

            {/* Panel Central - División Vertical */}
            <Panel defaultSize={35} minSize={20} className="h-full">
              <PanelGroup direction="vertical" className="h-full">
                {/* Panel de Diapositivas - Superior */}
                <Panel defaultSize={70} minSize={30} className="h-full">
                  <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                    <SlidePanel 
                      fragment={currentFragment}
                      fragmentIndex={currentFragmentIndex}
                      totalFragments={currentLesson?.fragments.length || 0}
                      onNavigateFragment={navigateToFragment}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="resize-handle-horizontal" />

                {/* Panel de Música - Inferior */}
                <Panel defaultSize={30} minSize={15} className="h-full">
                  <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                    <MusicPanel />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="resize-handle-vertical" />

            {/* Panel de Notas - Derecha */}
            <Panel defaultSize={30} minSize={20} className="h-full">
              <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                <NotesPanel 
                  fragment={currentFragment}
                  lesson={currentLesson}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 shadow-inner flex-shrink-0" />
    </div>
  );
}
