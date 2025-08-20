// Interfaces para Web Bluetooth API
export interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(event: 'gattserverdisconnected', listener: () => void): void;
  removeEventListener(event: 'gattserverdisconnected', listener: () => void): void;
}

export interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
}

export interface BluetoothRequestDeviceOptions {
  acceptAllDevices?: boolean;
  filters?: BluetoothLEScanFilter[];
  optionalServices?: BluetoothServiceUUID[];
}

export interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
}

export type BluetoothServiceUUID = number | string;

export interface NavigatorBluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
}

// Tipo para información básica del dispositivo (usado en componentes)
export interface BluetoothDeviceInfo {
  id?: string;
  name?: string;
}
