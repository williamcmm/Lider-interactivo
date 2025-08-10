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
import { NotesProvider } from '../context/NotesContext';
// ...existing code...
import { Seminar, Series, Lesson } from '@/types';
import { LocalStorage } from '@/lib/storage';
import { initializeSharedNotes } from '@/data/sharedNotes';
import { initializeTestData } from '@/data/testData';

export function StudyApp() {
  // Estados y handlers para NotesPanel
  const [activeTab, setActiveTab] = useState<'ayuda' | 'notas' | 'compartidas' | 'compartir'>('notas');
  const [fragmentNotes, setFragmentNotes] = useState<any[]>([]);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [selectedSharedUser, setSelectedSharedUser] = useState<string | undefined>(undefined);
  const [sharedUserNotes, setSharedUserNotes] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Handlers básicos
  const handleShare = () => {
    setShareStatus('Notas compartidas correctamente');
  };
  const handleSelectSharedUser = (email: string) => {
    setSelectedSharedUser(email);
    setSharedUserNotes([]); // Aquí deberías cargar las notas compartidas reales
  };
  const saveNewNote = () => {
    if (newNoteText.trim()) {
      setFragmentNotes([...fragmentNotes, { id: Date.now().toString(), content: newNoteText }]);
      setNewNoteText('');
      setIsAddingNote(false);
    }
  };
  const deleteNote = (id: string) => {
    setFragmentNotes(fragmentNotes.filter(note => note.id !== id));
  };
  // Escuchar evento para abrir la barra desde el botón hamburguesa inferior (solo una vez)
  useEffect(() => {
    const openSidebarMobile = () => setIsSidebarOpen(true);
    window.addEventListener('openSidebarMobile', openSidebarMobile);
    return () => window.removeEventListener('openSidebarMobile', openSidebarMobile);
  }, []);
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
  const [isMobile, setIsMobile] = useState(false);
  // Estado para contraer/expandir sidebar escritorio, inicializado fijo y sincronizado en useEffect
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) setIsSidebarCollapsed(saved === 'true');
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed ? 'true' : 'false');
    }
  }, [isSidebarCollapsed]);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Estado para abrir/cerrar sidebar, siempre cerrado por defecto
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [activePanel, setActivePanel] = useState<string>('all');

  // Variables derivadas
  const fragment = currentLesson?.fragments && currentLesson.fragments.length > 0 ? currentLesson.fragments[currentFragmentIndex] || null : null;
  const totalFragments = currentLesson?.fragments ? currentLesson.fragments.length : 0;

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
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

    return (
      <NotesProvider>
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
            {/* Sidebar escritorio con colapsado */}
            {!isMobile && (
              <div className={`transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-10' : 'w-[300px]'} relative h-full`}>
                {/* Flecha para expandir/cerrar */}
                {isSidebarCollapsed ? (
                  <button
                    className="absolute top-4 left-0 z-30 bg-gray-300 hover:bg-gray-400 rounded-r-full p-1 shadow"
                    style={{ width: 32, height: 58 }}
                    onClick={() => { setIsSidebarCollapsed(false); setIsSidebarOpen(true); }}
                    aria-label="Expandir biblioteca"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                ) : (
                  <button
                    className="absolute top-4 right-0 z-30 bg-gray-300 hover:bg-gray-400 rounded-l-full p-1 shadow"
                    style={{ width: 32, height: 58 }}
                    onClick={() => { setIsSidebarCollapsed(true); setIsSidebarOpen(false); }}
                    aria-label="Contraer biblioteca"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                )}
                {/* Sidebar solo si expandido y abierto */}
                {!isSidebarCollapsed && isSidebarOpen && (
                  <Sidebar
                    isOpen={true}
                    onClose={() => { setIsSidebarOpen(false); setIsSidebarCollapsed(true); }}
                    containers={allContainers}
                    onSelectLesson={selectLesson}
                  />
                )}
              </div>
            )}
            {/* Sidebar móvil solo se abre desde el botón hamburguesa en la barra inferior */}
            {isMobile && isSidebarOpen && (
              <Sidebar
                isOpen={true}
                onClose={toggleSidebar}
                containers={allContainers}
                onSelectLesson={selectLesson}
              />
            )}

            {/* Paneles principales: forzar 3 columnas en móvil vertical */}
            <div className="flex-1 h-full p-2">
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
                      <Panel defaultSize={70} minSize={30} className="h-full">
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
                      <Panel defaultSize={30} minSize={20} className="h-full">
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
                      <NotesPanel
                        lesson={currentLesson}
                        fragment={fragment}
                      />
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
                <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
                  <NotesPanel lesson={currentLesson} fragment={fragment} />
                </div>
              )}
            </div>
          </div>
        </div>
      </NotesProvider>
  );
}