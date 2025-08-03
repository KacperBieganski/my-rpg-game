import Phaser from "phaser";
import GameScene from "../GameScene";
import ClassSelection from "./ClassSelection";

export default class MainMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
  }

  static preload(scene: Phaser.Scene) {
    // Tutaj można dodać preloadowanie zasobów specyficznych dla menu
  }

  create() {
    this.scene.children.removeAll();
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    const menuBg = this.scene.add
      .rectangle(centerX, centerY, 400, 400, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff);

    const title = this.scene.add
      .text(centerX, centerY - 100, "Moje RPG", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const newGameBtn = this.scene.add
      .text(centerX, centerY - 30, "Nowa gra", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    const loadGameBtn = this.scene.add
      .text(centerX, centerY + 30, "Wczytaj grę", {
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

    loadGameBtn.on("pointerdown", () => {
      console.log("Load game clicked");
    });
  }

  destroy() {
    this.menuContainer.destroy();
  }
}
