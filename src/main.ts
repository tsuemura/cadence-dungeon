import './styles/main.css';
import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { FTMSManager } from './bluetooth/FTMSManager';
import { useGameStore } from './store/gameStore';

// FTMSマネージャーのインスタンス
const ftmsManager = new FTMSManager();

// アプリケーションの初期化
function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-6 max-w-6xl w-full">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-white">Cadence Dungeon</h1>
          <button id="connect-btn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
            Bluetoothデバイス接続
          </button>
        </div>
        
        <div id="connection-status" class="mb-4 p-3 rounded-lg bg-gray-800/50 text-white hidden">
          <div class="flex items-center gap-2">
            <div id="status-indicator" class="w-3 h-3 rounded-full bg-red-500"></div>
            <span id="status-text">未接続</span>
          </div>
          <div id="bike-data" class="mt-2 text-sm grid grid-cols-2 gap-2 hidden">
            <div>速度: <span id="speed">0</span> km/h</div>
            <div>ケイデンス: <span id="cadence">0</span> rpm</div>
            <div>パワー: <span id="power">0</span> W</div>
            <div>距離: <span id="distance">0</span> m</div>
          </div>
        </div>

        <div id="game-container" class="rounded-lg overflow-hidden shadow-inner"></div>
        
        <div class="mt-4 text-white text-sm">
          <h3 class="font-bold mb-2">操作方法:</h3>
          <ul class="space-y-1">
            <li>• ケイデンス（ペダル回転数）でキャラクターが前進</li>
            <li>• パワー150W以上でジャンプ</li>
            <li>• コインを集めてスコアを稼ごう！</li>
            <li>• 敵に当たるとダメージを受けます</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  setupEventListeners();
  setupFTMSCallbacks();
  
  // Phaserゲームの初期化
  new Phaser.Game(gameConfig);
}

// イベントリスナーの設定
function setupEventListeners() {
  const connectBtn = document.getElementById('connect-btn');
  const statusDiv = document.getElementById('connection-status');
  
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      try {
        await ftmsManager.connect();
        if (statusDiv) {
          statusDiv.classList.remove('hidden');
        }
      } catch (error) {
        console.error('接続エラー:', error);
        alert('Bluetoothデバイスの接続に失敗しました。');
      }
    });
  }
}

// FTMSコールバックの設定
function setupFTMSCallbacks() {
  const store = useGameStore.getState();
  
  // データ受信時のコールバック
  ftmsManager.onDataReceived((data) => {
    store.setBikeData(data);
    updateBikeDataDisplay(data);
  });

  // 接続状態変更時のコールバック
  ftmsManager.onConnectionChange((connected) => {
    store.setConnected(connected);
    updateConnectionStatus(connected);
  });
}

// 接続状態の表示更新
function updateConnectionStatus(connected: boolean) {
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const bikeData = document.getElementById('bike-data');
  const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;

  if (indicator && statusText) {
    if (connected) {
      indicator.classList.remove('bg-red-500');
      indicator.classList.add('bg-green-500');
      statusText.textContent = '接続済み';
      bikeData?.classList.remove('hidden');
      if (connectBtn) {
        connectBtn.textContent = '切断';
        connectBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        connectBtn.classList.add('bg-red-600', 'hover:bg-red-700');
      }
    } else {
      indicator.classList.remove('bg-green-500');
      indicator.classList.add('bg-red-500');
      statusText.textContent = '未接続';
      bikeData?.classList.add('hidden');
      if (connectBtn) {
        connectBtn.textContent = 'Bluetoothデバイス接続';
        connectBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        connectBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      }
    }
  }
}

// バイクデータの表示更新
function updateBikeDataDisplay(data: any) {
  const elements = {
    speed: document.getElementById('speed'),
    cadence: document.getElementById('cadence'),
    power: document.getElementById('power'),
    distance: document.getElementById('distance')
  };

  if (elements.speed && data.instantaneousSpeed !== undefined) {
    elements.speed.textContent = data.instantaneousSpeed.toFixed(1);
  }
  if (elements.cadence && data.instantaneousCadence !== undefined) {
    elements.cadence.textContent = Math.round(data.instantaneousCadence).toString();
  }
  if (elements.power && data.instantaneousPower !== undefined) {
    elements.power.textContent = Math.round(data.instantaneousPower).toString();
  }
  if (elements.distance && data.totalDistance !== undefined) {
    elements.distance.textContent = Math.round(data.totalDistance).toString();
  }
}

// Web Bluetooth APIの可用性チェック
if (!navigator.bluetooth) {
  alert('このブラウザはWeb Bluetooth APIに対応していません。ChromeまたはEdgeをお使いください。');
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', initApp);