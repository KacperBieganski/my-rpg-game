import Phaser from "phaser";
import GameScene from "../../GameScene";
import ClassSelection from "./ClassSelection";
import { MusicManager } from "../../MusicManager";
import { LoadSlotsMenu } from "./LoadSlotsMenu";
import { OptionsMenu } from "./OptionsMenu";

export default class MainMenu {
  private scene: GameScene;
  private container: Phaser.GameObjects.Container;
  public static isMusicPlaying: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0).setDepth(1000);
    (this.scene as any).menuMusic = this;

    this.create();
  }

  static preload(_scene: Phaser.Scene) {}

  create() {
    const music = MusicManager.getInstance();
    if (!MainMenu.isMusicPlaying) {
      music.play(this.scene, "medieval-main-1", true);
      MainMenu.isMusicPlaying = true;
    }

    const { width, height } = this.scene.cameras.main;

    // Tło - dodane bezpośrednio do sceny
    const backgroundImage = this.scene.add
      .image(0, 0, "background3")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDisplaySize(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Elementy menu dodawane do kontenera
    const menuBg = this.scene.add
      .image(centerX, centerY, "background2")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAngle(90)
      .setDisplaySize(height * 0.8, width * 0.6);

    const title = this.scene.add
      .text(centerX, centerY - 110, "Moje RPG", {
        fontFamily: "KereruBold",
        fontSize: "42px",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setDepth(2);

    const newGameBtn = this.scene.add
      .text(centerX, centerY - 10, "Nowa gra", {
        fontFamily: "Kereru",
        fontSize: "24px",
        color: "#000000",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(2);

    const loadGameBtn = this.scene.add
      .text(centerX, centerY + 50, "Wczytaj grę", {
        fontFamily: "Kereru",
        fontSize: "24px",
        color: "#000000",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(2);

    const OptionsBtn = this.scene.add
      .text(centerX, centerY + 110, "Opcje", {
        fontFamily: "Kereru",
        fontSize: "24px",
        color: "#000000",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(2);

    // Dodanie elementów do kontenera
    this.container.add([
      backgroundImage,
      menuBg,
      title,
      newGameBtn,
      loadGameBtn,
      OptionsBtn,
    ]);

    // Odtwarzanie muzyki
    if (!MainMenu.isMusicPlaying) {
      //this.backgroundMusic.play();
      MainMenu.isMusicPlaying = true;
    }

    // Obsługa przycisków
    newGameBtn.on("pointerdown", () => {
      this.destroy();
      new ClassSelection(this.scene);
    });

    loadGameBtn.on("pointerdown", () => {
      this.destroy();
      new LoadSlotsMenu(this.scene);
    });

    OptionsBtn.on("pointerdown", () => {
      this.destroy();
      new OptionsMenu(this.scene);
    });
  }

  destroy() {
    // Usuwanie elementów

    if (this.container) {
      this.container.destroy();
    }
  }
}
