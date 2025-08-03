import Phaser from "phaser";
import GameScene from "../GameScene";
import ClassSelection from "./ClassSelection";
import { SaveManager } from "../SaveManager";

export default class MainMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.scene.time.delayedCall(0, () => this.create());
  }

  static preload(scene: Phaser.Scene) {
    // Tutaj można dodać preloadowanie zasobów specyficznych dla menu
  }

  create() {
    this.scene.children.removeAll();
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    const menuBg = this.scene.add.rectangle(
      centerX,
      centerY,
      400,
      400,
      0x000000,
      0.8
    );

    const title = this.scene.add
      .text(centerX, centerY - 110, "Moje RPG", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const newGameBtn = this.scene.add
      .text(centerX, centerY - 10, "Nowa gra", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    const loadGameBtn = this.scene.add
      .text(centerX, centerY + 50, "Wczytaj grę", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    this.menuContainer = this.scene.add.container(0, 0, [
      menuBg,
      title,
      newGameBtn,
      loadGameBtn,
    ]);

    newGameBtn.on("pointerdown", () => {
      this.destroy();
      new ClassSelection(this.scene);
    });

    loadGameBtn.on("pointerdown", () => this.showLoadSlots());
  }
  private showLoadSlots() {
    this.destroy();
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    const slots = [1, 2, 3, 4] as const;
    const slotButtons = slots.map((slot, i) => {
      const text = SaveManager.has(slot)
        ? `Slot ${slot}: ${SaveManager.load(slot)!.characterClass} Lvl ${
            SaveManager.load(slot)!.level
          }`
        : `Slot ${slot}: pusty`;
      return this.scene.add
        .text(centerX, centerY - 60 + i * 40, text, {
          fontSize: "20px",
          color: "#fff",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.loadSlot(slot as 1 | 2 | 3 | 4));
    });

    const backBtn = this.scene.add
      .text(centerX, centerY + 140, "◀ Powrót", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.destroy();
        this.create();
      });

    this.menuContainer = this.scene.add.container(0, 0, [
      ...slotButtons,
      backBtn,
    ]);
  }

  private loadSlot(slot: 1 | 2 | 3 | 4) {
    const data = SaveManager.load(slot);
    if (!data) return alert("Brak zapisu w tym slocie");
    this.destroy();
    this.scene.loadGame(data);
  }

  destroy() {
    this.menuContainer.destroy();
  }
}
