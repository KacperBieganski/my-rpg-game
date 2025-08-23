import type { StatsManager } from "../player/StatsManager";

export class Item {
  id: string;
  name: string;
  description: string;
  type: string;
  properties: any;
  rarity: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.properties = data.properties;
    this.rarity = data.rarity;
  }

  use(stats: StatsManager) {
    if (this.type === "consumable") {
      if (this.properties.healthRestore) {
        stats.addHealth(this.properties.healthRestore);
      }
      if (this.properties.staminaRestore) {
        stats.addStamina(this.properties.staminaRestore);
      }
      // Handle other consumable effects
    }
  }

  equip(stats: StatsManager) {
    if (this.type === "equipment") {
      // Apply item stats to player
      if (this.properties.attackDamage) {
        stats.attackDamage += this.properties.attackDamage;
      }
      if (this.properties.maxHealth) {
        stats.maxHealth += this.properties.maxHealth;
        stats.addHealth(this.properties.maxHealth);
      }
      if (this.properties.critChance) {
        stats.critChance += this.properties.critChance;
      }
      // Add more stat modifications as needed
    }
  }

  unequip(stats: StatsManager) {
    if (this.type === "equipment") {
      // Remove item stats from player
      if (this.properties.attackDamage) {
        stats.attackDamage -= this.properties.attackDamage;
      }
      if (this.properties.maxHealth) {
        stats.maxHealth -= this.properties.maxHealth;
        stats.health = Math.min(stats.health, stats.maxHealth);
      }
      if (this.properties.critChance) {
        stats.critChance -= this.properties.critChance;
      }
      // Add more stat reversions as needed
    }
  }
}
