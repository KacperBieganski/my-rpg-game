import Phaser from "phaser";
import GameScene from "../../GameScene";
import { SaveManager } from "../../SaveManager";
import MainMenu from "./MainMenu";

export class LoadSlotsMenu {
  private scene: GameScene;
  private loadContainer!: Phaser.GameObjects.Container;
  private backgroundImage!: Phaser.GameObjects.TileSprite;
  private confirmationDialog!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createBackground();
    this.create();
  }

  private createBackground() {
    const { width, height } = this.scene.cameras.main;
    this.backgroundImage = this.scene.add
      .tileSprite(0, 0, width, height, "Water_Background_color")
      .setOrigin(0, 0)
      .setTileScale(1)
      .setScrollFactor(0);
  }

  private create() {
    const { width, height } = this.scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const menuBg = this.scene.add.rectangle(
      centerX,
      centerY,
      width * 0.6,
      height * 0.8,
      0x000000,
      0.5
    );

    const title = this.scene.add
      .text(centerX, centerY - 160, "Wczytaj grę", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Standard slots (1-4)
    const slots = [1, 2, 3, 4] as const;
    const slotElements: Phaser.GameObjects.GameObject[] = [];

    slots.forEach((slot, i) => {
      const data = SaveManager.load(slot);
      const text = data
        ? `Slot ${slot}: ${data.characterClass} Lvl ${data.level}`
        : `Slot ${slot}: pusty`;

      const btn = this.scene.add
        .text(centerX, centerY - 80 + i * 40, text, {
          fontSize: "24px",
          color: data ? "#ffffff" : "#aaaaaa",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.handleSlotClick(slot));

      slotElements.push(btn);
    });

    // Autosave slot
    const autoSaveData = SaveManager.getAutoSaveData();
    const autoSaveText = autoSaveData
      ? `Autozapis: ${autoSaveData.characterClass} Lvl ${autoSaveData.level}`
      : "Autozapis: brak";

    const autoSaveBtn = this.scene.add
      .text(centerX, centerY + 80, autoSaveText, {
        fontSize: "24px",
        color: autoSaveData ? "#ffffff" : "#aaaaaa",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (autoSaveData) {
          this.handleSlotClick("auto");
        }
      });

    // Back button
    const backBtn = this.scene.add
      .text(centerX, centerY + 160, "◀ Powrót", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.cancel());

    this.loadContainer = this.scene.add.container(0, 0, [
      menuBg,
      title,
      ...slotElements,
      autoSaveBtn,
      backBtn,
    ]);
  }

  private handleSlotClick(slot: 1 | 2 | 3 | 4 | "auto") {
    const data =
      slot === "auto" ? SaveManager.getAutoSaveData() : SaveManager.load(slot);

    if (!data) {
      alert(slot === "auto" ? "Brak autozapisu" : "Brak zapisu w tym slocie");
      return;
    }

    MainMenu.isMusicPlaying = false;
    this.destroy();
    this.scene.loadGame(data);
  }

  private cancel() {
    this.destroy();
    new MainMenu(this.scene);
  }

  public destroy() {
    if (this.backgroundImage) {
      this.backgroundImage.destroy();
    }
    if (this.loadContainer) {
      this.loadContainer.destroy();
    }
    if (this.confirmationDialog) {
      this.confirmationDialog.destroy();
    }
  }
}
