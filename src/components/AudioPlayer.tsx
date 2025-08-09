import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { AudioFile } from '@/types';

interface AudioPlayerProps {
  audioFile: AudioFile | null;
  lessonTitle?: string;
}

export function AudioPlayer({ audioFile, lessonTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset when audioFile changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioFile]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // If no audio file, don't render anything
  if (!audioFile || (!audioFile.url && !audioFile.file)) {
    return null;
  }

  // Get the audio source URL
  const audioSrc = audioFile.type === 'remote' && audioFile.url 
    ? audioFile.url 
    : audioFile.file 
      ? URL.createObjectURL(audioFile.file)
      : null;

  if (!audioSrc) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause button */}
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 ml-0.5" />}
      </button>

      {/* Audio info and progress */}
      <div className="flex-grow min-w-0">
        <div className="text-sm font-medium text-gray-700 truncate mb-1">
          🎵 {audioFile.name || `Audio - ${lessonTitle || 'Lección'}`}
        </div>
        
        {/* Progress bar */}
        <div 
          className="h-2 bg-gray-200 rounded-full cursor-pointer mb-1"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume controls */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={toggleMute}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          title="Volumen"
        />
      </div>
    </div>
  );
}
