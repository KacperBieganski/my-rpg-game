export interface SaveData {
  x: number;
  y: number;
  characterClass: "warrior" | "archer" | "lancer";
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  currentStamina: number;
  maxStamina: number;
  critChance: number;
  critDamageMultiplier: number;
  timestamp?: number;
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
    return raw ? (JSON.parse(raw) as SaveData) : null;
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
