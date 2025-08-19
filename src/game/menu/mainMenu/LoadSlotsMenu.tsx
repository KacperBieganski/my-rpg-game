import Phaser from "phaser";
import GameScene from "../../GameScene";
import { SaveManager } from "../../SaveManager";
import MainMenu from "./MainMenu";

export class LoadSlotsMenu {
  private scene: GameScene;
  private loadContainer!: Phaser.GameObjects.Container;
  private confirmationDialog!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
  }

  private create() {
    const { width, height } = this.scene.cameras.main;

    const backgroundImage = this.scene.add
      .image(0, 0, "background3")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDisplaySize(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const menuBg = this.scene.add
      .image(centerX, centerY, "background2")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAngle(90)
      .setDisplaySize(height * 0.9, width * 0.8);

    const title = this.scene.add
      .text(centerX, centerY - 160, "Wczytaj grę", {
        fontFamily: "KereruBold",
        fontSize: "38px",
        color: "#000000",
      })
      .setOrigin(0.5);

    // Standard slots (1-4)
    const slots = [1, 2, 3, 4] as const;
    const slotElements: Phaser.GameObjects.GameObject[] = [];

    slots.forEach((slot, i) => {
      const data = SaveManager.load(slot);
      let label: string;
      if (data && data.timestamp) {
        const formattedDate = this.formatTimestamp(data.timestamp);
        label = `Slot ${slot}: ${data.characterClass} Lvl ${data.level} (${formattedDate})`;
      } else {
        label = `Slot ${slot}: pusty`;
      }

      const btn = this.scene.add
        .text(centerX, centerY - 80 + i * 40, label, {
          fontFamily: "Kereru",
          fontSize: "24px",
          color: data ? "#000000" : "#363636ff",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.handleSlotClick(slot));

      slotElements.push(btn);
    });

    // Autosave slot
    const autoSaveData = SaveManager.getAutoSaveData();
    let autoSaveLabel: string;
    if (autoSaveData && autoSaveData.timestamp) {
      const formattedDate = this.formatTimestamp(autoSaveData.timestamp);
      autoSaveLabel = `Autozapis: ${autoSaveData.characterClass} Lvl ${autoSaveData.level} (${formattedDate})`;
    } else {
      autoSaveLabel = "Autozapis: brak";
    }

    const autoSaveBtn = this.scene.add
      .text(centerX, centerY + 80, autoSaveLabel, {
        fontFamily: "Kereru",
        fontSize: "24px",
        color: autoSaveData ? "#000000" : "#363636ff",
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
        fontFamily: "Kereru",
        fontSize: "24px",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.cancel());

    this.loadContainer = this.scene.add.container(0, 0, [
      backgroundImage,
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

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    // Format: DD.MM.YYYY HH:MM
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  public destroy() {
    if (this.loadContainer) {
      this.loadContainer.destroy();
    }
    if (this.confirmationDialog) {
      this.confirmationDialog.destroy();
    }
  }
}
