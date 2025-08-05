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
}

const PREFIX = "myrpg_save_";

export class SaveManager {
  static save(slot: 1 | 2 | 3 | 4, data: SaveData) {
    localStorage.setItem(PREFIX + slot, JSON.stringify(data));
  }

  static load(slot: 1 | 2 | 3 | 4): SaveData | null {
    const raw = localStorage.getItem(PREFIX + slot);
    return raw ? (JSON.parse(raw) as SaveData) : null;
  }

  static has(slot: 1 | 2 | 3 | 4): boolean {
    return localStorage.getItem(PREFIX + slot) !== null;
  }

  static clear(slot: 1 | 2 | 3 | 4) {
    localStorage.removeItem(PREFIX + slot);
  }
}
