export interface IndoorBikeData {
  instantaneousSpeed?: number; // km/h
  averageSpeed?: number; // km/h
  instantaneousCadence?: number; // rpm
  averageCadence?: number; // rpm
  totalDistance?: number; // meters
  resistanceLevel?: number;
  instantaneousPower?: number; // watts
  averagePower?: number; // watts
  totalEnergy?: number; // kcal
  energyPerHour?: number; // kcal/hr
  energyPerMinute?: number; // kcal/min
  heartRate?: number; // bpm
  metabolicEquivalent?: number;
  elapsedTime?: number; // seconds
  remainingTime?: number; // seconds
}

export interface FTMSDevice {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  service: BluetoothRemoteGATTService;
  characteristic: BluetoothRemoteGATTCharacteristic;
}

export const FTMS_SERVICE_UUID = 0x1826;
export const INDOOR_BIKE_DATA_UUID = 0x2ad2;
export const FITNESS_MACHINE_CONTROL_POINT_UUID = 0x2ad9;
export const FITNESS_MACHINE_STATUS_UUID = 0x2ada;