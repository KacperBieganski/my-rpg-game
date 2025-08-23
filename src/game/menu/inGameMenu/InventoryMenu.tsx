import Phaser from "phaser";
import GameScene from "../../GameScene";
import { PlayerBase } from "../../player/PlayerBase";
import { Item } from "../../items/Item";
import { LootBag } from "../../items/LootBag";
import type { InventoryItem } from "../../SaveManager";
import { Tooltip } from "../../../components/Tooltip";

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
  private lockIcons: Phaser.GameObjects.Image[] = [];

  private tooltip: Tooltip;

  // Stałe dla siatki ekwipunku
  private readonly INVENTORY_SLOTS = 20;
  private readonly INVENTORY_COLUMNS = 5;
  private readonly EQUIPPED_SLOTS = 6;
  private readonly EQUIPPED_COLUMNS = 2;

  constructor(scene: GameScene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    // Załaduj dane itemów raz, w konstruktorze
    this.itemsData = this.scene.cache.json.get("items") || [];
    this.createContainer();
    this.tooltip = new Tooltip(this.scene);
    this.hide();
  }

  private getUnlockedSlotsCount(): number {
    const baseSlots = 2; // 2 pierwsze sloty dostępne od startu
    const additionalSlots = Math.floor(this.player.level / 5); // Kolejne co 5 leveli
    return Math.min(baseSlots + additionalSlots, this.EQUIPPED_SLOTS);
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

    const { centerX, centerY } = this.scene.cameras.main;

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

    // Add all elements to container
    this.container.add([bgImg, bg]);

    this.createGoldContainer();

    // Create inventory grid
    this.createInventoryGrid();

    // Create equipped items grid
    this.createEquippedGrid();

    this.container.setVisible(true);
  }

  private showTooltip(itemData: any, x: number, y: number) {
    this.tooltip.show(
      {
        title: itemData.name,
        description: itemData.description,
        titleColor: this.getRarityColor(itemData.rarity),
      },
      x,
      y
    );
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
    this.tooltip.hide();
    this.clearGrids();
    this.container.removeAll(true);
  }

  private hideTooltip() {
    this.tooltip.hide();
  }

  private clearGrids() {
    // Clear existing grid items
    this.inventoryGrid.forEach((item) => item.destroy());
    this.equippedGrid.forEach((item) => item.destroy());
    this.quantityTexts.forEach((text) => text.destroy());
    this.frameGrid.forEach((frame) => frame.destroy());
    this.backgroundGrid.forEach((bg) => bg.destroy());
    this.lockIcons.forEach((lock) => lock.destroy());

    this.inventoryGrid = [];
    this.equippedGrid = [];
    this.quantityTexts = [];
    this.frameGrid = [];
    this.backgroundGrid = [];
    this.lockIcons = [];
  }

  private createGoldContainer() {
    const { centerX, centerY, width, height } = this.scene.cameras.main;

    const panelBg = this.scene.add
      .image(centerX - 279, centerY - 120, "paper_panel_601_x_150")
      .setDisplaySize(369, 70)
      .setScrollFactor(0)
      .setDepth(-1);

    const coinImage = this.scene.add
      .sprite(centerX - 410, centerY - 120, "coins")
      .setScale(0.4)
      .setScrollFactor(0);

    const goldText = this.scene.add
      .text(
        centerX - width * 0.4 + 40,
        centerY - height * 0.2,
        `x ${this.player.gold}`,
        {
          fontFamily: "Kereru",
          fontSize: "24px",
          color: "#000000",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.container.add([panelBg, coinImage, goldText]);
  }

  private createInventoryGrid() {
    const { centerX, centerY, width, height } = this.scene.cameras.main;
    const gridX = centerX - width * 0.4;
    const gridY = centerY - height * 0.01;
    const itemSize = 64;
    const padding = 2;

    // Oblicz rozmiary całego gridu
    const columns = this.INVENTORY_COLUMNS;
    const rows = Math.ceil(this.INVENTORY_SLOTS / columns);
    const gridWidth = columns * (itemSize + padding) - padding;
    const gridHeight = rows * (itemSize + padding) - padding;

    // Dodaj tło dla całego gridu
    const panelBg = this.scene.add
      .image(
        gridX + gridWidth / 2.5,
        gridY + gridHeight / 2.5 - 10,
        "paper_panel_601_x_478"
      )
      .setDisplaySize(gridWidth + 40, gridHeight + 40) // Dodaj margines wokół gridu
      .setScrollFactor(0)
      .setDepth(-1); // Ustaw na najniższą warstwę

    this.container.add(panelBg);

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
          .rectangle(x, y, itemSize - 20, itemSize - 20, bgColor, 0.3)
          .setScrollFactor(0);
        this.container.add(itemBg);
        this.backgroundGrid.push(itemBg);

        // Item image
        const itemImage = this.scene.add
          .image(x, y, itemInfo.id)
          .setDisplaySize(itemSize - 16, itemSize - 16)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0)
          .setData("itemData", itemData)
          .setData("quantity", itemInfo.quantity);

        // Eventy do tooltipa
        itemImage.on("pointerover", () => {
          this.showTooltip(itemData, x, y);
        });

        itemImage.on("pointerout", () => {
          this.hideTooltip();
        });

        itemImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
          if (this.tooltip.isVisible()) {
            this.tooltip.updatePosition(pointer.x, pointer.y);
          }
        });

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
    const gridX = centerX + width * 0.14;
    const gridY = centerY - height * 0.01;
    const itemSize = 64;
    const padding = 2;

    const unlockedSlots = this.getUnlockedSlotsCount();

    // Oblicz rozmiary dla jednej kolumny
    const rows = Math.ceil(this.EQUIPPED_SLOTS / this.EQUIPPED_COLUMNS);
    const columnWidth = itemSize;
    const columnHeight = rows * (itemSize + padding + 34) - padding;

    // Dodaj tła dla każdej kolumny
    for (let col = 0; col < this.EQUIPPED_COLUMNS; col++) {
      const columnX = gridX + col * (itemSize + padding + 200);
      const columnCenterX = columnX + columnWidth / 2 - 33;
      const columnCenterY = gridY + columnHeight / 2 - 50;

      const panelBg = this.scene.add
        .image(columnCenterX, columnCenterY, "paper_panel_150_x_478")
        .setDisplaySize(columnWidth + 20, columnHeight + 10)
        .setScrollFactor(0)
        .setDepth(-1);

      this.container.add(panelBg);
    }

    const characterSprite = this.scene.add
      .sprite(centerX + 280, centerY + 120, this.player.getCharacterTexture())
      .setScale(2)
      .setFlipX(true)
      .setScrollFactor(0);

    const levelText = this.scene.add
      .text(centerX + 280, centerY - 20, `Poziom ${this.player.stats.level}`, {
        fontFamily: "KereruBold",
        fontSize: "24px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.container.add([characterSprite, levelText]);

    // Tworzymy wszystkie sloty (puste też)
    for (let i = 0; i < this.EQUIPPED_SLOTS; i++) {
      const row = Math.floor(i / this.EQUIPPED_COLUMNS);
      const col = i % this.EQUIPPED_COLUMNS;
      const x = gridX + col * (itemSize + padding + 200);
      const y = gridY + row * (itemSize + padding + 34);

      // Add frame background dla każdego slotu
      const frame = this.scene.add
        .image(x, y, "Frame")
        .setDisplaySize(itemSize, itemSize)
        .setScrollFactor(0)
        .setTint(i < unlockedSlots ? 0xffffff : 0x666666); // Przyciemnij zablokowane sloty
      this.container.add(frame);
      this.frameGrid.push(frame);

      // Dodaj ikonę kłódki dla zablokowanych slotów
      if (i >= unlockedSlots) {
        const lockIcon = this.scene.add
          .image(x, y, "X-symbol") // Zakładając, że masz teksturę kłódki
          .setDisplaySize(itemSize / 2, itemSize / 2)
          .setScrollFactor(0)
          .setDepth(20001);
        this.container.add(lockIcon);
        this.lockIcons.push(lockIcon);

        // Dodaj tekst z wymaganym poziomem
        const requiredLevel = (i - 1) * 5; // Slot 3: level 5, slot 4: level 10, itd.
        const levelText = this.scene.add
          .text(x, y + itemSize / 2 + 5, `Level ${requiredLevel}`, {
            fontFamily: "KereruBold",
            fontSize: "12px",
            color: "#ff0000",
          })
          .setOrigin(0.5)
          .setScrollFactor(0);
        this.container.add(levelText);
        //this.lockIcons.push(levelText);
        continue;
      }

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
          .rectangle(x, y, itemSize - 20, itemSize - 20, bgColor, 0.3)
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

        // Eventy do tooltipa
        itemImage.on("pointerover", () => {
          this.showTooltip(itemData, x, y);
        });

        itemImage.on("pointerout", () => {
          this.hideTooltip();
        });

        itemImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
          if (this.tooltip.isVisible()) {
            this.tooltip.updatePosition(pointer.x, pointer.y);
          }
        });

        itemImage.on("pointerdown", () => {
          const item = new Item(itemData);
          this.player.unequipItem(item.id);
          this.refreshView();
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
    const itemSize = 64;

    // Create options background
    const optionsBg = this.scene.add
      .image(centerX, centerY - 10, "paper_panel_200_x_170")
      .setDisplaySize(130, 100)
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(-1);

    const frame = this.scene.add
      .image(centerX, centerY - 20, "Frame")
      .setDisplaySize(itemSize, itemSize)
      .setScrollFactor(0);

    const rarityColor = this.getRarityColor(item.rarity);
    const bgColor = Phaser.Display.Color.HexStringToColor(rarityColor).color;
    const itemBg = this.scene.add
      .rectangle(
        centerX,
        centerY - 20,
        itemSize - 20,
        itemSize - 20,
        bgColor,
        0.3
      )
      .setScrollFactor(0);

    const itemImage = this.scene.add
      .image(centerX, centerY - 20, item.id)
      .setDisplaySize(itemSize - 16, itemSize - 16)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setTint(0x88ff88);

    // Eventy do tooltipa
    itemImage.on("pointerover", () => {
      this.showTooltip(item, centerX, centerY - 20);
    });

    itemImage.on("pointerout", () => {
      this.hideTooltip();
    });

    itemImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltip.isVisible()) {
        this.tooltip.updatePosition(pointer.x, pointer.y);
      }
    });

    // Create use/equip button
    const actionText = item.type === "consumable" ? "Użyj" : "Załóż";
    const actionButton = this.scene.add
      .text(centerX - 30, centerY + 20, actionText, {
        fontFamily: "Kereru",
        fontSize: "16px",
        color: "#000000",
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
        // Sprawdź czy gracz może założyć więcej przedmiotów (uwzględniając odblokowane sloty)
        const unlockedSlots = this.getUnlockedSlotsCount();
        if (this.player.equippedItems.length >= unlockedSlots) {
          this.showMessage(
            `Jednorazowo możesz wyposażyć się tylko w ${unlockedSlots}  przedmiotów!`
          );
          return;
        }
        this.player.equipItem(item.id);
        this.refreshView();
      }
    });

    // Create drop button
    const dropButton = this.scene.add
      .text(centerX + 30, centerY + 20, "Wyrzuć", {
        fontFamily: "Kereru",
        fontSize: "16px",
        color: "#000000",
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
      .text(centerX + 50, centerY - 45, "X", {
        fontFamily: "KereruBold",
        fontSize: "20px",
        color: "#000000",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName("itemOptions")
      .setScrollFactor(0)
      .setDepth(20001);

    closeButton.on("pointerdown", () => {
      optionsBg.destroy();
      frame.destroy();
      itemBg.destroy();
      itemImage.destroy();
      actionButton.destroy();
      dropButton.destroy();
      closeButton.destroy();
    });

    this.container.add([
      optionsBg,
      frame,
      itemBg,
      itemImage,
      actionButton,
      dropButton,
      closeButton,
    ]);
  }

  private showMessage(message: string) {
    const { centerX, centerY } = this.scene.cameras.main;

    const messageText = this.scene.add
      .text(centerX, centerY + 150, message, {
        fontFamily: "Kereru",
        fontSize: "18px",
        color: "#f14545ff",
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
