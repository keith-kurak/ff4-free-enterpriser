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
  locked_by?: string;
  location_lock?: string;
  notes?: string;
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
  returnTo?: boolean;
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

// Runs created from a Free Enterprise flagset. The types above (ActiveRun,
// CompletedRun, RunFlags) are the legacy format and are kept only for history.
export type FlagInputMethod = 'flagset' | 'code' | 'manual';

export interface Run {
  schemaVersion: 2;
  id: string;
  name: string;
  /** How the flags were entered. */
  inputMethod: FlagInputMethod;
  /** The text the user entered, as entered. Empty for manual runs. */
  input: string;
  /** Canonical flag text. For manual runs, only the flags that were entered. */
  flags: string;
  /** The ff4fe.com flag code ("b..."). Null for manual runs. */
  flagCode: string | null;
  /** The Free Enterprise version the flags were read with, e.g. "4.6.0". */
  feVersion: string;
  startedAt: string;
  completedAt?: string;
  completionTime?: string;
  keyItemsCollected?: number;
  treasureChests?: number;
  characterCount?: number;
  finalParty?: string[];
}
