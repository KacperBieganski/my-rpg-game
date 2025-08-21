export interface SaveData {
  x: number;
  y: number;
  characterClass: "warrior" | "archer" | "lancer";
  health: number;
  maxHealth: number;
  regenRate: number;
  level: number;
  experience: number;
  levelPoints: number;
  currentStamina: number;
  maxStamina: number;
  staminaRegenRate: number;
  critChance: number;
  critDamageMultiplier: number;
  attackDamage: number;
  speed: number;
  gold: number;
  inventory: InventoryItem[];
  equippedItems: string[];
  timestamp?: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

const PREFIX = "myrpg_save_";
const AUTO_SAVE_KEY = PREFIX + "auto";

export class SaveManager {
  static save(slot: 1 | 2 | 3 | 4 | "auto", data: SaveData) {
    const saveData = {
      ...data,
      timestamp: Date.now(),
    };
    const key = slot === "auto" ? AUTO_SAVE_KEY : PREFIX + slot;
    localStorage.setItem(key, JSON.stringify(saveData));
  }

  static load(slot: 1 | 2 | 3 | 4 | "auto"): SaveData | null {
    const key = slot === "auto" ? AUTO_SAVE_KEY : PREFIX + slot;
    const raw = localStorage.getItem(key);

    if (!raw) return null;

    const data = JSON.parse(raw);

    // Return loaded data
    return {
      ...data,
      //timestamp: data.timestamp || Date.now(),
    };
  }

  static has(slot: 1 | 2 | 3 | 4 | "auto"): boolean {
    const key = slot === "auto" ? AUTO_SAVE_KEY : PREFIX + slot;
    return localStorage.getItem(key) !== null;
  }

  static clear(slot: 1 | 2 | 3 | 4 | "auto") {
    const key = slot === "auto" ? AUTO_SAVE_KEY : PREFIX + slot;
    localStorage.removeItem(key);
  }

  static getAutoSaveData(): SaveData | null {
    return this.load("auto");
  }
}
