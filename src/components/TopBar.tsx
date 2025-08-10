import { FiPlay, FiShare2, FiSettings } from 'react-icons/fi';
import { FiBookOpen, FiMonitor, FiMusic, FiEdit } from 'react-icons/fi';
import { TbCast } from 'react-icons/tb';
import Link from 'next/link';
import { Fragment, Lesson } from '../types';
import { useState } from 'react';
import React from 'react';
import { ShareModal } from './ShareModal';

interface TopBarProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export function TopBar({ currentLesson, currentFragment, fragmentIndex }: TopBarProps) {
  // Paneles disponibles
  const { activePanel, setActivePanel } = arguments[0];
  const panelOptions = [
    { key: 'reading', label: 'Lectura', icon: <FiBookOpen className="w-4 h-4 mr-1" /> },
    { key: 'slides', label: 'Diapositivas', icon: <FiMonitor className="w-4 h-4 mr-1" /> },
    { key: 'music', label: 'Música', icon: <FiMusic className="w-4 h-4 mr-1" /> },
    { key: 'notes', label: 'Notas', icon: <FiEdit className="w-4 h-4 mr-1" /> }
  ];

  const [isCasting, setIsCasting] = useState(false);
  const [presentationRequest, setPresentationRequest] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pantalla completa
  const handleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
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
    <div className="w-full h-12 bg-white flex items-center justify-between px-4 shadow-lg flex-shrink-0 z-30">
      <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
        Líder Interactivo CMM
      </Link>
      
      <div className="flex items-center space-x-2">
        {/* Botones divisores para alternar paneles */}
        <div className="flex items-center space-x-1 mr-4">
          {panelOptions.map(panel => (
            <button
              key={panel.key}
              className={`px-2 py-1 rounded-full border border-gray-300 text-xs font-medium flex items-center transition-colors duration-150 ${activePanel === panel.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
              onClick={() => setActivePanel(panel.key)}
            >
              {panel.icon}
              {panel.label}
            </button>
          ))}
          <button
            className={`px-2 py-1 rounded-full border border-gray-300 text-xs font-medium transition-colors duration-150 ${activePanel === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setActivePanel('all')}
          >
            <span className="inline-block w-4 h-1 bg-gray-400 rounded-full mr-1 align-middle" />
            Todas
          </button>
        </div>
        {/* Botón de Administrador */}
        <Link 
          href="/admin"
          className="flex items-center p-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition duration-150"
        >
          <FiSettings className="w-5 h-5 mr-2" />
          <span>Admin</span>
        </Link>
        
        {/* Botón de Presentador */}
        <button
          className="flex items-center p-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 transition duration-150"
          onClick={handleFullscreen}
        >
          <FiPlay className="w-5 h-5 mr-2" />
          <span>{isFullscreen ? 'Cerrar' : 'Presentador'}</span>
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
        >
          <TbCast className="w-5 h-5 mr-2" />
          <span>{isCasting ? 'Proyectando' : 'Enviar a Pantalla'}</span>
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
        >
          <FiShare2 className="w-5 h-5 mr-2" />
          <span>Compartir</span>
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
  );
}
