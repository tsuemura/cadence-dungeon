import { create } from 'zustand';
import { IndoorBikeData } from '../types/ftms';

interface GameState {
  // Bluetooth接続状態
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // FTMSデータ
  bikeData: IndoorBikeData;
  setBikeData: (data: IndoorBikeData) => void;

  // ゲーム状態
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';
  setGameStatus: (status: GameState['gameStatus']) => void;

  // スコア
  score: number;
  highScore: number;
  addScore: (points: number) => void;
  resetScore: () => void;

  // プレイヤー状態
  playerHealth: number;
  setPlayerHealth: (health: number) => void;
  damagePlayer: (damage: number) => void;

  // ゲーム設定
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (difficulty: GameState['difficulty']) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Bluetooth接続状態
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // FTMSデータ
  bikeData: {},
  setBikeData: (data) => set({ bikeData: data }),

  // ゲーム状態
  gameStatus: 'idle',
  setGameStatus: (status) => set({ gameStatus: status }),

  // スコア
  score: 0,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
  addScore: (points) => {
    const newScore = get().score + points;
    const currentHighScore = get().highScore;
    if (newScore > currentHighScore) {
      localStorage.setItem('highScore', newScore.toString());
      set({ score: newScore, highScore: newScore });
    } else {
      set({ score: newScore });
    }
  },
  resetScore: () => set({ score: 0 }),

  // プレイヤー状態
  playerHealth: 100,
  setPlayerHealth: (health) => set({ playerHealth: Math.max(0, Math.min(100, health)) }),
  damagePlayer: (damage) => {
    const newHealth = get().playerHealth - damage;
    set({ playerHealth: Math.max(0, newHealth) });
    if (newHealth <= 0) {
      set({ gameStatus: 'gameover' });
    }
  },

  // ゲーム設定
  difficulty: 'normal',
  setDifficulty: (difficulty) => set({ difficulty }),
}));