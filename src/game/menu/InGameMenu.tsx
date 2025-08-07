import Phaser from "phaser";
import GameScene from "../GameScene";
import SaveSlotMenu from "./SaveSlotMenu";
import { GameState } from "../GameState";

export default class InGameMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;
  public saveSlotMenu!: SaveSlotMenu;
  private isVisible = false;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createContainer();
    this.hide();
    this.saveSlotMenu = new SaveSlotMenu(scene, () => {
      if (this.menuContainer) {
        this.show();
      }
    });
  }

  private createContainer() {
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(10000)
      .setScrollFactor(0);
  }

  private buildMainMenu(centerX: number, centerY: number) {
    const bg = this.scene.add
      .rectangle(centerX, centerY, 300, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const resumeBtn = this.scene.add
      .text(centerX, centerY - 50, "Wznów grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const saveBtn = this.scene.add
      .text(centerX, centerY, "Zapisz grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.saveSlotMenu.show();
        this.scene.currentState = GameState.IN_SAVE_MENU;
      });

    const mainMenuBtn = this.scene.add
      .text(centerX, centerY + 50, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.showConfirmReturn());

    this.menuContainer.add([bg, resumeBtn, saveBtn, mainMenuBtn]);
  }

  public show() {
    if (!this.menuContainer) return;
    this.menuContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.buildMainMenu(cx, cy);
    this.menuContainer.setVisible(true);
    this.isVisible = true;
    this.scene.currentState = GameState.IN_PAUSE_MENU;
    this.scene.togglePause(true);
  }

  public hide() {
    this.menuContainer.setVisible(false);
    this.isVisible = false;
    this.scene.currentState = GameState.IN_GAME;
    this.scene.togglePause(false);
  }

  public toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  private showConfirmReturn() {
    // wyczyść wszystko
    this.menuContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło okna
    const bg = this.scene.add
      .rectangle(cx, cy, 500, 200, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    // pytanie
    const question = this.scene.add
      .text(
        cx,
        cy - 50,
        "Niezapisany postęp zostanie utracony.\nNa pewno wrócić do menu głównego?",
        {
          fontSize: "18px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // „Tak” – powrót do głównego menu
    const yesBtn = this.scene.add
      .text(cx - 110, cy + 40, "Tak", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.scene.destroyGame();
      });

    // „Zapisz grę” – otwórz zapis
    const saveBtn = this.scene.add
      .text(cx, cy + 40, "Zapisz grę", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.saveSlotMenu.show();
      });

    // „Nie” – wróć do menu pauzy
    const noBtn = this.scene.add
      .text(cx + 110, cy + 40, "Nie", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.show();
      });

    this.menuContainer.add([bg, question, yesBtn, saveBtn, noBtn]);
  }

  public destroy() {
    this.saveSlotMenu.destroy();
    this.menuContainer.destroy();
  }
}
