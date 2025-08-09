import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { AudioFile } from '@/types';

interface CompactAudioPlayerProps {
  audioFile: AudioFile | null;
}

export function CompactAudioPlayer({ audioFile }: CompactAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset when audioFile changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioFile]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    // Audio cargado y listo
  };

  const audioSrc = audioFile ? 
    (audioFile.type === 'remote' ? audioFile.url : 
     audioFile.file ? URL.createObjectURL(audioFile.file) : '') : '';

  const hasAudio = audioFile && audioSrc;

  return (
    <div className="flex items-center">
      <button
        onClick={togglePlayPause}
        disabled={!hasAudio}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 shadow-sm ${
          hasAudio 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={hasAudio ? (isPlaying ? 'Pausar audio' : 'Reproducir audio') : 'No hay audio disponible'}
      >
        {isPlaying ? (
          <FiPause className="w-4 h-4" />
        ) : (
          <FiPlay className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      {hasAudio && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={handleAudioEnd}
          onLoadedMetadata={handleLoadedMetadata}
          preload="metadata"
        />
      )}
    </div>
  );
}
