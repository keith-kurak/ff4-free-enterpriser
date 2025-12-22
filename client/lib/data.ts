import { Shop, KeyItem, VanillaStoryEvent, RunFlags, ShopVisit, KeyItemCheck, FEKeyItem, FEKeyItemLocation } from '@/types';
import shopsData from '@/data/shops.json';
import keyItemsData from '@/data/key-items.json';
import vanillaStoryData from '@/data/vanilla-story.json';
import feKeyItemsData from '@/data/fe-key-items.json';
import feKeyItemLocationsData from '@/data/fe-key-item-locations.json';

export function getShops(): Shop[] {
  return shopsData as Shop[];
}

export function getKeyItems(): KeyItem[] {
  return keyItemsData as KeyItem[];
}

export function getVanillaStory(): VanillaStoryEvent[] {
  return vanillaStoryData as VanillaStoryEvent[];
}

export function getFEKeyItems(): FEKeyItem[] {
  return feKeyItemsData as FEKeyItem[];
}

export function getFEKeyItemLocations(): FEKeyItemLocation[] {
  return feKeyItemLocationsData as FEKeyItemLocation[];
}

export function getShopsByLocation(): Map<string, Shop[]> {
  const shops = getShops();
  const grouped = new Map<string, Shop[]>();
  
  shops.forEach((shop) => {
    const existing = grouped.get(shop.location) || [];
    existing.push(shop);
    grouped.set(shop.location, existing);
  });
  
  return grouped;
}

export function getFilteredKeyItems(flags: RunFlags): KeyItem[] {
  const items = getKeyItems();
  
  return items.filter((item) => {
    if (item.type === 'main_quest') {
      if (item.conditions?.free_item_enabled === true && !flags.freeItemToroia) {
        return false;
      }
      if (item.conditions?.free_item_enabled === false && flags.freeItemToroia) {
        return false;
      }
      return true;
    }
    
    if (item.type === 'summon_quest') {
      return flags.summonQuestRewards;
    }
    
    if (item.type === 'miab_chests') {
      return flags.monsterInABox;
    }
    
    return true;
  });
}

export function getKeyItemsByType(flags: RunFlags): {
  mainQuest: KeyItem[];
  summonQuest: KeyItem[];
  miabChests: KeyItem[];
} {
  const filtered = getFilteredKeyItems(flags);
  
  return {
    mainQuest: filtered.filter((i) => i.type === 'main_quest'),
    summonQuest: filtered.filter((i) => i.type === 'summon_quest'),
    miabChests: filtered.filter((i) => i.type === 'miab_chests'),
  };
}

export function initializeShopVisits(): ShopVisit[] {
  const shops = getShops();
  return shops.map((shop) => ({
    shopId: shop.id,
    visited: false,
    returnTo: false,
  }));
}

export function initializeKeyItemChecks(flags: RunFlags): KeyItemCheck[] {
  const items = getFilteredKeyItems(flags);
  return items.map((item) => ({
    keyItemId: item.id,
    checked: false,
  }));
}

export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
