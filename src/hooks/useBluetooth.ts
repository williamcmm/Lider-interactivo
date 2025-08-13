import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar la lógica de Bluetooth
 * 
 * Encapsula toda la funcionalidad relacionada con Bluetooth Web API
 */
export function useBluetooth() {
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  // Verificar soporte de Bluetooth al cargar el hook
  useEffect(() => {
    setIsBluetoothSupported('bluetooth' in navigator);
  }, []);

  const connectBluetooth = async () => {
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

  return {
    bluetoothDevice,
    isBluetoothConnected,
    isBluetoothSupported,
    connectBluetooth,
    disconnectBluetooth
  };
}
