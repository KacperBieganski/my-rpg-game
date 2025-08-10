import Phaser from "phaser";
import GameScene from "../GameScene";
import MainMenu from "./MainMenu";
import { MusicManager } from "../MusicManager";
import { SoundManager } from "../SoundManager";

export class OptionsMenu {
  private scene: GameScene;
  private OptionsContainer!: Phaser.GameObjects.Container;
  private backgroundImage!: Phaser.GameObjects.TileSprite;

  constructor(scene: GameScene) {
    this.scene = scene;

    this.createBackground();
    this.create();
  }

  private createBackground() {
    const { width, height } = this.scene.cameras.main;
    this.backgroundImage = this.scene.add
      .tileSprite(0, 0, width, height, "Water_Background_color")
      .setOrigin(0, 0)
      .setTileScale(1)
      .setScrollFactor(0);
  }

  private create() {
    const { width, height } = this.scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    this.OptionsContainer = this.scene.add.container(0, 0);

    const menuBg = this.scene.add.rectangle(
      centerX,
      centerY,
      width * 0.6,
      height * 0.8,
      0x000000,
      0.5
    );

    const title = this.scene.add
      .text(centerX, centerY - 160, "Opcje", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // głośności muzyki
    const musicVolumeText = this.scene.add
      .text(centerX - 200, centerY - 100, "Głośność muzyki:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    const musicSliderElement = document.createElement("input");
    musicSliderElement.type = "range";
    musicSliderElement.min = "0";
    musicSliderElement.max = "3";
    musicSliderElement.step = "0.1";
    musicSliderElement.value = MusicManager.getInstance()
      .getVolume()
      .toString();

    musicSliderElement.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      MusicManager.getInstance().setVolume(value);
    });

    const musicVolumeSlider = this.scene.add
      .dom(centerX + 90, centerY - 100, musicSliderElement)
      .setOrigin(0.5);

    // głośności efektów
    const effectsVolumeText = this.scene.add
      .text(centerX - 210, centerY - 60, "Głośność efektów:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    const soundsSliderElement = document.createElement("input");
    soundsSliderElement.type = "range";
    soundsSliderElement.min = "0";
    soundsSliderElement.max = "3";
    soundsSliderElement.step = "0.1";
    soundsSliderElement.value = SoundManager.getInstance()
      .getVolume()
      .toString();

    soundsSliderElement.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      SoundManager.getInstance().setVolume(value);
    });

    const soundsVolumeSlider = this.scene.add
      .dom(centerX + 90, centerY - 60, soundsSliderElement)
      .setOrigin(0.5);

    // Back button
    const backBtn = this.scene.add
      .text(centerX, centerY + 160, "◀ Powrót", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.cancel());

    this.OptionsContainer.add([
      menuBg,
      title,
      musicVolumeText,
      musicVolumeSlider,
      effectsVolumeText,
      soundsVolumeSlider,
      backBtn,
    ]);
  }

  private cancel() {
    this.destroy();
    new MainMenu(this.scene);
  }

  public destroy() {
    if (this.backgroundImage) {
      this.backgroundImage.destroy();
    }
    if (this.OptionsContainer) {
      this.OptionsContainer.destroy();
    }
  }
}
