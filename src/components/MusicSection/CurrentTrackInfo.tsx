import { FiMusic } from 'react-icons/fi';

interface Track {
  id: number;
  name: string;
  duration: string;
  artist: string;
}

interface CurrentTrackInfoProps {
  track: Track;
}

/**
 * CurrentTrackInfo - Componente para mostrar información de la pista actual
 * 
 * Muestra el nombre de la pista actual y su duración en el header del panel de música
 */
export function CurrentTrackInfo({ track }: CurrentTrackInfoProps) {
  return (
    <div className="flex-shrink-0 mb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Música para Orar</h2>
        <div className="flex items-center space-x-2">
          <FiMusic className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {track.name}
          </span>
          <span className="text-xs text-gray-500">
            • {track.duration}
          </span>
        </div>
      </div>
    </div>
  );
}
