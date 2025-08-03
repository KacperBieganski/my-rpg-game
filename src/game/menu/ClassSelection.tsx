import Phaser from "phaser";
import GameScene from "../GameScene";
import MainMenu from "./MainMenu";

export default class ClassSelection {
  private scene: GameScene;
  private selectionContainer!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
  }

  static preload(scene: Phaser.Scene) {}

  create() {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    const classMenuBg = this.scene.add.rectangle(
      centerX,
      centerY,
      600,
      500,
      0x000000,
      0.9
    );

    const title = this.scene.add
      .text(centerX, centerY - 200, "Wybierz klasę postaci", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Warrior option
    const warriorSprite = this.scene.add
      .sprite(centerX - 200, centerY, "Blue_warrior_idle")
      .setScale(1.5);
    const warriorBtn = this.scene.add
      .text(centerX - 200, centerY + 80, "Rycerz", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    // Archer option
    const archerSprite = this.scene.add
      .sprite(centerX, centerY, "Blue_archer_idle")
      .setScale(1.5);
    const archerBtn = this.scene.add
      .text(centerX, centerY + 80, "Łucznik", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    // Lancer option
    const lancerSprite = this.scene.add
      .sprite(centerX + 200, centerY, "Blue_lancer_idle")
      .setScale(1.5);
    const lancerBtn = this.scene.add
      .text(centerX + 200, centerY + 80, "Lancer", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    const cancelBtn = this.scene.add
      .text(centerX, centerY + 160, "◀ Powrót", {
        fontSize: "20px",
        color: "#fff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    this.selectionContainer = this.scene.add.container(0, 0, [
      classMenuBg,
      title,
      warriorSprite,
      warriorBtn,
      archerSprite,
      archerBtn,
      lancerSprite,
      lancerBtn,
      cancelBtn,
    ]);

    warriorBtn.on("pointerdown", () => this.selectClass("warrior"));
    archerBtn.on("pointerdown", () => this.selectClass("archer"));
    lancerBtn.on("pointerdown", () => this.selectClass("lancer"));
    cancelBtn.on("pointerdown", () => this.cancel());
  }

  private selectClass(characterClass: "warrior" | "archer" | "lancer") {
    this.destroy();
    this.scene.startNewGame(characterClass);
  }

  private cancel() {
    this.destroy();
    new MainMenu(this.scene);
  }

  destroy() {
    this.selectionContainer.destroy();
  }
}
