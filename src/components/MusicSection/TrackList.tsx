interface Track {
  id: number;
  name: string;
  duration: string;
  artist: string;
}

interface TrackListProps {
  tracks: Track[];
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
}

/**
 * TrackList - Componente para mostrar la lista de pistas
 * 
 * Renderiza la lista de pistas con scroll y permite seleccionar una pista específica
 */
export function TrackList({ tracks, currentTrackIndex, onSelectTrack }: TrackListProps) {
  return (
    <div className="flex-grow flex flex-col min-h-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0">Lista de Reproducción</h3>
      <div className="h-full max-h-full overflow-y-auto custom-scrollbar bg-gray-50 rounded-lg p-2">
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              onClick={() => onSelectTrack(index)}
              className={`p-2 rounded cursor-pointer transition-colors duration-200 ${
                index === currentTrackIndex
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'hover:bg-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {track.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {track.artist}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {track.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
