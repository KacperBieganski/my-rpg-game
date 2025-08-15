import Phaser from "phaser";
import GameScene from "../../GameScene";
import MainMenu from "./MainMenu";

export default class ClassSelection {
  private scene: GameScene;
  private selectionContainer!: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.create();
  }

  static preload(_scene: Phaser.Scene) {}

  create() {
    const { width, height } = this.scene.cameras.main;

    this.scene.add
      .tileSprite(0, 0, width, height, "Water_Background_color")
      .setOrigin(0, 0)
      .setTileScale(1)
      .setScrollFactor(0);

    const centerX = width / 2;
    const centerY = height / 2;

    const classMenuBg = this.scene.add.rectangle(
      centerX,
      centerY,
      width * 0.6,
      height * 0.8,
      0x000000,
      0.5
    );

    const title = this.scene.add
      .text(centerX, centerY - 160, "Wybierz klasę postaci", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Warrior option
    const warriorSprite = this.scene.add
      .sprite(centerX - 200, centerY + 30, "Blue_warrior_idle")
      .setScale(1.5);
    const warriorBtn = this.scene.add
      .text(centerX - 200, centerY + 110, "Rycerz", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    // Archer option
    const archerSprite = this.scene.add
      .sprite(centerX, centerY + 30, "Blue_archer_idle")
      .setScale(1.5);
    const archerBtn = this.scene.add
      .text(centerX, centerY + 110, "Łucznik", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setInteractive();

    // Lancer option
    const lancerSprite = this.scene.add
      .sprite(centerX + 200, centerY + 30, "Blue_lancer_idle")
      .setScale(1.5);
    const lancerBtn = this.scene.add
      .text(centerX + 200, centerY + 110, "Lancer", {
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
    MainMenu.isMusicPlaying = false;
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
