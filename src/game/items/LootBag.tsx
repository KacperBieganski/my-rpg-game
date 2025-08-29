import Phaser from "phaser";
import { Item } from "./Item";
import type GameScene from "../GameScene";
import { Tooltip } from "../../components/Tooltip";

export class LootBag extends Phaser.Physics.Arcade.Sprite {
  private contents: { gold: number; items: Item[] };
  private isOpen: boolean = false;
  private lootWindow: Phaser.GameObjects.Container | null = null;
  private proximityCheckActive: boolean = false;
  private static openBags: LootBag[] = [];
  private isBeingDestroyed: boolean = false;
  private tooltip: Tooltip;
  private spawnTimer: Phaser.Time.TimerEvent;
  private windowWidth: number = 0;
  private windowHeight: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gold: number,
    items: Item[] = []
  ) {
    super(scene, x, y, "loot_bag");
    this.contents = { gold, items };
    this.tooltip = new Tooltip(scene);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.8);
    this.setDepth(1000);
    this.setVisible(false);

    this.spawnTimer = scene.time.delayedCall(1000, () => {
      this.setVisible(true);
      this.play("LootBag_Spawn");

      this.once("animationcomplete", () => {
        this.setTexture("loot_bag");
        this.proximityCheckActive = true;
      });
    });

    scene.events.on("update", this.update, this);
  }

  update() {
    if (!this.proximityCheckActive || !this.active || this.isBeingDestroyed)
      return;

    const gameScene = this.scene as GameScene;
    if (!gameScene.player || !gameScene.player.sprite) return;

    const player = gameScene.player;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.sprite.x,
      player.sprite.y
    );

    if (distance <= 80 && !this.isOpen) {
      this.openLootWindow();
    } else if (distance > 80 && this.isOpen) {
      this.closeLootWindow(false);
    }
  }

  openLootWindow() {
    if (this.isOpen || this.isBeingDestroyed) return;

    if (LootBag.openBags.length >= 5) {
      return;
    }

    this.isOpen = true;
    LootBag.openBags.push(this);

    const itemCount =
      this.contents.items.length + (this.contents.gold > 0 ? 1 : 0);
    const itemWidth = 40;
    const padding = 20;
    const buttonAreaWidth = 120;

    const contentWidth = itemCount * itemWidth;
    this.windowWidth = Math.max(
      200,
      contentWidth + padding * 2 + buttonAreaWidth
    );
    this.windowHeight = 50;

    const bg = this.scene.add
      .rectangle(0, 0, this.windowWidth, this.windowHeight, 0x000000, 0.7)
      .setStrokeStyle(2, 0xaaaa77, 0.7)
      .setScrollFactor(0)
      .setDepth(10001);

    const takeAllButton = this.scene.add
      .text(this.windowWidth / 2 - 60, -10, "Weź wszystko", {
        fontFamily: "Kereru",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setPadding(8, 4)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(10002);

    const deleteButton = this.scene.add
      .text(this.windowWidth / 2 - 60, 10, "Usuń", {
        fontFamily: "Kereru",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setPadding(8, 4)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(10002);

    const lootElements: Phaser.GameObjects.GameObject[] = [];
    let elementXOffset = -this.windowWidth / 2 + padding + 20;

    if (this.contents.gold > 0) {
      const goldImage = this.scene.add
        .image(elementXOffset, 0, "coins")
        .setDisplaySize(32, 32)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10002);

      const goldText = this.scene.add
        .text(elementXOffset + 15, 5, `x ${this.contents.gold}`, {
          fontFamily: "Kereru",
          fontSize: "14px",
          color: "#ffcc00",
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10002);

      goldImage.on("pointerdown", () => {
        this.takeGold();
      });

      goldText.on("pointerdown", () => {
        this.takeGold();
      });

      lootElements.push(goldImage, goldText);
      elementXOffset += itemWidth;
    }

    this.contents.items.forEach((item, index) => {
      const itemImage = this.scene.add
        .image(elementXOffset + 20, 0, item.id)
        .setDisplaySize(32, 32)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10002);

      itemImage.on("pointerover", () => {
        this.showItemTooltip(item, itemImage.x, itemImage.y);
      });

      itemImage.on("pointerout", () => {
        this.tooltip.hide();
      });

      itemImage.on("pointerdown", () => {
        this.takeItem(index);
      });

      lootElements.push(itemImage);
      elementXOffset += itemWidth;
    });

    this.lootWindow = this.scene.add
      .container(0, 0, [bg, takeAllButton, deleteButton, ...lootElements])
      .setDepth(10000);

    takeAllButton.on("pointerdown", () => {
      this.takeAll();
    });

    deleteButton.on("pointerdown", () => {
      this.destroy();
    });

    this.updateWindowPosition();
  }

  private updateWindowPosition() {
    if (!this.lootWindow) return;

    const cam = this.scene.cameras.main;
    const bagIndex = LootBag.openBags.indexOf(this);

    if (bagIndex === -1) return;

    const yOffset = bagIndex * (this.windowHeight + 10);
    const x = cam.width - this.windowWidth / 2 - 20;
    const y = cam.height - this.windowHeight / 2 - 20 - yOffset;

    this.lootWindow.setPosition(x, y);
  }

  private static updateAllWindowsPositions(_scene: Phaser.Scene) {
    LootBag.openBags.forEach((bag) => {
      if (bag.lootWindow && !bag.isBeingDestroyed) {
        bag.updateWindowPosition();
      }
    });
  }

  private showItemTooltip(item: Item, x: number, y: number) {
    const itemsData = this.scene.cache.json.get("items") || [];
    const itemData = itemsData.find((data: any) => data.id === item.id);

    if (itemData) {
      const windowX = this.lootWindow ? this.lootWindow.x : 0;
      const windowY = this.lootWindow ? this.lootWindow.y : 0;

      this.tooltip.show(
        {
          title: itemData.name,
          description: itemData.description,
          titleColor: this.getRarityColor(itemData.rarity),
        },
        windowX + x,
        windowY + y
      );
    }
  }

  private takeGold() {
    if (this.isBeingDestroyed || this.contents.gold <= 0) return;

    const gameScene = this.scene as GameScene;
    gameScene.player.gold += this.contents.gold;
    this.contents.gold = 0;

    if (this.contents.items.length === 0) {
      this.destroy();
    } else {
      this.closeLootWindow(false);
      this.isOpen = false;
      this.openLootWindow();
    }
  }

  private takeItem(itemIndex: number) {
    if (this.isBeingDestroyed) return;

    const item = this.contents.items[itemIndex];
    const gameScene = this.scene as GameScene;

    gameScene.player.addToInventory(item);
    this.contents.items.splice(itemIndex, 1);

    if (this.contents.items.length === 0 && this.contents.gold === 0) {
      this.destroy();
    } else {
      this.closeLootWindow(false);
      this.isOpen = false;
      this.openLootWindow();
    }
  }

  private takeAll() {
    if (this.isBeingDestroyed) return;

    const gameScene = this.scene as GameScene;
    gameScene.player.gold += this.contents.gold;
    this.contents.gold = 0;

    this.contents.items.forEach((item) => {
      gameScene.player.addToInventory(item);
    });
    this.contents.items = [];

    this.destroy();
  }

  private closeLootWindow(destroyIfEmpty: boolean = true) {
    if (this.lootWindow) {
      this.lootWindow.destroy();
      this.lootWindow = null;
    }

    this.isOpen = false;
    this.tooltip.hide();

    const index = LootBag.openBags.indexOf(this);
    if (index !== -1) {
      LootBag.openBags.splice(index, 1);
    }

    LootBag.updateAllWindowsPositions(this.scene);

    if (
      destroyIfEmpty &&
      this.contents.items.length === 0 &&
      this.contents.gold === 0
    ) {
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

  destroy() {
    if (this.isBeingDestroyed) return;

    this.isBeingDestroyed = true;
    this.scene.events.off("update", this.update, this);

    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    this.closeLootWindow(false);

    const index = LootBag.openBags.indexOf(this);
    if (index !== -1) {
      LootBag.openBags.splice(index, 1);
    }

    this.tooltip.destroy();
    super.destroy();
  }
}
