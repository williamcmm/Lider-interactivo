// Interfaz mínima para PresentationRequest
interface PresentationRequest {
  start: () => Promise<unknown>;
  addEventListener: (event: string, callback: () => void) => void;
}
import { FiPlay, FiShare2, FiSettings } from 'react-icons/fi';
import { TbCast } from 'react-icons/tb';
import Link from 'next/link';
import { Fragment, Lesson } from '../types';
import { useState } from 'react';
import { ShareModal } from './ShareModal';

interface TopBarProps {
  currentLesson?: Lesson | null;
  currentFragment?: Fragment | null;
  fragmentIndex?: number;
}

export function TopBar({ currentLesson, currentFragment, fragmentIndex }: TopBarProps) {
  const [isCasting, setIsCasting] = useState(false);
  const [presentationRequest, setPresentationRequest] = useState<PresentationRequest | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Función para iniciar Chromecast/Presentation API
  const startCasting = async () => {
    try {
      if ('presentation' in navigator) {
        const presentationUrl = `${window.location.origin}/presentation?lesson=${currentLesson?.id}&fragment=${fragmentIndex}`;
        const request = new (window as unknown as { PresentationRequest: new (urls: string[]) => PresentationRequest }).PresentationRequest([presentationUrl]);
        const connection = await request.start();
        setIsCasting(true);
        setPresentationRequest(request);
        // Type guard para connection
  if (typeof connection === 'object' && connection !== null && 'addEventListener' in connection && typeof (connection as Record<string, unknown>).addEventListener === 'function') {
          (connection as { addEventListener: (event: string, callback: () => void) => void; send?: (data: string) => void }).addEventListener('terminate', () => {
            setIsCasting(false);
            setPresentationRequest(null);
          });
          // Escuchar cambios de fragmento para actualizar la pantalla externa
          if (currentFragment && typeof (connection as Record<string, unknown>).send === 'function') {
            (connection as { send: (data: string) => void }).send(JSON.stringify({
              type: 'update-slide',
              slide: currentFragment.slide,
              fragmentIndex: fragmentIndex,
              lessonTitle: currentLesson?.title
            }));
          }
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
        {/* Botón de Administrador */}
        <Link 
          href="/admin"
          className="flex items-center p-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition duration-150"
        >
          <FiSettings className="w-5 h-5 mr-2" />
          <span>Admin</span>
        </Link>
        
        {/* Botón de Presentador */}
        <button className="flex items-center p-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 transition duration-150">
          <FiPlay className="w-5 h-5 mr-2" />
          <span>Presentador</span>
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
