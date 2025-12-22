export interface Shop {
  id: string;
  type: 'weapon' | 'armor' | 'item' | 'weapon_armor';
  location: string;
  name: string;
  sequence: number;
}

export interface KeyItem {
  id: string;
  type: 'main_quest' | 'summon_quest' | 'miab_chests';
  location: string;
  check: string;
  vanilla_reward?: string;
  boss?: string | null;
  miab_chest_count?: number;
  conditions?: {
    free_item_enabled?: boolean;
  };
  notes?: string;
}

export interface VanillaStoryEvent {
  seq: number;
  type: 'story' | 'boss_battle' | 'character_joins' | 'character_leaves';
  title: string;
  details: {
    location: string;
    notes?: string;
    optional?: boolean;
  };
}

export interface FEKeyItem {
  id: string;
  name: string;
  used_for: string;
}

export interface FEKeyItemLocation {
  id: string;
  type: 'main_quest' | 'summon_quest' | 'miab_chests';
  location: string;
  check: string;
  miab_chest_count?: number;
  conditions?: {
    free_item_enabled?: boolean;
  };
  sequence: number;
}

export interface RunFlags {
  summonQuestRewards: boolean;
  lunarSubterraneBosses: boolean;
  monsterInABox: boolean;
  freeItemToroia: boolean;
}

export interface ShopVisit {
  shopId: string;
  visited: boolean;
  returnTo: boolean;
}

export interface KeyItemCheck {
  keyItemId: string;
  checked: boolean;
}

export interface CompletedRun {
  id: string;
  name: string;
  flags: RunFlags;
  completionTime: string;
  keyItemsCollected?: number;
  treasureChests?: number;
  characterCount?: number;
  finalParty: string[];
  shopVisits: ShopVisit[];
  keyItemChecks: KeyItemCheck[];
  completedAt: string;
  startedAt: string;
}

export interface ActiveRun {
  id: string;
  name: string;
  flags: RunFlags;
  shopVisits: ShopVisit[];
  keyItemChecks: KeyItemCheck[];
  startedAt: string;
}

export const CHARACTERS = [
  'Cecil',
  'Kain',
  'Rosa',
  'Rydia',
  'Edward',
  'Yang',
  'Palom',
  'Porom',
  'Tellah',
  'Edge',
  'Cid',
  'Fusoya',
] as const;

export type Character = typeof CHARACTERS[number];
