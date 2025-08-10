

import React from 'react';
import { useState } from 'react';
import { FiPlay, FiShare2, FiSettings, FiBookOpen, FiMonitor, FiMusic, FiEdit } from 'react-icons/fi';
import { TbCast } from 'react-icons/tb';
import Link from 'next/link';
import { Fragment, Lesson } from '../types';
import { ShareModal } from './ShareModal';

interface TopBarProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export function TopBar({ currentLesson, currentFragment, fragmentIndex, activePanel, setActivePanel }: TopBarProps) {
  // Paneles disponibles
  const panelOptions = [
    { key: 'reading', icon: <FiBookOpen className="w-5 h-5" /> },
    { key: 'slides', icon: <FiMonitor className="w-5 h-5" /> },
    { key: 'music', icon: <FiMusic className="w-5 h-5" /> },
    { key: 'notes', icon: <FiEdit className="w-5 h-5" /> }
  ];
    // ...existing code...

  // Hooks de estado
  const [isMobile, setIsMobile] = React.useState(false);
  const [isLandscape, setIsLandscape] = React.useState(false);
  const [isCasting, setIsCasting] = React.useState(false);
  const [presentationRequest, setPresentationRequest] = React.useState<any>(null);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Detectar si es móvil y orientación
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Pantalla completa
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

  // Detectar salida de pantalla completa
  React.useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Función para iniciar Chromecast/Presentation API
  const startCasting = async () => {
    try {
      if ('presentation' in navigator) {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        const request = new (window as any).PresentationRequest([presentationUrl]);
        const connection = await request.start();
        setIsCasting(true);
        setPresentationRequest(request);
        connection.addEventListener('terminate', () => {
          setIsCasting(false);
          setPresentationRequest(null);
        });
        // Escuchar cambios de fragmento para actualizar la pantalla externa
        if (currentFragment) {
          connection.send(JSON.stringify({
            type: 'update-slide',
            slide: currentFragment.slide,
            fragmentIndex: fragmentIndex,
            lessonTitle: currentLesson?.title
          }));
        }
      } else {
        // Fallback: abrir en nueva ventana para simulación
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        window.open(presentationUrl, '_blank', 'width=1280,height=720');
      }
    } catch (error) {
      console.error('Error al iniciar presentación:', error);
      alert('No se pudo conectar a una pantalla externa. Asegúrate de que haya dispositivos compatibles disponibles.');
    }
  };

  // Función para compartir enlace de la diapositiva actual
  const shareSlide = () => {
    if (!currentLesson || !currentFragment) {
      alert('No hay una lección o fragmento seleccionado para compartir.');
      return;
    }
    setShowShareModal(true);
  };

  return (
    <>
      {/* Barra superior solo en escritorio */}
      {!isMobile && (
        <div className="w-full min-h-[48px] h-12 bg-white flex items-center justify-between px-2 md:px-4 shadow-lg flex-shrink-0 z-30">
          <Link href="/" className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap">
            Líder Interactivo CMM
          </Link>
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Botones divisores para alternar paneles */}
            <div className="flex items-center space-x-0.5 md:space-x-1 mr-2 md:mr-4">
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
                {/* Icono personalizado: cuadrito con 3 divisiones verticales */}
                <span className="inline-block" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="24" height="24" rx="6" fill={activePanel === 'all' ? '#2563eb' : '#e5e7eb'} stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="10" y1="4" x2="10" y2="24" stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth="2.2" />
                    <line x1="18" y1="4" x2="18" y2="24" stroke={activePanel === 'all' ? '#fff' : '#94a3b8'} strokeWidth="2.2" />
                  </svg>
                </span>
              </button>
            </div>
            {/* Botón de Administrador */}
            <Link 
              href="/admin"
              className="flex items-center p-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition duration-150"
            >
              <FiSettings className="w-5 h-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Admin</span>
            </Link>
            {/* Botón de Presentador */}
            <button
              className="flex items-center p-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 transition duration-150"
              onClick={handleFullscreen}
            >
              <FiPlay className="w-5 h-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">{isFullscreen ? 'Cerrar' : 'Presentador'}</span>
            </button>
            {/* Botón de Enviar a Pantalla (Chromecast) */}
            <button 
              onClick={startCasting}
              disabled={!currentLesson || !currentFragment}
              className={`flex items-center p-2 text-white rounded-md transition duration-150 ${
                isCasting 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : currentLesson && currentFragment
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
              }`}
              style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TbCast className="w-5 h-5" />
            </button>
            {/* Botón de Compartir */}
            <button 
              onClick={shareSlide}
              disabled={!currentLesson || !currentFragment}
              className={`flex items-center p-2 text-white rounded-md transition duration-150 ${
                currentLesson && currentFragment
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
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
      )}

      {/* Barra inferior/lateral solo en móvil */}
      {isMobile && (
        <div
          className={`fixed ${isLandscape ? 'right-0 top-0 h-full w-20 flex-col overflow-y-auto' : 'bottom-0 left-0 w-full h-16 flex-row'} bg-white shadow-lg z-40 flex items-center justify-center`}
        >
          <div
            className={`flex ${isLandscape ? 'flex-col h-full w-20 overflow-y-auto' : 'flex-row w-full h-16 overflow-x-auto'} scrollbar-hide`}
            style={isLandscape ? { WebkitOverflowScrolling: 'touch' } : { WebkitOverflowScrolling: 'touch' }}
          >
            {/* Botón hamburguesa para abrir la biblioteca */}
            <button
              className="m-1 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 hover:bg-gray-300 text-gray-700 transition-colors duration-150"
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => window.dispatchEvent(new CustomEvent('openSidebarMobile'))}
              aria-label="Abrir biblioteca"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            {/* Paneles principales */}
            {panelOptions.map(panel => (
              <button
                key={panel.key}
                className={`m-1 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 transition-colors duration-150 ${activePanel === panel.key ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
                onClick={() => setActivePanel(panel.key)}
                style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {panel.icon}
              </button>
            ))}
            <button
              className={`m-1 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 transition-colors duration-150 ${activePanel === 'all' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
              onClick={() => setActivePanel('all')}
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="inline-block w-4 h-1 bg-gray-400 rounded-full align-middle" />
              {isMobile && isLandscape ? null : <span className="ml-1 text-xs">Todas</span>}
            </button>
            {/* Botones secundarios siempre visibles y desplazables */}
            <button
              className="m-1 rounded-full flex items-center justify-center text-white bg-gray-600 hover:bg-gray-700 transition duration-150"
              onClick={() => window.location.href = '/admin'}
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, aspectRatio: '1/1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiSettings className="w-5 h-5" />
            </button>
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
        </div>
      )}
    </>
  );
}
