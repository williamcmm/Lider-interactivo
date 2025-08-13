'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TopBar } from './ui/TopBar';
import { Sidebar } from './ui/Sidebar';
import { ReadingPanel } from './ReadingSection/ReadingPanel';
import { SlidePanel } from './SlideSection/SlidePanel';
import { MusicPanel } from './MusicSection/MusicPanel';
import NotesPanel from './NotesSection/NotesPanel';
// ...existing code...
import { Seminar, Series, Lesson } from '@/types';
import { LocalStorageManager } from '@/lib/storage';
import { useSidebarStore } from '@/store/sidebarStore';
import { useNotesStore } from '@/store/notesStore';

export function StudyApp() {
  // Zustand store para sidebar  
  const { 
    isSidebarOpen, 
    isMobile,
    closeSidebar, 
    toggleSidebar,
    setIsMobile
  } = useSidebarStore();
  
  // Zustand store para notas - inicializar en el componente principal
  const { setSharedUsers } = useNotesStore();

  // Panel por defecto: 'all' en escritorio/tablet, 'reading' en móvil vertical
  const [activePanel, setActivePanel] = useState<string>('all');
  // Estado para mostrar aviso en móvil vertical en 'Ver todo'
  const [showRotateMessage, setShowRotateMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (activePanel === 'all' && window.innerHeight > window.innerWidth) {
        setShowRotateMessage(true);
      } else {
        setShowRotateMessage(false);
      }
    } else {
      setShowRotateMessage(false);
    }
  }, [activePanel]);
  // Estados para la aplicación principal
  
  // Inicializar detección de móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Remover listeners de eventos antiguos ya que ahora usamos Zustand
  // useEffect(() => {
  //   const openSidebarMobile = () => setIsSidebarOpen(true);
  //   window.addEventListener('openSidebarMobile', openSidebarMobile);
  //   return () => window.removeEventListener('openSidebarMobile', openSidebarMobile);
  // }, []);
  // Estado para orientación
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  // Detectar si es móvil para mostrar hamburguesa
  // Removido porque ahora usamos Zustand
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => {
    const setInitialPanel = () => {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setActivePanel('reading');
      } else {
        setActivePanel('all');
      }
    };
    setInitialPanel();
    window.addEventListener('resize', setInitialPanel);
    window.addEventListener('orientationchange', setInitialPanel);
    return () => {
      window.removeEventListener('resize', setInitialPanel);
      window.removeEventListener('orientationchange', setInitialPanel);
    };
  }, []);


  // Variables derivadas
  const fragment = currentLesson?.fragments && currentLesson.fragments.length > 0 ? currentLesson.fragments[currentFragmentIndex] || null : null;
  const totalFragments = currentLesson?.fragments ? currentLesson.fragments.length : 0;

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    // Inicializar usuarios compartidos en el store
    setSharedUsers(['usuario1@email.com', 'usuario2@email.com']);
    
    // Cargar datos desde localStorage (solo si existen)
    const storedSeminars = LocalStorageManager.getSeminars();
    const storedSeries = LocalStorageManager.getSeries();
    
    setSeminars(storedSeminars);
    setSeries(storedSeries);
    
    // Seleccionar la primera lección disponible por defecto (solo si hay datos)
    if (storedSeminars.length > 0 && storedSeminars[0].lessons.length > 0) {
      setCurrentLesson(storedSeminars[0].lessons[0]);
    } else if (storedSeries.length > 0 && storedSeries[0].lessons.length > 0) {
      setCurrentLesson(storedSeries[0].lessons[0]);
    } else {
      // No hay datos, mantener currentLesson como null
      setCurrentLesson(null);
    }
  }, [setSharedUsers]);

  // Combinar seminarios y series para la navegación
  const allContainers = [
    ...seminars.map(s => ({ ...s, type: 'seminar' as const })),
    ...series.map(s => ({ ...s, type: 'series' as const }))
  ].sort((a, b) => a.order - b.order);

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentFragmentIndex(0); // Resetear al primer fragmento
    // Cerrar sidebar en móvil después de seleccionar
    if (isMobile) {
      closeSidebar();
    }
  };

  // Navegación de fragmentos sin sincronización remota
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
      if (window.innerWidth >= 768 && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, closeSidebar]);

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-100 text-gray-900 font-sans flex flex-col">
          {/* Barra Superior */}
            <TopBar 
            currentLesson={currentLesson}
            currentFragment={fragment}
            fragmentIndex={currentFragmentIndex}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />
          {/* Sidebar siempre visible en escritorio, hamburguesa en móvil */}
          <div className="flex-1 h-full flex">
            {/* Botón de toggle para desktop - siempre visible */}
            {!isMobile && (
              <button
                className={`fixed top-16 left-0 z-40 bg-gray-300 hover:bg-gray-400 rounded-r-full p-1 shadow transition-all duration-500 ease-in-out ${
                  isSidebarOpen ? 'translate-x-[400px]' : 'translate-x-0'
                }`}
                style={{ width: 32, height: 58 }}
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Cerrar biblioteca" : "Abrir biblioteca"}
              >
                {isSidebarOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                )}
              </button>
            )}

            {/* Sidebar desktop - overlay */}
            {!isMobile && (
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                containers={allContainers}
                onSelectLesson={selectLesson}
                isDesktop={true}
              />
            )}

            {/* Sidebar móvil solo se abre desde el botón hamburguesa */}
            {isMobile && (
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                containers={allContainers}
                onSelectLesson={selectLesson}
                isDesktop={false}
              />
            )}

            {/* Paneles principales: NAVEGACIÓN POR PESTAÑAS EN MÓVIL */}
            <div className="flex-1 h-full p-2">
              {/* --- CAMBIO FINAL: Alternancia por iconos/menu superior en escritorio y móvil apaisado, solo un panel en móvil vertical --- */}
              {isMobile && window.innerHeight > window.innerWidth ? (
                <div className="h-full w-full bg-white shadow-xl rounded-lg overflow-y-auto p-2" style={{paddingBottom: '80px'}}>
                  {/* Aviso elegante en 'Ver todo' en móvil vertical */}
                  {activePanel === 'all' && showRotateMessage ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 text-blue-900 px-6 py-5 rounded-xl shadow-lg text-center max-w-xs mx-auto animate-fade-in">
                        <div className="flex flex-col items-center mb-3">
                          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-400 mb-2">
                            <rect x="4" y="7" width="16" height="10" rx="2" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
                            <path d="M8 19h8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M12 22v-3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span className="font-semibold text-lg">Vista limitada</span>
                        </div>
                        <span className="block text-base">Gira tu celular a <span className="font-bold text-indigo-600">horizontal</span> y luego haz clic en <span className="font-bold text-indigo-600">Modo Presentador</span> para ver la lección en pantalla completa.</span>
                        <span className="block mt-2 text-sm text-blue-700 opacity-80">¡Así tendrás la mejor experiencia de estudio!</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {activePanel === 'reading' && (
                        <ReadingPanel 
                          lesson={currentLesson} 
                          fragment={fragment}
                          fragmentIndex={currentFragmentIndex}
                          totalFragments={totalFragments}
                          onNavigateFragment={navigateToFragment}
                        />
                      )}
                      {activePanel === 'slides' && (
                        <SlidePanel
                          fragment={fragment}
                          fragmentIndex={currentFragmentIndex}
                          totalFragments={totalFragments}
                          onNavigateFragment={navigateToFragment}
                        />
                      )}
                      {activePanel === 'music' && (
                        <MusicPanel />
                      )}
                      {activePanel === 'notes' && (
                        <div className="pb-24">
                          <NotesPanel />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // Alternancia por iconos/menu superior en escritorio y móvil apaisado
                <>
                  {activePanel === 'all' && (
                    <PanelGroup
                      direction="horizontal"
                      className={`h-full flex-1${isMobile ? ' min-w-[750px] overflow-x-auto' : ''}`}
                      style={isMobile ? { height: '100%', minWidth: '750px' } : { height: '100%' }}
                    >
                      {/* Panel de Lectura - Izquierda */}
                      <Panel defaultSize={35} minSize={20} className="h-full">
                        <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                          <ReadingPanel 
                            lesson={currentLesson} 
                            fragment={fragment}
                            fragmentIndex={currentFragmentIndex}
                            totalFragments={totalFragments}
                            onNavigateFragment={navigateToFragment}
                          />
                        </div>
                      </Panel>
                      <PanelResizeHandle className="resize-handle-vertical bg-gray-300 w-2" />
                      {/* Panel Central - División Vertical */}
                      <Panel defaultSize={35} minSize={20} className="h-full">
                        <PanelGroup direction="vertical" className="h-full flex-1" style={{height: '100%'}}>
                            {/* Panel de Diapositivas - Superior */}
                            <Panel defaultSize={50} minSize={20} className="h-full">
                              <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                                <SlidePanel
                                  fragment={fragment}
                                  fragmentIndex={currentFragmentIndex}
                                  totalFragments={totalFragments}
                                  onNavigateFragment={navigateToFragment}
                                />
                              </div>
                            </Panel>
                            <PanelResizeHandle className="resize-handle-horizontal bg-gray-300 h-2" />
                            {/* Panel de Música - Inferior */}
                            <Panel defaultSize={50} minSize={20} className="h-full">
                              <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                                <MusicPanel />
                              </div>
                            </Panel>
                          </PanelGroup>
                      </Panel>
                      <PanelResizeHandle className="resize-handle-vertical bg-gray-300 w-2" />
                      {/* Panel de Notas - Derecha */}
                      <Panel defaultSize={30} minSize={20} className="h-full">
                        <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                          <NotesPanel />
                        </div>
                      </Panel>
                    </PanelGroup>
                  )}
                  {activePanel === 'reading' && (
                    <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                      <ReadingPanel 
                        lesson={currentLesson} 
                        fragment={fragment}
                        fragmentIndex={currentFragmentIndex}
                        totalFragments={totalFragments}
                        onNavigateFragment={navigateToFragment}
                      />
                    </div>
                  )}
                  {activePanel === 'slides' && (
                    <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                      <SlidePanel
                        fragment={fragment}
                        fragmentIndex={currentFragmentIndex}
                        totalFragments={totalFragments}
                        onNavigateFragment={navigateToFragment}
                      />
                    </div>
                  )}
                  {activePanel === 'music' && (
                    <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                      <MusicPanel />
                    </div>
                  )}
                  {activePanel === 'notes' && (
                    <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden pb-24">
                      <NotesPanel />
                    </div>
                  )}
                </>
              )}
              {activePanel === 'reading' && (
                <div className="h-full flex-1 bg-white shadow-xl rounded-lg overflow-hidden">
                  <ReadingPanel 
                    lesson={currentLesson} 
                    fragment={fragment}
                    fragmentIndex={currentFragmentIndex}
                    totalFragments={totalFragments}
                    onNavigateFragment={navigateToFragment}
                  />
                </div>
              )}
              {activePanel === 'slides' && (
                <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                  <SlidePanel
                    fragment={fragment}
                    fragmentIndex={currentFragmentIndex}
                    totalFragments={totalFragments}
                    onNavigateFragment={navigateToFragment}
                  />
                </div>
              )}
              {activePanel === 'music' && (
                <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                  <MusicPanel />
                </div>
              )}
              {activePanel === 'notes' && (
                <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                  <NotesPanel />
                </div>
              )}
            </div>
          </div>
        </div>
  );
}