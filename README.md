# Cadence Dungeon

FTMSデバイス（フィットネスバイクなど）で操作するブラウザベースのダンジョンゲームです。

## 特徴

- **Web Bluetooth API**を使用してFTMS対応デバイスと接続
- ケイデンス（ペダル回転数）でキャラクター移動
- パワー出力でジャンプアクション
- PWA対応でオフラインプレイ可能
- バックエンド不要、完全にブラウザで動作

## 技術スタック

- **Vite** - 高速な開発環境とビルドツール
- **TypeScript** - 型安全な開発
- **Phaser 3** - HTML5ゲームエンジン
- **Tailwind CSS** - UIスタイリング
- **Zustand** - 状態管理
- **Web Bluetooth API** - Bluetoothデバイス接続

## 必要環境

- Chrome/Edge（Web Bluetooth API対応ブラウザ）
- HTTPS環境（Web Bluetooth APIの要件）
- FTMS対応のフィットネスデバイス

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（HTTPS）
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## 遊び方

1. ブラウザで`https://localhost:3000`にアクセス
2. 「Bluetoothデバイス接続」ボタンをクリック
3. FTMSデバイスを選択して接続
4. 「GAME START」でゲーム開始

### 操作方法

- **ケイデンス**: キャラクターの移動速度（90rpmで通常速度）
- **パワー**: 150W以上でジャンプ
- **速度**: ダッシュ機能（未実装）

### ゲーム目標

- コインを集めてスコアを稼ぐ
- 敵を避けてヘルスを維持
- ハイスコアを目指す

## プロジェクト構造

```
src/
├── bluetooth/       # Bluetooth接続管理
├── game/           # Phaserゲームシーン
├── store/          # Zustand状態管理
├── styles/         # CSS
└── types/          # TypeScript型定義
```

## デプロイ

GitHub PagesやNetlifyなどの静的ホスティングサービスにデプロイ可能です。
HTTPS環境が必須です。

## ライセンス

ISC