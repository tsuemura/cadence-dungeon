import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

export class MenuScene extends Phaser.Scene {
  private startButton?: Phaser.GameObjects.Text;
  private connectionStatus?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景グラデーション
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
    bg.fillRect(0, 0, width, height);

    // タイトル
    const title = this.add.text(width / 2, height / 3, 'CADENCE DUNGEON', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    });
    title.setOrigin(0.5, 0.5);

    // サブタイトル
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'FTMSデバイスで操作するダンジョンゲーム', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    subtitle.setOrigin(0.5, 0.5);

    // 接続状態表示
    const state = gameStore.getState();
    const statusText = state.isConnected ? '接続済み' : '未接続';
    const statusColor = state.isConnected ? '#4ade80' : '#f87171';
    
    this.connectionStatus = this.add.text(width / 2, height / 2, `Bluetooth: ${statusText}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: statusColor
    });
    this.connectionStatus.setOrigin(0.5, 0.5);

    // スタートボタン
    this.startButton = this.add.text(width / 2, height / 2 + 60, 'GAME START', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#4a90e2',
      padding: { x: 20, y: 10 }
    });
    this.startButton.setOrigin(0.5, 0.5);
    this.startButton.setInteractive({ useHandCursor: true });

    // ホバーエフェクト
    this.startButton.on('pointerover', () => {
      this.startButton?.setScale(1.1);
    });

    this.startButton.on('pointerout', () => {
      this.startButton?.setScale(1);
    });

    // クリックイベント
    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 操作説明
    const instructions = [
      'ケイデンス: キャラクター移動',
      'パワー: ジャンプ力',
      '速度: ダッシュ'
    ];

    instructions.forEach((text, index) => {
      this.add.text(width / 2, height - 120 + (index * 25), text, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0.5, 0.5);
    });

    // ハイスコア表示
    const highScore = state.highScore;
    this.add.text(width - 20, 20, `ハイスコア: ${highScore}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // 接続状態の監視
    this.time.addEvent({
      delay: 500,
      callback: this.updateConnectionStatus,
      callbackScope: this,
      loop: true
    });
  }

  private updateConnectionStatus() {
    const state = gameStore.getState();
    const statusText = state.isConnected ? '接続済み' : '未接続';
    const statusColor = state.isConnected ? '#4ade80' : '#f87171';
    
    if (this.connectionStatus) {
      this.connectionStatus.setText(`Bluetooth: ${statusText}`);
      this.connectionStatus.setColor(statusColor);
    }
  }
}