import { IndoorBikeData } from '../types/ftms';

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
}

export const gameStore = new GameStore();