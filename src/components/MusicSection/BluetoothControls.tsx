import { useState } from 'react';
import { FiBluetooth } from 'react-icons/fi';

interface BluetoothControlsProps {
  isBluetoothSupported: boolean;
  isBluetoothConnected: boolean;
  bluetoothDevice: any;
  onToggleBluetooth: () => Promise<void>;
  onDisconnectBluetooth: () => void;
}

/**
 * BluetoothControls - Componente para controles de Bluetooth
 * 
 * Maneja la conexión, desconexión y visualización del estado de dispositivos Bluetooth
 */
export function BluetoothControls({
  isBluetoothSupported,
  isBluetoothConnected,
  bluetoothDevice,
  onToggleBluetooth,
  onDisconnectBluetooth
}: BluetoothControlsProps) {
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onToggleBluetooth}
        onMouseEnter={() => setShowDeviceInfo(true)}
        onMouseLeave={() => setShowDeviceInfo(false)}
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
      {isBluetoothConnected && bluetoothDevice && showDeviceInfo && (
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
                onClick={onDisconnectBluetooth}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de no soporte */}
      {!isBluetoothSupported && showDeviceInfo && (
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
  );
}
