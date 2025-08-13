import React, { useState, useEffect } from 'react';
import { FiPlay, FiShare2, FiSettings, FiBookOpen, FiMonitor, FiMusic, FiEdit, FiX, FiLogIn } from 'react-icons/fi';
import { TbCast } from 'react-icons/tb';
import Link from 'next/link';
import { Fragment, Lesson } from '../../types';
import { useSidebarStore } from '../../store/sidebarStore';
import { ShareModal } from './ShareModal';
interface TopBarProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export function TopBar({ currentLesson, currentFragment, fragmentIndex, activePanel, setActivePanel }: TopBarProps) {
  const panelOptions = [
    { key: 'reading', icon: <FiBookOpen className="w-5 h-5" /> },
    { key: 'slides', icon: <FiMonitor className="w-5 h-5" /> },
    { key: 'music', icon: <FiMusic className="w-5 h-5" /> },
    { key: 'notes', icon: <FiEdit className="w-5 h-5" /> }
  ];

  // Zustand store
  const { isSidebarOpen, isMobile, toggleSidebar, setIsMobile } = useSidebarStore();

  const [isLandscape, setIsLandscape] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [presentationRequest, setPresentationRequest] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const SUPER_ADMIN_EMAIL = 'william.comunidad@gmail.com';
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile); // Actualizar Zustand
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [setIsMobile]);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const startCasting = async () => {
    try {
      if ('presentation' in navigator) {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        const request = new (window as any).PresentationRequest([presentationUrl]);
        const connection = await request.start();
        setIsCasting(true);
        setPresentationRequest(request);
        if (currentFragment) {
          const slideContent = currentFragment.slides && currentFragment.slides.length > 0 
            ? currentFragment.slides[0].content 
            : '';
          connection.send(JSON.stringify({
            type: 'update-slide',
            slide: slideContent,
            fragmentIndex: fragmentIndex,
            lessonTitle: currentLesson?.title
          }));
        }
      } else {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        window.open(presentationUrl, '_blank', 'width=1280,height=720');
      }
    } catch (error) {
      console.error('Error al iniciar presentación:', error);
      alert('No se pudo conectar a una pantalla externa. Asegúrate de que haya dispositivos compatibles disponibles.');
    }
  };

  const shareSlide = () => {
    if (!currentLesson || !currentFragment) {
      alert('No hay una lección o fragmento seleccionado para compartir.');
      return;
    }
    setShowShareModal(true);
  };

  return (
    <>
      {/* TopBar visible en todas las resoluciones */}
      <div className="w-full min-h-[4rem] h-12 bg-white flex items-center justify-between px-2 md:px-4 shadow-lg flex-shrink-0 z-30">
        {/* Botón hamburguesa solo en móvil */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors mr-2"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isSidebarOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}

        {/* Título solo visible en desktop */}
        {!isMobile && (
          <Link href="/" className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap">
            Líder Interactivo CMM
          </Link>
        )}
        
        {/* Botones de panel solo en escritorio */}
        {!isMobile && (
          <div className="flex items-center space-x-1 md:space-x-2">
            <div className="flex items-center space-x-0.5 md:space-x-1 mr-2 md:mr-4 gap-2">
              {/* Botón de Login y Admin juntos al inicio */}
              <Link
                href="/auth/login"
                className="flex items-center p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
              >
                <FiLogIn className="w-5 h-5 mr-0 md:mr-2" />
                <span className="hidden md:inline">Login</span>
              </Link>
              {isSuperAdmin && (
                <Link 
                  href="/admin"
                  className="flex items-center p-2 ml-1 text-white bg-green-700 rounded-md hover:bg-green-800 transition duration-150"
                >
                  <FiSettings className="w-5 h-5 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}
              {/* Paneles */}
              {panelOptions.map(panel => (
                <button
                  key={panel.key}
                  className={`px-1 md:px-2 py-1 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-150 ${activePanel === panel.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                  onClick={() => setActivePanel(panel.key)}
                  style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {panel.icon}
                </button>
              ))}
              <button
                className={`px-1 md:px-2 py-1 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-150 ${activePanel === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                onClick={() => setActivePanel('all')}
                style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="inline-block" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="24" height="24" rx="6" fill={activePanel === 'all' ? '#2563eb' : '#e5e7eb'} stroke="#cbd5e1" strokeWidth={2} />
                    <line x1={10} y1={4} x2={10} y2={24} stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth={2.2} />
                    <line x1={18} y1={4} x2={18} y2={24} stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth={2.2} />
                  </svg>
                </span>
              </button>
            </div>
            <button
              className="m-1 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition duration-150"
              onClick={handleFullscreen}
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiPlay className="w-5 h-5" />
            </button>
            <button
              onClick={startCasting}
              disabled={!currentLesson || !currentFragment}
              className={`m-1 rounded-full flex items-center justify-center text-white transition duration-150 ${
                isCasting 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : currentLesson && currentFragment
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
              }`}
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TbCast className="w-5 h-5" />
            </button>
            <button
              onClick={shareSlide}
              disabled={!currentLesson || !currentFragment}
              className={`m-1 rounded-full flex items-center justify-center text-white transition duration-150 ${
                currentLesson && currentFragment
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botones móviles compactos - Todas las opciones */}
        {isMobile && (
          <div className="flex items-center space-x-1 flex-1 justify-end">
            {/* Botones de Login y Admin para móvil */}
            <Link
              href="/login"
              className="flex items-center p-1.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
            >
              <FiLogIn className="w-4 h-4" />
            </Link>
            
            {isSuperAdmin && (
              <Link 
                href="/admin"
                className="flex items-center p-1.5 text-white bg-green-700 rounded-md hover:bg-green-800 transition duration-150"
              >
                <FiSettings className="w-4 h-4" />
              </Link>
            )}

            {/* Navegación de paneles para móvil */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {panelOptions.map(panel => (
                <button
                  key={panel.key}
                  className={`p-1.5 rounded transition-colors duration-150 ${activePanel === panel.key ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setActivePanel(panel.key)}
                >
                  {panel.icon}
                </button>
              ))}
              {/* Botón "All" para móvil */}
              <button
                className={`p-1.5 rounded transition-colors duration-150 ${activePanel === 'all' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setActivePanel('all')}
              >
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="24" height="24" rx="6" fill={activePanel === 'all' ? '#2563eb' : '#e5e7eb'} stroke="#cbd5e1" strokeWidth={2} />
                  <line x1={10} y1={4} x2={10} y2={24} stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth={2.2} />
                  <line x1={18} y1={4} x2={18} y2={24} stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth={2.2} />
                </svg>
              </button>
            </div>

            {/* Botones de acción para móvil */}
            <button
              className="p-1.5 rounded-full flex items-center justify-center text-white bg-purple-500 hover:bg-purple-600 transition duration-150"
              onClick={handleFullscreen}
            >
              <FiPlay className="w-4 h-4" />
            </button>
            
            <button
              onClick={startCasting}
              disabled={!currentLesson || !currentFragment}
              className={`p-1.5 rounded-full flex items-center justify-center text-white transition duration-150 ${
                isCasting 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : currentLesson && currentFragment
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <TbCast className="w-4 h-4" />
            </button>
            
            <button
              onClick={shareSlide}
              disabled={!currentLesson || !currentFragment}
              className={`p-1.5 rounded-full flex items-center justify-center text-white transition duration-150 ${
                currentLesson && currentFragment
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal de Compartir */}
        {showShareModal && currentLesson && currentFragment && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            lesson={currentLesson}
            fragment={currentFragment}
            fragmentIndex={fragmentIndex || 0}
          />
        )}
      </div>
    </>
  );
}