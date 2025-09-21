import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { SHOP_ITEMS, ShopItem } from '../../types/shop';

export class ShopScene extends Phaser.Scene {
  private moneyText?: Phaser.GameObjects.Text;
  private itemButtons: Array<{ 
    background: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    descText: Phaser.GameObjects.Text;
    priceText: Phaser.GameObjects.Text;
    buyButton: Phaser.GameObjects.Text;
    item: ShopItem;
  }> = [];
  private backButton?: Phaser.GameObjects.Text;
  private scrollOffset = 0;
  private maxScrollOffset = 0;

  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0, 0);

    // タイトル
    this.add.text(width / 2, 50, 'ショップ', {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 所持金表示
    this.moneyText = this.add.text(width / 2, 100, '💰0', {
      fontSize: '24px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 戻るボタン
    this.backButton = this.add.text(50, 50, '← 発電所に戻る', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#34495e',
      padding: { x: 15, y: 8 }
    });
    this.backButton.setInteractive({ useHandCursor: true });
    this.backButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // ホバーエフェクト
    this.backButton.on('pointerover', () => {
      this.backButton?.setBackgroundColor('#4a6741');
    });
    this.backButton.on('pointerout', () => {
      this.backButton?.setBackgroundColor('#34495e');
    });

    // アイテムリスト作成
    this.createItemList();

    // スクロール対応
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      this.handleScroll(deltaY);
    });

    // UI更新
    this.updateUI();
  }

  private createItemList() {
    const startY = 160;
    const itemHeight = 120;
    const padding = 10;

    SHOP_ITEMS.forEach((item, index) => {
      const y = startY + (index * (itemHeight + padding));
      const state = gameStore.getState();
      const isOwned = state.inventory.items.some(ownedItem => ownedItem.id === item.id);
      const canAfford = state.money >= item.price;

      // アイテム背景
      const bgColor = isOwned ? 0x27ae60 : (canAfford ? 0x3498db : 0x7f8c8d);
      const background = this.add.rectangle(512, y, 900, itemHeight, bgColor)
        .setStrokeStyle(2, 0xffffff, 0.5);

      // アイテム名
      const nameText = this.add.text(100, y - 35, item.name, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      });

      // 説明文
      const descText = this.add.text(100, y - 10, item.description, {
        fontSize: '14px',
        color: '#ecf0f1'
      });

      // 効果説明
      this.add.text(100, y + 15, `効果: ${item.effect.description}`, {
        fontSize: '12px',
        color: '#bdc3c7'
      });

      // 価格表示
      const priceText = this.add.text(700, y - 20, `💰${item.price.toLocaleString()}`, {
        fontSize: '18px',
        color: '#f39c12',
        fontStyle: 'bold'
      });

      // カテゴリ表示
      const categoryColor = item.category === 'efficiency' ? '#e74c3c' : 
                           item.category === 'automation' ? '#9b59b6' : '#f1c40f';
      const categoryText = item.category === 'efficiency' ? '効率' :
                          item.category === 'automation' ? '自動' : '特殊';
      
      this.add.text(100, y + 35, `[${categoryText}]`, {
        fontSize: '12px',
        color: categoryColor,
        fontStyle: 'bold'
      });

      // 購入ボタン
      let buyButtonText = '購入';
      let buyButtonColor = '#27ae60';
      
      if (isOwned) {
        buyButtonText = '購入済み';
        buyButtonColor = '#95a5a6';
      } else if (!canAfford) {
        buyButtonText = 'お金不足';
        buyButtonColor = '#e74c3c';
      }

      const buyButton = this.add.text(820, y, buyButtonText, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: buyButtonColor,
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);

      // 購入可能な場合のみクリック処理を追加
      if (!isOwned && canAfford) {
        buyButton.setInteractive({ useHandCursor: true });
        buyButton.on('pointerdown', () => {
          this.purchaseItem(item);
        });
        
        buyButton.on('pointerover', () => {
          buyButton.setBackgroundColor('#2ecc71');
        });
        buyButton.on('pointerout', () => {
          buyButton.setBackgroundColor('#27ae60');
        });
      }

      // アイテム情報を保存
      this.itemButtons.push({
        background,
        nameText,
        descText,
        priceText,
        buyButton,
        item
      });
    });

    // スクロール範囲計算
    const totalHeight = SHOP_ITEMS.length * 130;
    const viewHeight = this.cameras.main.height - 200;
    this.maxScrollOffset = Math.max(0, totalHeight - viewHeight);
  }

  private purchaseItem(item: ShopItem) {
    const success = gameStore.buyItem(item);
    
    if (success) {
      // 購入成功時の効果音やエフェクトを追加可能
      this.recreateItemList();
      this.updateUI();
    }
  }

  private recreateItemList() {
    // 既存のアイテム表示をクリア
    this.itemButtons.forEach(itemButton => {
      itemButton.background.destroy();
      itemButton.nameText.destroy();
      itemButton.descText.destroy();
      itemButton.priceText.destroy();
      itemButton.buyButton.destroy();
    });
    this.itemButtons = [];

    // アイテムリストを再作成
    this.createItemList();
  }

  private handleScroll(deltaY: number) {
    const scrollSpeed = 30;
    this.scrollOffset += deltaY > 0 ? scrollSpeed : -scrollSpeed;
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScrollOffset);

    // アイテムの位置を更新
    this.itemButtons.forEach((itemButton, index) => {
      const baseY = 160 + (index * 130);
      const newY = baseY - this.scrollOffset;
      
      itemButton.background.setY(newY);
      itemButton.nameText.setY(newY - 35);
      itemButton.descText.setY(newY - 10);
      itemButton.priceText.setY(newY - 20);
      itemButton.buyButton.setY(newY);
    });
  }

  private updateUI() {
    const state = gameStore.getState();
    
    if (this.moneyText) {
      this.moneyText.setText(`所持金: 💰${state.money.toLocaleString()}`);
    }
  }
}