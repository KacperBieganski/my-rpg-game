import Phaser from "phaser";
import GameScene from "../../GameScene";
import { SaveManager } from "../../SaveManager";

export class DeathScene {
  private scene: GameScene;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createContainer();
  }

  private createContainer() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(20000)
      .setScrollFactor(0);
  }

  private showDeathScreen(centerX: number, centerY: number) {
    this.container.removeAll(true);

    const bgImg = this.scene.add
      .tileSprite(centerX, centerY, 450, 400, "background1")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setTileScale(2, 2);

    const bg = this.scene.add
      .rectangle(centerX, centerY, 450, 400, 0x000000, 0.4)
      .setStrokeStyle(5, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const img = this.scene.add
      .sprite(centerX, centerY - 140, "Skull")
      .setScale(2)
      .setScrollFactor(0);

    // Przyciski
    const menuBtn = this.scene.add
      .text(centerX, centerY + 20, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.destroyGame();
      });

    const loadBtn = this.scene.add
      .text(centerX, centerY + 70, "Wczytaj grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.showLoadScreen(centerX, centerY);
      });

    this.container.add([bgImg, bg, img, menuBtn, loadBtn]);
  }

  private showLoadScreen(centerX: number, centerY: number) {
    this.container.removeAll(true);

    const bgImg = this.scene.add
      .tileSprite(centerX, centerY, 450, 400, "background1")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setTileScale(2, 2);

    const bg = this.scene.add
      .rectangle(centerX, centerY, 450, 400, 0x000000, 0.4)
      .setStrokeStyle(5, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const title = this.scene.add
      .text(centerX, centerY - 160, "Wczytaj grę", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Standard slots (1-4)
    const slots = [1, 2, 3, 4] as const;
    const slotElements: Phaser.GameObjects.GameObject[] = [];

    slots.forEach((slot, i) => {
      const data = SaveManager.load(slot);
      const btn = this.scene.add
        .text(
          centerX,
          centerY - 80 + i * 40,
          `Slot ${slot}: ${
            data ? `${data.characterClass} Lvl ${data.level}` : "pusty"
          }`,
          {
            fontSize: "20px",
            color: data ? "#ffffff" : "#aaaaaa",
          }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.handleSlotClick(slot);
        });

      slotElements.push(btn);
    });

    // Autosave slot
    const autoSaveData = SaveManager.getAutoSaveData();
    const autoSaveBtn = this.scene.add
      .text(
        centerX,
        centerY + 80,
        `Autozapis: ${
          autoSaveData
            ? `${autoSaveData.characterClass} Lvl ${autoSaveData.level}`
            : "brak"
        }`,
        {
          fontSize: "20px",
          color: autoSaveData ? "#ffffff" : "#aaaaaa",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (autoSaveData) this.handleSlotClick("auto");
      });

    const backBtn = this.scene.add
      .text(centerX, centerY + 160, "◀ Powrót", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.show();
      });

    this.container.add([
      bgImg,
      bg,
      title,
      ...slotElements,
      autoSaveBtn,
      backBtn,
    ]);
  }

  public show() {
    if (!this.container) {
      this.createContainer();
    }

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.showDeathScreen(cx, cy);
    this.container.setVisible(true);
  }

  private handleSlotClick(slot: 1 | 2 | 3 | 4 | "auto") {
    const data =
      slot === "auto" ? SaveManager.getAutoSaveData() : SaveManager.load(slot);

    if (!data) {
      alert(slot === "auto" ? "Brak autozapisu" : "Brak zapisu w tym slocie");
      return;
    }

    this.destroy();
    this.scene.loadGame(data);
  }

  public destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }
}
