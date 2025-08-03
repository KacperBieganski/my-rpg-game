import Phaser from "phaser";
import GameScene from "../GameScene";
import MainMenu from "./MainMenu";

export default class InGameMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
    this.hide();
  }

  private create() {
    // Utwórz kontener dla menu
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(10000)
      .setScrollFactor(0);

    // Oblicz środek ekranu
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Tło menu
    const bg = this.scene.add
      .rectangle(centerX, centerY, 300, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Tytuł menu
    const title = this.scene.add
      .text(centerX, centerY - 80, "Menu Gry", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Przycisk Wznów grę
    const resumeBtn = this.scene.add
      .text(centerX, centerY - 20, "Wznów grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    // Przycisk Zapisz grę
    const saveBtn = this.scene.add
      .text(centerX, centerY + 30, "Zapisz grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.saveGame());

    // Przycisk Menu główne
    const mainMenuBtn = this.scene.add
      .text(centerX, centerY + 80, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.returnToMainMenu());

    // Dodaj elementy do kontenera
    this.menuContainer.add([bg, title, resumeBtn, saveBtn, mainMenuBtn]);
  }

  public show() {
    const cam = this.scene.cameras.main;
    this.menuContainer.setPosition(cam.scrollX, cam.scrollY);
    this.menuContainer.setVisible(true);
    this.scene.togglePause(true);
  }

  public hide() {
    this.menuContainer.setVisible(false);
    this.scene.togglePause(false);
  }

  public toggle() {
    if (this.menuContainer.visible) {
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
