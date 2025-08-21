import Phaser from "phaser";
import { Item } from "./Item";
import type GameScene from "../GameScene";

export class LootBag extends Phaser.Physics.Arcade.Sprite {
  private contents: { gold: number; items: Item[] };
  private isOpen: boolean = false;
  private lootWindow: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gold: number,
    items: Item[] = []
  ) {
    super(scene, x, y, "loot_bag");
    this.contents = { gold, items };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.8);
    this.setDepth(1000); // Ustawienie wysokiego depth, aby był widoczny

    // Zmiana: Używamy funkcji strzałkowej, aby zachować właściwe 'this'
    this.setInteractive({ useHandCursor: true, pixelPerfect: true });
    this.on("pointerdown", () => this.openLootWindow());
  }

  openLootWindow() {
    if (this.isOpen) return;
    this.isOpen = true;

    // Zmiana: Sprawdzamy czy gracz jest wystarczająco blisko
    const gameScene = this.scene as GameScene;
    const player = gameScene.player;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.sprite.x,
      player.sprite.y
    );

    if (distance > 100) {
      this.isOpen = false;
      return; // Gracz jest za daleko
    }

    // Zmiana: Używamy współrzędnych względem kamery, a nie świata
    const cam = this.scene.cameras.main;
    const x = cam.width / 2;
    const y = cam.height / 2;

    const windowWidth = 400;
    const windowHeight = 300;

    const bg = this.scene.add
      .rectangle(x, y, windowWidth, windowHeight, 0x000000, 0.9)
      .setStrokeStyle(2, 0xaaaa77)
      .setScrollFactor(0) // Zmiana: Brak scrollowania z kamerą
      .setDepth(10001);

    const title = this.scene.add
      .text(x, y - 120, "Loot Bag", {
        fontFamily: "serif",
        fontSize: "24px",
        color: "#ffdd88",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10002);

    const closeButton = this.scene.add
      .text(x - 80, y + 100, "Close", {
        fontFamily: "serif",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#aa0000",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(10002);

    const takeAllButton = this.scene.add
      .text(x + 80, y + 100, "Take All", {
        fontFamily: "serif",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#00aa00",
      })
      .setPadding(10, 5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(10002);

    // Create content list
    const itemsText: Phaser.GameObjects.Text[] = [];
    let yOffset = y - 70;

    // Add gold info
    if (this.contents.gold > 0) {
      const goldText = this.scene.add
        .text(x - 150, yOffset, `Gold: ${this.contents.gold}`, {
          fontFamily: "serif",
          fontSize: "16px",
          color: "#ffcc00",
        })
        .setScrollFactor(0)
        .setDepth(10002);
      itemsText.push(goldText);
      yOffset += 30;
    }

    // Add items info
    this.contents.items.forEach((item, index) => {
      const itemText = this.scene.add
        .text(x - 150, yOffset, `${item.name}`, {
          fontFamily: "serif",
          fontSize: "16px",
          color: this.getRarityColor(item.rarity),
        })
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10002);

      itemText.on("pointerdown", () => {
        this.takeItem(index);
        itemText.destroy();
      });

      itemsText.push(itemText);
      yOffset += 30;
    });

    this.lootWindow = this.scene.add
      .container(0, 0, [bg, title, closeButton, takeAllButton, ...itemsText])
      .setDepth(10000);

    // Set up button actions
    closeButton.on("pointerdown", () => {
      this.closeLootWindow();
    });

    takeAllButton.on("pointerdown", () => {
      this.takeAll();
    });

    // Zmiana: Pauzujemy grę podczas przeglądania ekwipunku
    if (this.scene.scene.isActive()) {
      this.scene.physics.pause();
      this.scene.time.paused = true;
    }
  }

  private takeItem(itemIndex: number) {
    const item = this.contents.items[itemIndex];
    const gameScene = this.scene as GameScene;

    // Add to player inventory
    gameScene.player.addToInventory(item);

    // Remove from loot bag
    this.contents.items.splice(itemIndex, 1);

    // If bag is empty after taking item, close it
    if (this.contents.items.length === 0 && this.contents.gold === 0) {
      this.closeLootWindow();
      this.destroy();
    }
  }

  private takeAll() {
    const gameScene = this.scene as GameScene;

    // Add gold to player
    gameScene.player.gold += this.contents.gold;
    this.contents.gold = 0;

    // Add all items to player inventory
    this.contents.items.forEach((item) => {
      gameScene.player.addToInventory(item);
    });
    this.contents.items = [];

    // Close and destroy the loot bag
    this.closeLootWindow();
    this.destroy();
  }

  private closeLootWindow() {
    if (this.lootWindow) {
      this.lootWindow.destroy();
      this.lootWindow = null;
    }

    this.isOpen = false;

    // Zmiana: Wznawiamy grę po zamknięciu
    if (this.scene.scene.isActive()) {
      this.scene.physics.resume();
      this.scene.time.paused = false;
    }

    // If bag is empty after closing, destroy it
    if (this.contents.items.length === 0 && this.contents.gold === 0) {
      this.destroy();
    }
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

  // Zmiana: Nadpisujemy metodę destroy, aby posprzątać
  // destroy(fromScene?: boolean) {
  //   this.closeLootWindow();
  //   super.destroy(fromScene);
  // }
}
