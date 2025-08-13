import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

/**
 * PlaybackControls - Componente para los controles de reproducción
 * 
 * Maneja los botones de play/pause, anterior y siguiente pista
 */
export function PlaybackControls({ 
  isPlaying, 
  onTogglePlay, 
  onPrevTrack, 
  onNextTrack 
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={onPrevTrack}
        className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 transition shadow-lg"
        title="Pista anterior"
      >
        <FiSkipBack className="w-4 h-4 text-gray-600" />
      </button>

      <button 
        onClick={onTogglePlay}
        className={`p-3 rounded-full transition shadow-xl
          bg-gray-300 hover:bg-gray-400
          ${isPlaying ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <FiPause className="w-5 h-5 text-white" />
        ) : (
          <FiPlay className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <button 
        onClick={onNextTrack}
        className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 transition shadow-lg"
        title="Siguiente pista"
      >
        <FiSkipForward className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
