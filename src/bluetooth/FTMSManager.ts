import {
  IndoorBikeData,
  FTMSDevice,
  FTMS_SERVICE_UUID,
  INDOOR_BIKE_DATA_UUID,
} from '../types/ftms';

export class FTMSManager {
  private device: FTMSDevice | null = null;
  private dataCallback: ((data: IndoorBikeData) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;

  async connect(): Promise<void> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [FTMS_SERVICE_UUID] }],
        optionalServices: [FTMS_SERVICE_UUID]
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(FTMS_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(INDOOR_BIKE_DATA_UUID);

      this.device = {
        device,
        server,
        service,
        characteristic
      };

      characteristic.addEventListener('characteristicvaluechanged', this.handleDataChange.bind(this));
      await characteristic.startNotifications();

      device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      if (this.connectionCallback) {
        this.connectionCallback(true);
      }
    } catch (error) {
      console.error('Bluetooth接続エラー:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.device?.server.connected) {
      this.device.server.disconnect();
    }
    this.device = null;
  }

  private handleDisconnect(): void {
    console.log('デバイスが切断されました');
    if (this.connectionCallback) {
      this.connectionCallback(false);
    }
    this.device = null;
  }

  private handleDataChange(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value!;
    const data = this.parseIndoorBikeData(value);
    
    if (this.dataCallback) {
      this.dataCallback(data);
    }
  }

  private parseIndoorBikeData(dataView: DataView): IndoorBikeData {
    const data: IndoorBikeData = {};
    let index = 0;

    // フラグフィールド (2バイト)
    const flags = dataView.getUint16(index, true);
    index += 2;

    // 瞬間速度 (存在する場合)
    if (!(flags & 0x01)) {
      data.instantaneousSpeed = dataView.getUint16(index, true) * 0.01;
      index += 2;
    }

    // 平均速度
    if (flags & 0x02) {
      data.averageSpeed = dataView.getUint16(index, true) * 0.01;
      index += 2;
    }

    // 瞬間ケイデンス
    if (flags & 0x04) {
      data.instantaneousCadence = dataView.getUint16(index, true) * 0.5;
      index += 2;
    }

    // 平均ケイデンス
    if (flags & 0x08) {
      data.averageCadence = dataView.getUint16(index, true) * 0.5;
      index += 2;
    }

    // 総距離
    if (flags & 0x10) {
      // 3バイトの値
      data.totalDistance = dataView.getUint8(index) | 
                          (dataView.getUint8(index + 1) << 8) | 
                          (dataView.getUint8(index + 2) << 16);
      index += 3;
    }

    // 抵抗レベル
    if (flags & 0x20) {
      data.resistanceLevel = dataView.getInt16(index, true);
      index += 2;
    }

    // 瞬間パワー
    if (flags & 0x40) {
      data.instantaneousPower = dataView.getInt16(index, true);
      index += 2;
    }

    // 平均パワー
    if (flags & 0x80) {
      data.averagePower = dataView.getInt16(index, true);
      index += 2;
    }

    // 総エネルギーと消費率
    if (flags & 0x100) {
      data.totalEnergy = dataView.getUint16(index, true);
      data.energyPerHour = dataView.getUint16(index + 2, true);
      data.energyPerMinute = dataView.getUint8(index + 4);
      index += 5;
    }

    // 心拍数
    if (flags & 0x200) {
      data.heartRate = dataView.getUint8(index);
      index += 1;
    }

    // 代謝当量
    if (flags & 0x400) {
      data.metabolicEquivalent = dataView.getUint8(index) * 0.1;
      index += 1;
    }

    // 経過時間
    if (flags & 0x800) {
      data.elapsedTime = dataView.getUint16(index, true);
      index += 2;
    }

    // 残り時間
    if (flags & 0x1000) {
      data.remainingTime = dataView.getUint16(index, true);
      index += 2;
    }

    return data;
  }

  onDataReceived(callback: (data: IndoorBikeData) => void): void {
    this.dataCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  isConnected(): boolean {
    return this.device?.server.connected ?? false;
  }
}