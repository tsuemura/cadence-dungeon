import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

export class GameScene extends Phaser.Scene {
  private moneyText?: Phaser.GameObjects.Text;
  private cadenceText?: Phaser.GameObjects.Text;
  private powerGenText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private shopButton?: Phaser.GameObjects.Text;
  
  // private moneyGenerationTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    gameStore.setGameStatus('playing');
    gameStore.resetMoney();

    // 背景
    this.add.rectangle(0, 0, 1024, 576, 0x1a1a2e).setOrigin(0, 0);

    // タイトル
    this.add.text(512, 50, '発電所', {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 説明テキスト
    this.add.text(512, 120, 'ケイデンス（RPM）に応じて1秒ごとにコインが貯まります', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // UI作成
    this.createUI();

    // お金生成タイマー（1秒ごと）
    this.time.addEvent({
      delay: 1000,
      callback: this.generateMoney,
      callbackScope: this,
      loop: true
    });

    // UIアップデートタイマー（100msごと）
    this.time.addEvent({
      delay: 100,
      callback: this.updateUI,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    const state = gameStore.getState();
    
    if (state.gameStatus !== 'playing') {
      return;
    }
  }

  private generateMoney() {
    const state = gameStore.getState();
    const bikeData = state.bikeData;
    
    // ケイデンス（RPM）からお金を計算
    const cadence = bikeData.instantaneousCadence || 0;
    const moneyGenerated = this.calculateMoneyFromCadence(cadence);
    
    if (moneyGenerated > 0) {
      gameStore.addMoney(moneyGenerated);
    }
  }

  private calculateMoneyFromCadence(cadence: number): number {
    const state = gameStore.getState();
    const inventory = state.inventory;
    
    let money = 0;
    
    // 自動発電（ケイデンス0でも発電）
    money += inventory.automationLevel;
    
    // ケイデンスによる発電
    if (cadence >= 10) {
      let cadenceMoney = cadence - 10;
      
      // 高ケイデンスボーナス
      if (cadence >= 100) {
        cadenceMoney *= 3;
      } else if (cadence >= 80) {
        cadenceMoney *= 2;
      }
      
      money += cadenceMoney;
    }
    
    // 効率倍率を適用
    money *= inventory.efficiencyMultiplier;
    
    return Math.floor(money);
  }

  private createUI() {
    // お金表示
    this.moneyText = this.add.text(50, 200, '💰0', {
      fontSize: '48px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4
    });

    // ケイデンス表示
    this.cadenceText = this.add.text(50, 280, 'ケイデンス: 0 rpm', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 発電量表示
    this.powerGenText = this.add.text(50, 320, '発電量: 💰0/秒', {
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 接続状態表示
    this.statusText = this.add.text(50, 360, '未接続', {
      fontSize: '18px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });

    // ショップボタン
    this.shopButton = this.add.text(50, 400, '🛒 ショップ', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#e67e22',
      padding: { x: 15, y: 10 }
    });
    this.shopButton.setInteractive({ useHandCursor: true });
    this.shopButton.on('pointerdown', () => {
      this.scene.start('ShopScene');
    });
    
    // ホバーエフェクト
    this.shopButton.on('pointerover', () => {
      this.shopButton?.setBackgroundColor('#d35400');
    });
    this.shopButton.on('pointerout', () => {
      this.shopButton?.setBackgroundColor('#e67e22');
    });

    // 効率表示
    this.add.text(50, 460, '効率:', {
      fontSize: '18px',
      color: '#cccccc'
    });
    
    this.add.text(50, 490, '• 10rpm未満: 💰0/秒', {
      fontSize: '14px',
      color: '#999999'
    });
    
    this.add.text(50, 510, '• 10-79rpm: 💰(rpm-10)/秒', {
      fontSize: '14px',
      color: '#999999'
    });
    
    this.add.text(50, 530, '• 80-99rpm: 💰(rpm-10)×2/秒', {
      fontSize: '14px',
      color: '#999999'
    });
    
    this.add.text(50, 550, '• 100rpm以上: 💰(rpm-10)×3/秒', {
      fontSize: '14px',
      color: '#999999'
    });
  }

  private updateUI() {
    const state = gameStore.getState();
    const bikeData = state.bikeData;
    
    // お金表示更新
    if (this.moneyText) {
      this.moneyText.setText(`💰${state.money.toLocaleString()}`);
    }

    // ケイデンス表示更新
    if (this.cadenceText) {
      const cadence = bikeData.instantaneousCadence || 0;
      this.cadenceText.setText(`ケイデンス: ${Math.round(cadence)} rpm`);
    }

    // 発電量表示更新
    if (this.powerGenText) {
      const cadence = bikeData.instantaneousCadence || 0;
      const moneyPerSecond = this.calculateMoneyFromCadence(cadence);
      this.powerGenText.setText(`発電量: 💰${moneyPerSecond}/秒`);
    }

    // 接続状態表示更新
    if (this.statusText) {
      if (state.isConnected) {
        this.statusText.setText('FTMS接続中');
        this.statusText.setColor('#00ff00');
      } else {
        this.statusText.setText('未接続（デバッグモード）');
        this.statusText.setColor('#ff0000');
      }
    }
  }
}