import { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiMusic, FiBluetooth } from 'react-icons/fi';

export function MusicPanel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showBluetoothDevices, setShowBluetoothDevices] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  // Verificar soporte de Bluetooth al cargar el componente
  useEffect(() => {
    setIsBluetoothSupported('bluetooth' in navigator);
  }, []);

  // Lista de pistas de muestra
  const sampleTracks = [
    { id: 1, name: "Himno de Alabanza", duration: "4:32", artist: "Coro Celestial" },
    { id: 2, name: "Paz en el Valle", duration: "3:45", artist: "Grupo Esperanza" },
    { id: 3, name: "Camino de Fe", duration: "5:12", artist: "Voces de Adoración" },
    { id: 4, name: "Gracia Infinita", duration: "4:18", artist: "Ministerio de Música" },
    { id: 5, name: "Bendición Matutina", duration: "3:55", artist: "Coro Unido" },
    { id: 6, name: "Refugio Eterno", duration: "4:40", artist: "Alabanza Total" },
    { id: 7, name: "Luz Divina", duration: "3:28", artist: "Grupo Melodía" },
    { id: 8, name: "Esperanza Viva", duration: "5:01", artist: "Voces Celestiales" },
    { id: 9, name: "Amor Incondicional", duration: "4:15", artist: "Ministerio Joven" },
    { id: 10, name: "Gloria Eterna", duration: "3:38", artist: "Coro de Fe" }
  ];

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
    setCurrentTrack((prev) => (prev - 1 + sampleTracks.length) % sampleTracks.length);
  };

  const toggleBluetooth = async () => {
    if (!isBluetoothSupported) {
      alert('Bluetooth no está soportado en este navegador. Necesitas Chrome, Edge o un navegador compatible con Web Bluetooth API.');
      return;
    }

    try {
      // Solicitar acceso a dispositivos Bluetooth
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      console.log('✅ Dispositivo seleccionado:', device.name);
      setBluetoothDevice(device);
      
      // Intentar conectar
      const server = await device.gatt?.connect();
      if (server) {
        setIsBluetoothConnected(true);
        console.log('🔵 Conectado exitosamente a:', device.name);
        // No mostrar alert aquí para evitar interrupciones
      }

      // Manejar desconexión
      device.addEventListener('gattserverdisconnected', () => {
        setIsBluetoothConnected(false);
        console.log('🔴 Dispositivo desconectado:', device.name);
      });

    } catch (error: any) {
      console.error('❌ Error de Bluetooth:', error);
      if (error.name === 'NotFoundError') {
        // Usuario canceló la selección - esto es normal
        console.log('⚪ Selección de dispositivo cancelada por el usuario');
      } else if (error.name === 'SecurityError') {
        console.warn('🔒 Error de seguridad - asegurate de estar en HTTPS en producción');
      } else {
        console.error('🚨 Error inesperado:', error.message);
      }
    }
  };

  const disconnectBluetooth = () => {
    if (bluetoothDevice && bluetoothDevice.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
      setIsBluetoothConnected(false);
      alert('Dispositivo Bluetooth desconectado');
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header con información de pista en una sola línea */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Música para Orar</h2>
          <div className="flex items-center space-x-2">
            <FiMusic className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {sampleTracks[currentTrack].name}
            </span>
            <span className="text-xs text-gray-500">
              • {sampleTracks[currentTrack].duration}
            </span>
          </div>
        </div>
      </div>

      {/* Player Controls con Bluetooth */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          {/* Controles de reproducción */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={prevTrack}
              className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 transition shadow-lg"
            >
              <FiSkipBack className="w-4 h-4 text-gray-600" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition shadow-xl"
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5 text-white" />
              ) : (
                <FiPlay className="w-5 h-5 text-white" />
              )}
            </button>
            
            <button 
              onClick={nextTrack}
              className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 transition shadow-lg"
            >
              <FiSkipForward className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Botón Bluetooth */}
          <div className="relative">
            <button
              onClick={toggleBluetooth}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isBluetoothConnected 
                  ? 'bg-green-100 hover:bg-green-200' 
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              title={
                isBluetoothConnected 
                  ? `Conectado a: ${bluetoothDevice?.name || 'Dispositivo'}` 
                  : isBluetoothSupported 
                    ? 'Conectar dispositivo Bluetooth' 
                    : 'Bluetooth no soportado'
              }
              disabled={!isBluetoothSupported}
            >
              <FiBluetooth className={`w-5 h-5 ${
                isBluetoothConnected 
                  ? 'text-green-600' 
                  : isBluetoothSupported 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
              }`} />
            </button>

            {/* Información de dispositivo conectado */}
            {isBluetoothConnected && bluetoothDevice && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Dispositivo Conectado</h3>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bluetoothDevice.name || 'Dispositivo Bluetooth'}
                      </div>
                      <div className="text-xs text-gray-500">Conectado</div>
                    </div>
                    <button
                      onClick={disconnectBluetooth}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de no soporte */}
            {!isBluetoothSupported && showBluetoothDevices && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3">
                  <div className="text-sm text-gray-600">
                    Bluetooth no está soportado en este navegador. 
                    <br />
                    Usa Chrome, Edge o Firefox para acceder a dispositivos Bluetooth.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track List with Scroll */}
      <div className="flex-grow flex flex-col min-h-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0">Lista de Reproducción</h3>
        <div className="flex-grow overflow-y-auto custom-scrollbar bg-gray-50 rounded-lg p-2">
          <div className="space-y-1">
            {sampleTracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => selectTrack(index)}
                className={`p-2 rounded cursor-pointer transition-colors duration-200 ${
                  index === currentTrack
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
    </div>
  );
}
