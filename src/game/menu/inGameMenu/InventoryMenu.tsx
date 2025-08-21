import Phaser from "phaser";
import GameScene from "../../GameScene";
import { PlayerBase } from "../../player/PlayerBase";
import { Item } from "../../items/Item";
import { LootBag } from "../../items/LootBag";
import type { InventoryItem } from "../../SaveManager";

export default class InventoryMenu {
  private scene: GameScene;
  private player: PlayerBase;
  private container!: Phaser.GameObjects.Container;
  private isVisible: boolean = false;
  private itemsData: any[] = [];
  private inventoryGrid: Phaser.GameObjects.Image[] = [];
  private equippedGrid: Phaser.GameObjects.Image[] = [];
  private quantityTexts: Phaser.GameObjects.Text[] = [];
  private frameGrid: Phaser.GameObjects.Image[] = [];
  private backgroundGrid: Phaser.GameObjects.Rectangle[] = [];

  // Stałe dla siatki ekwipunku
  private readonly INVENTORY_SLOTS = 20;
  private readonly INVENTORY_COLUMNS = 5;
  private readonly EQUIPPED_SLOTS = 3;
  private readonly EQUIPPED_COLUMNS = 1;

  constructor(scene: GameScene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    // Załaduj dane itemów raz, w konstruktorze
    this.itemsData = this.scene.cache.json.get("items") || [];
    this.createContainer();
    this.hide();
  }

  private createContainer() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(20000)
      .setScrollFactor(0);
  }

  show() {
    if (this.isVisible) return;
    this.isVisible = true;

    const { centerX, centerY, width, height } = this.scene.cameras.main;

    // Create background
    const bg = this.scene.add
      .rectangle(centerX, centerY + 38, 1024, 500, 0x000000, 0.4)
      .setStrokeStyle(5, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const bgImg = this.scene.add
      .tileSprite(centerX, centerY + 38, 1024, 500, "background1")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setTileScale(2, 2);

    // Create gold display
    const goldText = this.scene.add
      .text(centerX, centerY - height * 0.3, `Gold: ${this.player.gold}`, {
        fontFamily: "serif",
        fontSize: "24px",
        color: "#ffcc00",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Create titles
    const inventoryTitle = this.scene.add
      .text(centerX - width * 0.3, centerY - height * 0.2, "Inventory", {
        fontFamily: "serif",
        fontSize: "20px",
        color: "#ffdd88",
      })
      .setScrollFactor(0);

    const equippedTitle = this.scene.add
      .text(centerX + width * 0.2, centerY - height * 0.2, "Equipped Items", {
        fontFamily: "serif",
        fontSize: "20px",
        color: "#ffdd88",
      })
      .setScrollFactor(0);

    // Add all elements to container
    this.container.add([bgImg, bg, goldText, inventoryTitle, equippedTitle]);

    // Create inventory grid
    this.createInventoryGrid();

    // Create equipped items grid
    this.createEquippedGrid();

    this.container.setVisible(true);
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
    this.clearGrids();
    this.container.removeAll(true);
  }

  private clearGrids() {
    // Clear existing grid items
    this.inventoryGrid.forEach((item) => item.destroy());
    this.equippedGrid.forEach((item) => item.destroy());
    this.quantityTexts.forEach((text) => text.destroy());
    this.frameGrid.forEach((frame) => frame.destroy());
    this.backgroundGrid.forEach((bg) => bg.destroy());

    this.inventoryGrid = [];
    this.equippedGrid = [];
    this.quantityTexts = [];
    this.frameGrid = [];
    this.backgroundGrid = [];
  }

  private createInventoryGrid() {
    const { centerX, centerY, width, height } = this.scene.cameras.main;
    const gridX = centerX - width * 0.35;
    const gridY = centerY - height * 0.1;
    const itemSize = 64;
    const padding = 2;

    // Przygotuj listę przedmiotów do wyświetlenia
    const itemsToShow: { id: string; quantity: number; itemData: any }[] = [];

    this.player.inventory.forEach((invItem) => {
      const itemData = this.itemsData.find(
        (item: any) => item.id === invItem.id
      );
      if (!itemData) return;

      if (itemData.type === "consumable") {
        // Dla consumable grupujemy w jednym slocie
        const existingItem = itemsToShow.find((item) => item.id === invItem.id);
        if (existingItem) {
          existingItem.quantity += invItem.quantity;
        } else {
          itemsToShow.push({
            id: invItem.id,
            quantity: invItem.quantity,
            itemData,
          });
        }
      } else {
        // Dla nieconsumable rozbijamy na pojedyncze egzemplarze
        for (let i = 0; i < invItem.quantity; i++) {
          itemsToShow.push({
            id: invItem.id,
            quantity: 1,
            itemData,
          });
        }
      }
    });

    // Tworzymy wszystkie sloty (puste też)
    for (let i = 0; i < this.INVENTORY_SLOTS; i++) {
      const row = Math.floor(i / this.INVENTORY_COLUMNS);
      const col = i % this.INVENTORY_COLUMNS;
      const x = gridX + col * (itemSize + padding);
      const y = gridY + row * (itemSize + padding);

      // Add frame background dla każdego slotu
      const frame = this.scene.add
        .image(x, y, "Frame")
        .setDisplaySize(itemSize, itemSize)
        .setScrollFactor(0);
      this.container.add(frame);
      this.frameGrid.push(frame);

      // Jeśli w tym slocie jest item, dodaj go
      if (i < itemsToShow.length) {
        const itemInfo = itemsToShow[i];
        const itemData = itemInfo.itemData;

        // Add rarity background
        const rarityColor = this.getRarityColor(itemData.rarity);
        const bgColor =
          Phaser.Display.Color.HexStringToColor(rarityColor).color;
        const itemBg = this.scene.add
          .rectangle(x, y, itemSize - 20, itemSize - 20, bgColor, 0.2)
          .setScrollFactor(0);
        this.container.add(itemBg);
        this.backgroundGrid.push(itemBg);

        // Add item image
        const itemImage = this.scene.add
          .image(x, y, itemInfo.id)
          .setDisplaySize(itemSize - 16, itemSize - 16)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0)
          .setData("itemData", itemData)
          .setData("quantity", itemInfo.quantity);

        // Dodaj tekst z liczbą jeśli jest więcej niż 1
        if (itemInfo.quantity > 1) {
          const quantityText = this.scene.add
            .text(
              x + itemSize / 2 - 3,
              y + itemSize / 2 - 1,
              itemInfo.quantity.toString(),
              {
                fontFamily: "KereruBold",
                fontSize: "20px",
                color: "#ffffff",
                padding: { x: 4, y: 2 },
              }
            )
            .setOrigin(1, 1)
            .setScrollFactor(0);

          this.container.add(quantityText);
          this.quantityTexts.push(quantityText);
        }

        itemImage.on("pointerdown", () => {
          const item = new Item(itemData);
          this.showItemOptions(
            item,
            { id: itemInfo.id, quantity: itemInfo.quantity },
            i
          );
        });

        this.inventoryGrid.push(itemImage);
        this.container.add(itemImage);
      }
    }
  }

  private createEquippedGrid() {
    const { centerX, centerY, width, height } = this.scene.cameras.main;
    const gridX = centerX + width * 0.15;
    const gridY = centerY - height * 0.1;
    const itemSize = 64;
    const padding = 30;

    // Tworzymy wszystkie sloty (puste też)
    for (let i = 0; i < this.EQUIPPED_SLOTS; i++) {
      const row = Math.floor(i / this.EQUIPPED_COLUMNS);
      const col = i % this.EQUIPPED_COLUMNS;
      const x = gridX + col * (itemSize + padding);
      const y = gridY + row * (itemSize + padding);

      // Add frame background dla każdego slotu
      const frame = this.scene.add
        .image(x, y, "Frame")
        .setDisplaySize(itemSize, itemSize)
        .setScrollFactor(0);
      this.container.add(frame);
      this.frameGrid.push(frame);

      // Jeśli w tym slocie jest item, dodaj go
      if (i < this.player.equippedItems.length) {
        const itemId = this.player.equippedItems[i];
        const itemData = this.itemsData.find((item: any) => item.id === itemId);
        if (!itemData) continue;

        // Add rarity background
        const rarityColor = this.getRarityColor(itemData.rarity);
        const bgColor =
          Phaser.Display.Color.HexStringToColor(rarityColor).color;
        const itemBg = this.scene.add
          .rectangle(x, y, itemSize - 20, itemSize - 20, bgColor, 0.2)
          .setScrollFactor(0);
        this.container.add(itemBg);
        this.backgroundGrid.push(itemBg);

        // Add item image
        const itemImage = this.scene.add
          .image(x, y, itemId)
          .setDisplaySize(itemSize - 16, itemSize - 16)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0)
          .setData("itemData", itemData)
          .setData("equippedIndex", i)
          .setTint(0x88ff88);

        itemImage.on("pointerdown", () => {
          const item = new Item(itemData);
          this.showEquippedItemOptions(item, i);
        });

        this.equippedGrid.push(itemImage);
        this.container.add(itemImage);
      }
    }
  }

  private showItemOptions(item: Item, _invItem: InventoryItem, _index: number) {
    // Clear any existing options
    this.container.getAll().forEach((gameObj) => {
      if (gameObj.name === "itemOptions") {
        gameObj.destroy();
      }
    });

    const { centerX, centerY } = this.scene.cameras.main;

    // Create options background
    const optionsBg = this.scene.add
      .rectangle(centerX, centerY, 200, 100, 0x222222, 0.9)
      .setStrokeStyle(1, 0xaaaa77)
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    // Create use/equip button
    const actionText = item.type === "consumable" ? "Use" : "Equip";
    const actionButton = this.scene.add
      .text(centerX - 50, centerY - 20, actionText, {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00aa00",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    actionButton.on("pointerdown", () => {
      if (item.type === "consumable") {
        this.player.useItem(item.id);
        this.refreshView();
      } else {
        // Sprawdź czy gracz może założyć więcej przedmiotów
        if (this.player.equippedItems.length >= 3) {
          this.showMessage("You can only equip 3 items at once!");
          return;
        }
        this.player.equipItem(item.id);
        this.refreshView();
      }
    });

    // Create drop button
    const dropButton = this.scene.add
      .text(centerX + 50, centerY - 20, "Drop", {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#aa0000",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    dropButton.on("pointerdown", () => {
      this.player.removeFromInventory(item.id, 1);

      // Create loot bag with the dropped item
      new LootBag(this.scene, this.player.sprite.x, this.player.sprite.y, 0, [
        item,
      ]);

      this.refreshView();
    });

    // Create close button
    const closeButton = this.scene.add
      .text(centerX, centerY + 20, "Close", {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#0000aa",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    closeButton.on("pointerdown", () => {
      optionsBg.destroy();
      actionButton.destroy();
      dropButton.destroy();
      closeButton.destroy();
    });

    this.container.add([optionsBg, actionButton, dropButton, closeButton]);
  }

  private showEquippedItemOptions(item: Item, _index: number) {
    // Clear any existing options
    this.container.getAll().forEach((gameObj) => {
      if (gameObj.name === "itemOptions") {
        gameObj.destroy();
      }
    });

    const { centerX, centerY } = this.scene.cameras.main;

    // Create options background
    const optionsBg = this.scene.add
      .rectangle(centerX, centerY, 200, 100, 0x222222, 0.9)
      .setStrokeStyle(1, 0xaaaa77)
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    // Create unequip button
    const unequipButton = this.scene.add
      .text(centerX, centerY - 20, "Unequip", {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00aa00",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    unequipButton.on("pointerdown", () => {
      this.player.unequipItem(item.id);
      this.refreshView();
    });

    // Create close button
    const closeButton = this.scene.add
      .text(centerX, centerY + 20, "Close", {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#0000aa",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    closeButton.on("pointerdown", () => {
      optionsBg.destroy();
      unequipButton.destroy();
      closeButton.destroy();
    });

    this.container.add([optionsBg, unequipButton, closeButton]);
  }

  private showMessage(message: string) {
    const { centerX, centerY } = this.scene.cameras.main;

    const messageText = this.scene.add
      .text(centerX, centerY + 150, message, {
        fontFamily: "serif",
        fontSize: "18px",
        color: "#ff0000",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20002);

    this.container.add(messageText);

    // Usuń wiadomość po 2 sekundach
    this.scene.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }

  private refreshView() {
    this.hide();
    this.show();
  }

  private getRarityColor(rarity: string): string {
    switch (rarity) {
      case "common":
        return "#ffffff";
      case "uncommon":
        return "#00ff00";
      case "rare":
        return "#0088ff";
      case "epic":
        return "#ff00ff";
      case "legendary":
        return "#ffaa00";
      default:
        return "#ffffff";
    }
  }
}
