import Phaser from "phaser";
import GameScene from "../GameScene";
import ClassSelection from "./ClassSelection";
import { LoadSlotsMenu } from "./LoadSlotsMenu";

export default class MainMenu {
  private scene: GameScene;
  private container: Phaser.GameObjects.Container;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private backgroundImage!: Phaser.GameObjects.TileSprite;
  private static isMusicPlaying: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0).setDepth(1000);
    (this.scene as any).menuMusic = this;
    this.loadSounds();
    this.create(); // Bezpośrednie wywołanie create bez delayedCall
  }

  static preload(_scene: Phaser.Scene) {}

  private loadSounds() {
    if (!this.scene.sound.get("medieval-main-1")) {
      this.backgroundMusic = this.scene.sound.add("medieval-main-1", {
        volume: 0.6,
        loop: true,
      });
    } else {
      this.backgroundMusic = this.scene.sound.get("medieval-main-1");
    }
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Tło - dodane bezpośrednio do sceny
    this.backgroundImage = this.scene.add
      .tileSprite(0, 0, width, height, "Water_Background_color")
      .setOrigin(0, 0)
      .setTileScale(1)
      .setScrollFactor(0)
      .setDepth(0);

    const centerX = width / 2;
    const centerY = height / 2;

    // Elementy menu dodawane do kontenera
    const menuBg = this.scene.add
      .rectangle(centerX, centerY, width * 0.6, height * 0.8, 0x000000, 0.5)
      .setDepth(1);

    const title = this.scene.add
      .text(centerX, centerY - 110, "Moje RPG", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(2);

    const newGameBtn = this.scene.add
      .text(centerX, centerY - 10, "Nowa gra", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(2);

    const loadGameBtn = this.scene.add
      .text(centerX, centerY + 50, "Wczytaj grę", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(2);

    // Dodanie elementów do kontenera
    this.container.add([menuBg, title, newGameBtn, loadGameBtn]);

    // Odtwarzanie muzyki
    if (!MainMenu.isMusicPlaying) {
      this.backgroundMusic.play();
      MainMenu.isMusicPlaying = true;
    }

    // Obsługa przycisków
    newGameBtn.on("pointerdown", () => {
      this.destroy(false);
      new ClassSelection(this.scene);
    });

    loadGameBtn.on("pointerdown", () => {
      this.destroy(false);
      new LoadSlotsMenu(this.scene);
    });
  }

  stopMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
      MainMenu.isMusicPlaying = false;
    }
  }

  destroy(stopMusic: boolean = false) {
    if (stopMusic) {
      this.stopMusic();
    }

    // Usuwanie elementów
    if (this.backgroundImage) {
      this.backgroundImage.destroy();
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
