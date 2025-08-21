import type { PlayerBase } from "../player/PlayerBase";

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

  use(player: PlayerBase) {
    if (this.type === "consumable") {
      if (this.properties.healthRestore) {
        player.health = Math.min(
          player.maxHealth,
          player.health + this.properties.healthRestore
        );
      }
      // Handle other consumable effects
    }
  }

  equip(player: PlayerBase) {
    if (this.type === "equipment") {
      // Apply item stats to player
      if (this.properties.attackDamage) {
        player.stats.attackDamage += this.properties.attackDamage;
      }
      if (this.properties.maxHealth) {
        player.stats.maxHealth += this.properties.maxHealth;
        player.health += this.properties.maxHealth;
      }
      if (this.properties.critChance) {
        player.critChance += this.properties.critChance;
      }
      // Add more stat modifications as needed
    }
  }

  unequip(player: PlayerBase) {
    if (this.type === "equipment") {
      // Remove item stats from player
      if (this.properties.attackDamage) {
        player.stats.attackDamage -= this.properties.attackDamage;
      }
      if (this.properties.maxHealth) {
        player.stats.maxHealth -= this.properties.maxHealth;
        player.health = Math.min(player.health, player.stats.maxHealth);
      }
      if (this.properties.critChance) {
        player.critChance -= this.properties.critChance;
      }
      // Add more stat reversions as needed
    }
  }
}
