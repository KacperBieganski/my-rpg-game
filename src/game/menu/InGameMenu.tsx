import Phaser from "phaser";
import GameScene from "../GameScene";

export default class InGameMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;
  private isVisible: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
    this.hide();
  }

  private create() {
    // Utwórz pusty kontener
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(10000)
      .setScrollFactor(0);
  }

  private buildMenuContents(centerX: number, centerY: number) {
    const bg = this.scene.add
      .rectangle(centerX, centerY, 300, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const title = this.scene.add
      .text(centerX, centerY - 80, "Menu Gry", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const resumeBtn = this.scene.add
      .text(centerX, centerY - 20, "Wznów grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const saveBtn = this.scene.add
      .text(centerX, centerY + 30, "Zapisz grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.saveGame());

    const mainMenuBtn = this.scene.add
      .text(centerX, centerY + 80, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.returnToMainMenu());

    // Dodaj do kontenera
    this.menuContainer.add([bg, title, resumeBtn, saveBtn, mainMenuBtn]);
  }

  public show() {
    const cam = this.scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    // Wyczyść i zbuduj menu dynamicznie (dla poprawnej pozycji)
    this.menuContainer.removeAll(true);
    this.buildMenuContents(centerX, centerY);

    this.menuContainer.setVisible(true);
    this.scene.togglePause(true);
    this.isVisible = true;
  }

  public hide() {
    this.menuContainer.setVisible(false);
    this.scene.togglePause(false);
    this.isVisible = false;
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private saveGame() {
    console.log("Save game clicked");
  }

  private returnToMainMenu() {
    if (
      confirm(
        "Czy na pewno chcesz wrócić do menu głównego? Niezapisany postęp zostanie utracony."
      )
    ) {
      this.hide();
      this.scene.destroyGame();
    }
  }

  public destroy() {
    this.menuContainer.destroy();
  }
}
