// ItemManager.ts
import Phaser from "phaser";
import { Item } from "../items/Item";
import type { InventoryItem } from "../SaveManager";
import type { PlayerBase } from "../player/PlayerBase"; // Dodajemy import PlayerBase

export class ItemManager {
  private scene: Phaser.Scene;
  private player: PlayerBase; // Dodajemy referencję do PlayerBase
  public inventory: InventoryItem[] = [];
  public equippedItems: string[] = [];

  constructor(scene: Phaser.Scene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
  }

  addToInventory(item: Item) {
    const existingItem = this.inventory.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.inventory.push({ id: item.id, quantity: 1 });
    }
  }

  removeFromInventory(itemId: string, quantity: number = 1) {
    const itemIndex = this.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex !== -1) {
      this.inventory[itemIndex].quantity -= quantity;
      if (this.inventory[itemIndex].quantity <= 0) {
        this.inventory.splice(itemIndex, 1);
      }
    }
  }

  equipItem(itemId: string, onStatsChange: () => void): boolean {
    // Check if player can equip more items
    if (this.equippedItems.length >= 3) return false;

    // Check if item is in inventory and has available quantity
    const itemInInventory = this.inventory.find((i) => i.id === itemId);
    if (!itemInInventory || itemInInventory.quantity <= 0) return false;

    // Use already loaded items data from cache
    const itemsData = this.scene.cache.json.get("items");
    const itemData = itemsData.find((i: any) => i.id === itemId);

    if (itemData) {
      const item = new Item(itemData);

      // Equip the item - przekazujemy player zamiast this
      item.equip(this.player);
      this.equippedItems.push(itemId);

      // Remove one from inventory
      this.removeFromInventory(itemId, 1);

      // Update UI if needed
      onStatsChange();
      return true;
    }
    return false;
  }

  unequipItem(itemId: string, onStatsChange: () => void): boolean {
    const itemIndex = this.equippedItems.indexOf(itemId);
    if (itemIndex === -1) return false;

    // Use already loaded items data from cache
    const itemsData = this.scene.cache.json.get("items");
    const itemData = itemsData.find((i: any) => i.id === itemId);

    if (itemData) {
      const item = new Item(itemData);

      // Unequip the item - przekazujemy player zamiast this
      item.unequip(this.player);
      this.equippedItems.splice(itemIndex, 1);

      // Add back to inventory
      this.addToInventory(item);

      // Update UI if needed
      onStatsChange();
      return true;
    }
    return false;
  }

  useItem(itemId: string, onStatsChange: () => void): boolean {
    // Check if item is in inventory
    const itemInInventory = this.inventory.find((i) => i.id === itemId);
    if (!itemInInventory) return false;

    // Use already loaded items data from cache
    const itemsData = this.scene.cache.json.get("items");
    const itemData = itemsData.find((i: any) => i.id === itemId);

    if (itemData && itemData.type === "consumable") {
      const item = new Item(itemData);

      // Use the item - przekazujemy player zamiast this
      item.use(this.player);
      this.removeFromInventory(itemId, 1);

      // Update UI if needed
      onStatsChange();
      return true;
    }
    return false;
  }

  // Metoda do wczytywania stanu z zapisu
  loadState(inventory: InventoryItem[], equippedItems: string[]) {
    this.inventory = inventory;
    this.equippedItems = equippedItems;
  }

  // Metoda do pobierania stanu do zapisu
  getState(): { inventory: InventoryItem[]; equippedItems: string[] } {
    return {
      inventory: this.inventory,
      equippedItems: this.equippedItems,
    };
  }
}
