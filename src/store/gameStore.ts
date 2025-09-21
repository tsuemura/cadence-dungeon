import { IndoorBikeData } from '../types/ftms';
import { ShopItem, PlayerInventory } from '../types/shop';

interface GameState {
  // Bluetooth接続状態
  isConnected: boolean;

  // FTMSデータ
  bikeData: IndoorBikeData;

  // ゲーム状態
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';

  // スコア
  score: number;
  highScore: number;

  // お金（発電所システム用）
  money: number;

  // ショップとインベントリ
  inventory: PlayerInventory;

  // プレイヤー状態
  playerHealth: number;

  // ゲーム設定
  difficulty: 'easy' | 'normal' | 'hard';
}

class GameStore {
  private state: GameState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = {
      isConnected: false,
      bikeData: {},
      gameStatus: 'idle',
      score: 0,
      highScore: parseInt(localStorage.getItem('highScore') || '0'),
      money: 0,
      inventory: {
        items: [],
        efficiencyMultiplier: 1.0,
        automationLevel: 0
      },
      playerHealth: 100,
      difficulty: 'normal',
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  private setState(newState: Partial<GameState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Actions
  setConnected(connected: boolean) {
    this.setState({ isConnected: connected });
  }

  setBikeData(data: IndoorBikeData) {
    this.setState({ bikeData: data });
  }

  setGameStatus(status: GameState['gameStatus']) {
    this.setState({ gameStatus: status });
  }

  addScore(points: number) {
    const newScore = this.state.score + points;
    const currentHighScore = this.state.highScore;
    if (newScore > currentHighScore) {
      localStorage.setItem('highScore', newScore.toString());
      this.setState({ score: newScore, highScore: newScore });
    } else {
      this.setState({ score: newScore });
    }
  }

  resetScore() {
    this.setState({ score: 0 });
  }

  addMoney(amount: number) {
    const newMoney = this.state.money + amount;
    this.setState({ money: newMoney });
  }

  resetMoney() {
    this.setState({ money: 0 });
  }

  setPlayerHealth(health: number) {
    this.setState({ playerHealth: Math.max(0, Math.min(100, health)) });
  }

  damagePlayer(damage: number) {
    const newHealth = this.state.playerHealth - damage;
    this.setState({ playerHealth: Math.max(0, newHealth) });
    if (newHealth <= 0) {
      this.setState({ gameStatus: 'gameover' });
    }
  }

  setDifficulty(difficulty: GameState['difficulty']) {
    this.setState({ difficulty });
  }

  // ショップ関連メソッド
  buyItem(item: ShopItem): boolean {
    const currentMoney = this.state.money;
    
    // お金が足りない場合は購入失敗
    if (currentMoney < item.price) {
      return false;
    }

    // 既に持っているアイテムは購入不可
    const alreadyOwned = this.state.inventory.items.some(ownedItem => ownedItem.id === item.id);
    if (alreadyOwned) {
      return false;
    }

    // お金を減らしてアイテムを追加
    const newMoney = currentMoney - item.price;
    const newItem = { ...item, owned: true };
    const newInventory = {
      ...this.state.inventory,
      items: [...this.state.inventory.items, newItem]
    };

    // 効果を適用
    this.applyItemEffects(newInventory);

    this.setState({
      money: newMoney,
      inventory: newInventory
    });

    return true;
  }

  private applyItemEffects(inventory: PlayerInventory) {
    let efficiencyMultiplier = 1.0;
    let automationLevel = 0;

    inventory.items.forEach(item => {
      if (item.effect.type === 'multiplier') {
        efficiencyMultiplier *= item.effect.value;
      } else if (item.effect.type === 'automation') {
        automationLevel += item.effect.value;
      }
    });

    inventory.efficiencyMultiplier = efficiencyMultiplier;
    inventory.automationLevel = automationLevel;
  }

  spendMoney(amount: number): boolean {
    if (this.state.money >= amount) {
      this.setState({ money: this.state.money - amount });
      return true;
    }
    return false;
  }
}

export const gameStore = new GameStore();