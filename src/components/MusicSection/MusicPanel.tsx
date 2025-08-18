import { useState } from "react";
import { CurrentTrackInfo } from "./CurrentTrackInfo";
import { PlaybackControls } from "./PlaybackControls";
import { BluetoothControls } from "./BluetoothControls";
import { TrackList } from "./TrackList";
import { useBluetooth } from "../../hooks/useBluetooth";
import { sampleTracks } from "../../data/musicTracks";

/**
 * MusicPanel - Componente principal del panel de música
 *
 * Orquesta todos los componentes relacionados con la reproducción de música:
 * - Información de pista actual
 * - Controles de reproducción
 * - Conectividad Bluetooth
 * - Lista de pistas
 */
export function MusicPanel() {
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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % sampleTracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack(
      (prev) => (prev - 1 + sampleTracks.length) % sampleTracks.length
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 p-4 overflow-hidden">
      {/* Información de pista actual */}
      <CurrentTrackInfo track={sampleTracks[currentTrack]} />

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
        tracks={sampleTracks}
        currentTrackIndex={currentTrack}
        onSelectTrack={selectTrack}
      />
    </div>
  );
}
