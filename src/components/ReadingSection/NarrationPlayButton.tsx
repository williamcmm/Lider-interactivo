/**
 * @fileoverview AudioPlayButton - Componente de botón de reproducción de audio
 * 
 * Este componente maneja exclusivamente la reproducción de audio de narración
 * de fragmentos, incluyendo:
 * - Control de reproducción/pausa
 * - Estados de carga y error
 * - Gestión del elemento HTML5 Audio
 * - Soporte para archivos locales y URLs remotas
 * - Reinicio automático al cambiar de fragmento
 * - Indicadores visuales de estado
 */

import React, { useRef, useState, useEffect } from 'react';
import { Fragment } from '@/types';
import { FiPlay, FiPause } from 'react-icons/fi';

/**
 * Props para el componente AudioPlayButton
 * 
 * @interface NarrationPlayButtonProps
 */
interface NarrationPlayButtonProps {
  /** El fragmento actual que puede contener audio de narración */
  fragment: Fragment | null;
}

/**
 * AudioPlayButton - Componente de botón de reproducción de audio
 * 
 * Este componente se encarga exclusivamente de:
 * - Renderizar el botón de play/pause con estilos apropiados
 * - Gestionar el estado del reproductor de audio HTML5
 * - Manejar eventos de audio (reproducción, pausa, error, carga)
 * - Proporcionar feedback visual sobre el estado del audio
 * - Reiniciar automáticamente cuando cambia el fragmento
 * - Validar disponibilidad de audio antes de reproducir
 * 
 * Estados manejados:
 * - isPlaying: Si el audio está reproduciéndose actualmente
 * - isLoading: Si el audio está cargando o procesando
 * 
 * Funcionalidades:
 * - Soporte para archivos remotos (URL) y locales (File)
 * - Manejo de errores con notificaciones al usuario
 * - Animación de loading durante la carga
 * - Accesibilidad con títulos descriptivos
 * 
 * @param props - Las propiedades del componente
 * @returns JSX.Element - El botón de reproducción con funcionalidad completa
 * 
 * @example
 * ```tsx
 * <AudioPlayButton fragment={currentFragment} />
 * ```
 */
export function NarrationPlayButton({ fragment }: NarrationPlayButtonProps) {
  // Estados locales para el control del audio
  /** Estado de reproducción del audio */
  const [isPlaying, setIsPlaying] = useState(false);
  
  /** Estado de carga del audio */
  const [isLoading, setIsLoading] = useState(false);
  
  /** Referencia al elemento audio HTML5 */
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * Effect para reiniciar el estado del audio cuando cambia el fragmento
   * Se ejecuta cada vez que se selecciona un nuevo fragmento
   */
  useEffect(() => {
    if (fragment) {
      // Pausar la reproducción actual
      setIsPlaying(false);
      
      // Resetear el audio actual si existe
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [fragment]);

  /**
   * Maneja la reproducción y pausa del audio de narración
   * Gestiona estados de carga y errores
   * 
   * @async
   * @function handlePlayPause
   */
  const handlePlayPause = async () => {
    // Verificar que existe audio y elemento HTML
    if (!fragment?.narrationAudio || !audioRef.current) {
      alert('No hay audio de narración disponible para este fragmento');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        // Pausar la reproducción actual
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Iniciar la reproducción
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error al reproducir audio:', error);
      alert('Error al reproducir el audio de narración. Verifica que el archivo sea válido.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el evento cuando el audio termina de reproducirse
   * Actualiza los estados correspondientes
   */
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsLoading(false);
  };

  /**
   * Maneja errores durante la reproducción del audio
   * Muestra mensaje de error al usuario y resetea estados
   * 
   * @param error - El error ocurrido durante la reproducción
   */
  const handleAudioError = (error: any) => {
    console.error('Error de audio:', error);
    setIsPlaying(false);
    setIsLoading(false);
    alert('Error al cargar el audio de narración. Verifica la URL o el archivo.');
  };

  /**
   * Maneja el inicio de la carga del audio
   * Activa el indicador de carga
   */
  const handleAudioLoadStart = () => {
    setIsLoading(true);
  };

  /**
   * Maneja cuando el audio está listo para reproducir
   * Desactiva el indicador de carga
   */
  const handleAudioCanPlay = () => {
    setIsLoading(false);
  };

  /**
   * Obtiene la URL del archivo de audio según su tipo
   * Soporta archivos locales y URLs remotas
   * 
   * @returns {string} La URL del archivo de audio o cadena vacía
   */
  const getAudioSrc = () => {
    if (!fragment?.narrationAudio) return '';
    
    const audioFile = fragment.narrationAudio;
    
    // URL remota
    if (audioFile.type === 'remote') {
      return audioFile.url;
    } 
    // Archivo local
    else if (audioFile.file) {
      return URL.createObjectURL(audioFile.file);
    }
    
    return '';
  };

  return (
    <>
      {/* Botón de reproducción de narración */}
      <button
        onClick={handlePlayPause}
        disabled={!fragment?.narrationAudio || isLoading}
        className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full transition-colors duration-200 ${
          fragment?.narrationAudio && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={
          !fragment?.narrationAudio
            ? 'Sin audio disponible'
            : isLoading
            ? 'Cargando audio...'
            : isPlaying
            ? 'Pausar narración'
            : 'Reproducir narración'
        }
      >
        {/* Indicador de carga o icono de play/pause */}
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isPlaying ? (
          <FiPause className="w-4 h-4" />
        ) : (
          <FiPlay className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Elemento audio HTML5 oculto para la narración */}
      {fragment?.narrationAudio && (
        <audio
          ref={audioRef}
          src={getAudioSrc()}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          preload="metadata"
          className="hidden"
        />
      )}
    </>
  );
}
