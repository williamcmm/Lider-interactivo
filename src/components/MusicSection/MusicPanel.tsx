import { useState } from "react";
import { CurrentTrackInfo } from "./CurrentTrackInfo";
import { PlaybackControls } from "./PlaybackControls";
import { BluetoothControls } from "./BluetoothControls";
import { TrackList } from "./TrackList";
import { useBluetooth } from "../../hooks/useBluetooth";
import type { AudioFile } from "@/types";
import { MdMusicOff } from "react-icons/md";

interface MusicPanelProps {
  audioFiles?: AudioFile[];
}

/**
 * MusicPanel - Componente principal del panel de música
 *
 * Orquesta todos los componentes relacionados con la reproducción de música:
 * - Información de pista actual
 * - Controles de reproducción
 * - Conectividad Bluetooth
 * - Lista de pistas
 */
export function MusicPanel({ audioFiles = [] }: MusicPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  // Hook personalizado para funcionalidad Bluetooth
  const {
    bluetoothDevice,
    isBluetoothConnected,
    isBluetoothSupported,
    connectBluetooth,
    disconnectBluetooth,
  } = useBluetooth();

  // Convertir AudioFile[] a Track[] compatible con los componentes existentes
  const tracks = audioFiles.map((audioFile, index) => ({
    id: index + 1,
    name: audioFile.name,
    duration: "0:00", // No tenemos duración en AudioFile
    artist: "Música de Estudio", // Valor por defecto
  }));

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (tracks.length > 0) {
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    }
  };

  const prevTrack = () => {
    if (tracks.length > 0) {
      setCurrentTrack(
        (prev) => (prev - 1 + tracks.length) % tracks.length
      );
    }
  };

  // Si no hay pistas, mostrar mensaje
  if (tracks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="mb-4">
          <span className="text-6xl text-gray-500"><MdMusicOff /></span>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Sin Pistas Disponibles
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          No hay archivos de audio disponibles para este contenido. Las pistas de música se mostrarán aquí cuando estén disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 p-4 overflow-hidden">
      {/* Información de pista actual */}
      <CurrentTrackInfo track={tracks[currentTrack]} />

      {/* Controles de reproducción y Bluetooth */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onPrevTrack={prevTrack}
            onNextTrack={nextTrack}
          />

          <BluetoothControls
            isBluetoothSupported={isBluetoothSupported}
            isBluetoothConnected={isBluetoothConnected}
            bluetoothDevice={bluetoothDevice}
            onToggleBluetooth={connectBluetooth}
            onDisconnectBluetooth={disconnectBluetooth}
          />
        </div>
      </div>

      {/* Lista de pistas */}
      <TrackList
        tracks={tracks}
        currentTrackIndex={currentTrack}
        onSelectTrack={selectTrack}
      />
    </div>
  );
}
