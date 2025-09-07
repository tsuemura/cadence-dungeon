import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';

export class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private enemies?: Phaser.Physics.Arcade.Group;
  private coins?: Phaser.Physics.Arcade.Group;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  
  private scoreText?: Phaser.GameObjects.Text;
  private healthBar?: Phaser.GameObjects.Graphics;
  private cadenceText?: Phaser.GameObjects.Text;
  private powerText?: Phaser.GameObjects.Text;
  
  private baseSpeed = 160;
  private jumpPower = 330;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const store = useGameStore.getState();
    store.setGameStatus('playing');
    store.resetScore();
    store.setPlayerHealth(100);

    // 背景
    this.add.rectangle(0, 0, 1024, 576, 0x87ceeb).setOrigin(0, 0);

    // プラットフォーム
    this.platforms = this.physics.add.staticGroup();
    
    // 地面
    for (let i = 0; i < 32; i++) {
      this.platforms.create(i * 32 + 16, 560, 'ground');
    }

    // 空中プラットフォーム
    this.platforms.create(200, 400, 'platform');
    this.platforms.create(500, 320, 'platform');
    this.platforms.create(750, 250, 'platform');
    this.platforms.create(350, 200, 'platform');

    // プレイヤー
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 敵グループ
    this.enemies = this.physics.add.group({
      key: 'enemy',
      repeat: 3,
      setXY: { x: 300, y: 0, stepX: 200 }
    });

    this.enemies.children.entries.forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      e.setBounce(1);
      e.setCollideWorldBounds(true);
      e.setVelocity(Phaser.Math.Between(-100, 100), 20);
    });

    // コイングループ
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 7,
      setXY: { x: 150, y: 0, stepX: 100 }
    });

    this.coins.children.entries.forEach((coin) => {
      const c = coin as Phaser.Physics.Arcade.Sprite;
      c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // 衝突設定
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // オーバーラップ設定
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);

    // キーボード入力
    this.cursors = this.input.keyboard?.createCursorKeys();

    // UI作成
    this.createUI();

    // ゲームループ
    this.time.addEvent({
      delay: 100,
      callback: this.updateFromBikeData,
      callbackScope: this,
      loop: true
    });

    // 敵の生成
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    const store = useGameStore.getState();
    
    if (store.gameStatus !== 'playing') {
      return;
    }

    // キーボード操作（デバッグ用）
    if (!store.isConnected) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.baseSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.baseSpeed);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown && this.player.body?.touching.down) {
        this.player.setVelocityY(-this.jumpPower);
      }
    }
  }

  private updateFromBikeData() {
    const store = useGameStore.getState();
    const bikeData = store.bikeData;

    if (!this.player || !store.isConnected) return;

    // ケイデンスによる移動
    if (bikeData.instantaneousCadence !== undefined) {
      const cadence = bikeData.instantaneousCadence;
      const speed = (cadence / 90) * this.baseSpeed * 2; // 90rpmで通常速度
      this.player.setVelocityX(speed);
    }

    // パワーによるジャンプ
    if (bikeData.instantaneousPower !== undefined && this.player.body?.touching.down) {
      if (bikeData.instantaneousPower > 150) { // 150W以上でジャンプ
        const jumpStrength = Math.min(bikeData.instantaneousPower * 2, 600);
        this.player.setVelocityY(-jumpStrength);
      }
    }

    // UI更新
    this.updateUI();
  }

  private createUI() {
    // スコア
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });

    // ヘルスバー
    this.add.text(16, 50, 'Health:', {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // ケイデンス表示
    this.cadenceText = this.add.text(16, 90, 'Cadence: 0 rpm', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    // パワー表示
    this.powerText = this.add.text(16, 120, 'Power: 0 W', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
  }

  private updateUI() {
    const store = useGameStore.getState();
    
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${store.score}`);
    }

    if (this.cadenceText) {
      const cadence = store.bikeData.instantaneousCadence || 0;
      this.cadenceText.setText(`Cadence: ${Math.round(cadence)} rpm`);
    }

    if (this.powerText) {
      const power = store.bikeData.instantaneousPower || 0;
      this.powerText.setText(`Power: ${Math.round(power)} W`);
    }

    this.updateHealthBar();
  }

  private updateHealthBar() {
    if (!this.healthBar) return;

    const store = useGameStore.getState();
    const health = store.playerHealth;

    this.healthBar.clear();
    
    // 背景
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(100, 54, 204, 20);
    
    // ヘルスバー
    const barColor = health > 60 ? 0x00ff00 : health > 30 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(102, 56, health * 2, 16);
  }

  private collectCoin(_player: any, coin: any) {
    coin.disableBody(true, true);
    
    const store = useGameStore.getState();
    store.addScore(10);

    // 新しいコインを生成
    const x = Phaser.Math.Between(100, 900);
    const newCoin = this.coins?.create(x, 16, 'coin');
    newCoin?.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  }

  private hitEnemy(player: any, enemy: any) {
    const store = useGameStore.getState();
    store.damagePlayer(10);

    // ノックバック
    if (player.x < enemy.x) {
      player.setVelocityX(-200);
    } else {
      player.setVelocityX(200);
    }
    player.setVelocityY(-200);

    // 点滅エフェクト
    this.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      repeat: 3,
      yoyo: true
    });

    if (store.playerHealth <= 0) {
      this.scene.start('GameOverScene');
    }
  }

  private spawnEnemy() {
    const x = Phaser.Math.Between(100, 900);
    const enemy = this.enemies?.create(x, 0, 'enemy');
    enemy?.setBounce(1);
    enemy?.setCollideWorldBounds(true);
    enemy?.setVelocity(Phaser.Math.Between(-150, 150), 20);
  }
}