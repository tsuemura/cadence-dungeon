import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const store = useGameStore.getState();

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, width, height);

    // ゲームオーバーテキスト
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5, 0.5);

    // スコア表示
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${store.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5, 0.5);

    // ハイスコア表示
    const highScoreText = this.add.text(width / 2, height / 2 + 50, `High Score: ${store.highScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700'
    });
    highScoreText.setOrigin(0.5, 0.5);

    // リトライボタン
    const retryButton = this.add.text(width / 2, height / 2 + 120, 'RETRY', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#4a90e2',
      padding: { x: 20, y: 10 }
    });
    retryButton.setOrigin(0.5, 0.5);
    retryButton.setInteractive({ useHandCursor: true });

    retryButton.on('pointerover', () => {
      retryButton.setScale(1.1);
    });

    retryButton.on('pointerout', () => {
      retryButton.setScale(1);
    });

    retryButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // メニューボタン
    const menuButton = this.add.text(width / 2, height / 2 + 180, 'MENU', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    });
    menuButton.setOrigin(0.5, 0.5);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });

    menuButton.on('pointerout', () => {
      menuButton.setScale(1);
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // ゲーム統計
    if (store.bikeData.totalDistance) {
      const distanceText = this.add.text(width / 2, height - 80, 
        `Distance: ${Math.round(store.bikeData.totalDistance)}m`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      distanceText.setOrigin(0.5, 0.5);
    }

    if (store.bikeData.totalEnergy) {
      const caloriesText = this.add.text(width / 2, height - 50, 
        `Calories: ${Math.round(store.bikeData.totalEnergy)} kcal`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      caloriesText.setOrigin(0.5, 0.5);
    }
  }
}