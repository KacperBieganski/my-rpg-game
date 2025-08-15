import Phaser from "phaser";
import GameScene from "../../GameScene";
import MainMenu from "./MainMenu";
import { MusicManager } from "../../MusicManager";
import { SoundManager } from "../../SoundManager";
import { CustomSlider } from "../CustomSlider";

export class OptionsMenu {
  private scene: GameScene;
  private OptionsContainer!: Phaser.GameObjects.Container;
  private backgroundImage!: Phaser.GameObjects.TileSprite;
  private musicSlider!: CustomSlider;
  private effectsSlider!: CustomSlider;

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
      .text(centerX - 210, centerY - 100, "Głośność muzyki:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    this.musicSlider = new CustomSlider(
      this.scene,
      centerX + 120,
      centerY - 100,
      180,
      10,
      0,
      3,
      MusicManager.getInstance().getVolume(),
      (value: number) => {
        MusicManager.getInstance().setVolume(value);
      },
      {
        showValue: false,
      }
    );

    // głośności efektów
    const effectsVolumeText = this.scene.add
      .text(centerX - 210, centerY - 60, "Głośność efektów:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    this.effectsSlider = new CustomSlider(
      this.scene,
      centerX + 120,
      centerY - 60,
      180,
      10,
      0,
      3,
      SoundManager.getInstance().getVolume(),
      (value: number) => {
        SoundManager.getInstance().setVolume(value);
      },
      {
        showValue: false,
      }
    );

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
      effectsVolumeText,
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
    if (this.musicSlider) {
      this.musicSlider.destroy();
    }
    if (this.effectsSlider) {
      this.effectsSlider.destroy();
    }
  }
}
