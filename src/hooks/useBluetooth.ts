import { useState, useEffect } from 'react';
import { BluetoothDevice, NavigatorBluetooth, BluetoothRequestDeviceOptions } from '@/types/bluetooth';
import { submitAlert } from '@/utils/alerts';

/**
 * Hook personalizado para manejar la lógica de Bluetooth
 * 
 * Encapsula toda la funcionalidad relacionada con Bluetooth Web API
 */
export function useBluetooth() {
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  // Verificar soporte de Bluetooth al cargar el hook
  useEffect(() => {
    setIsBluetoothSupported('bluetooth' in navigator);
  }, []);

  const connectBluetooth = async () => {
    if (!isBluetoothSupported) {
      submitAlert('Bluetooth no está soportado en este navegador. Necesitas Chrome, Edge o un navegador compatible con Web Bluetooth API.', 'error');
      return;
    }

    try {
      // Type assertion para acceder a la API de Bluetooth
      const bluetoothNavigator = (navigator as Navigator & { bluetooth: NavigatorBluetooth });
      
      // Solicitar acceso a dispositivos Bluetooth
      const device = await bluetoothNavigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      } as BluetoothRequestDeviceOptions);

      setBluetoothDevice(device);
      
      // Intentar conectar
      const server = await device.gatt?.connect();
      if (server) {
        setIsBluetoothConnected(true);
      }

      // Manejar desconexión
      device.addEventListener('gattserverdisconnected', () => {
        setIsBluetoothConnected(false);
      });

    } catch (error) {
      console.error('❌ Error de Bluetooth:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          // Usuario canceló la selección - esto es normal
        } else if (error.name === 'SecurityError') {
          console.warn('🔒 Error de seguridad - asegurate de estar en HTTPS en producción');
        } else {
          console.error('🚨 Error inesperado:', error.message);
        }
      } else {
        console.error('🚨 Error desconocido:', error);
      }
    }
  };

  const disconnectBluetooth = () => {
    if (bluetoothDevice && bluetoothDevice.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
      setIsBluetoothConnected(false);
      submitAlert('Dispositivo Bluetooth desconectado', 'info');
    }
  };

  return {
    bluetoothDevice,
    isBluetoothConnected,
    isBluetoothSupported,
    connectBluetooth,
    disconnectBluetooth
  };
}
