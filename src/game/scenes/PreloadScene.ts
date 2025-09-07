import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // プログレスバーの作成
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // ダミーアセットの生成（実際のゲームではここで画像やサウンドをロード）
    this.createAssets();
  }

  create() {
    this.scene.start('MenuScene');
  }

  private createAssets() {
    // プレイヤースプライトの生成
    const playerTexture = this.textures.createCanvas('player', 32, 32);
    const playerContext = playerTexture?.context;
    if (playerContext) {
      playerContext.fillStyle = '#4a90e2';
      playerContext.fillRect(0, 0, 32, 32);
      playerTexture?.refresh();
    }

    // 敵スプライトの生成
    const enemyTexture = this.textures.createCanvas('enemy', 24, 24);
    const enemyContext = enemyTexture?.context;
    if (enemyContext) {
      enemyContext.fillStyle = '#e74c3c';
      enemyContext.fillRect(0, 0, 24, 24);
      enemyTexture?.refresh();
    }

    // コインスプライトの生成
    const coinTexture = this.textures.createCanvas('coin', 16, 16);
    const coinContext = coinTexture?.context;
    if (coinContext) {
      coinContext.fillStyle = '#f1c40f';
      coinContext.beginPath();
      coinContext.arc(8, 8, 8, 0, Math.PI * 2);
      coinContext.fill();
      coinTexture?.refresh();
    }

    // 地面タイルの生成
    const groundTexture = this.textures.createCanvas('ground', 32, 32);
    const groundContext = groundTexture?.context;
    if (groundContext) {
      groundContext.fillStyle = '#8b4513';
      groundContext.fillRect(0, 0, 32, 32);
      groundTexture?.refresh();
    }

    // プラットフォームの生成
    const platformTexture = this.textures.createCanvas('platform', 96, 16);
    const platformContext = platformTexture?.context;
    if (platformContext) {
      platformContext.fillStyle = '#654321';
      platformContext.fillRect(0, 0, 96, 16);
      platformTexture?.refresh();
    }
  }
}