export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'efficiency' | 'automation' | 'special';
  effect: {
    type: 'multiplier' | 'bonus' | 'automation';
    value: number;
    description: string;
  };
  owned?: boolean;
}

export interface PlayerInventory {
  items: ShopItem[];
  efficiencyMultiplier: number;
  automationLevel: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'basic_generator',
    name: '基本発電機',
    description: '発電効率を20%向上させます',
    price: 500000,
    category: 'efficiency',
    effect: {
      type: 'multiplier',
      value: 1.2,
      description: '発電効率 +20%'
    }
  },
  {
    id: 'advanced_generator',
    name: '高性能発電機',
    description: '発電効率を50%向上させます',
    price: 1500000,
    category: 'efficiency',
    effect: {
      type: 'multiplier',
      value: 1.5,
      description: '発電効率 +50%'
    }
  },
  {
    id: 'turbo_generator',
    name: 'ターボ発電機',
    description: '発電効率を100%向上させます',
    price: 5000000,
    category: 'efficiency',
    effect: {
      type: 'multiplier',
      value: 2.0,
      description: '発電効率 +100%'
    }
  },
  {
    id: 'idle_generator',
    name: '自動発電装置',
    description: 'ケイデンス0でも毎秒5💰発電します',
    price: 2000000,
    category: 'automation',
    effect: {
      type: 'automation',
      value: 5,
      description: '自動発電 5💰/秒'
    }
  },
  {
    id: 'mega_idle_generator',
    name: 'メガ自動発電装置',
    description: 'ケイデンス0でも毎秒20💰発電します',
    price: 8000000,
    category: 'automation',
    effect: {
      type: 'automation',
      value: 20,
      description: '自動発電 20💰/秒'
    }
  },
  {
    id: 'efficiency_booster',
    name: '効率ブースター',
    description: '80rpm以上の時の倍率をさらに+1倍にします',
    price: 3000000,
    category: 'special',
    effect: {
      type: 'bonus',
      value: 1,
      description: '高RPM時の効率をさらに向上'
    }
  },
  {
    id: 'money_doubler',
    name: 'マネーダブラー',
    description: '全ての発電量を2倍にします（最高級アイテム）',
    price: 20000000,
    category: 'special',
    effect: {
      type: 'multiplier',
      value: 2.0,
      description: '全発電量 2倍'
    }
  }
];