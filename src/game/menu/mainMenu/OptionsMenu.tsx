import Phaser from "phaser";
import GameScene from "../../GameScene";
import MainMenu from "./MainMenu";
import { MusicManager } from "../../MusicManager";
import { SoundManager } from "../../SoundManager";
import { CustomSlider } from "../CustomSlider";

export class OptionsMenu {
  private scene: GameScene;
  private OptionsContainer!: Phaser.GameObjects.Container;
  private musicSlider!: CustomSlider;
  private effectsSlider!: CustomSlider;

  constructor(scene: GameScene) {
    this.scene = scene;

    this.create();
  }

  private create() {
    const { width, height } = this.scene.cameras.main;

    const backgroundImage = this.scene.add
      .image(0, 0, "background3")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDisplaySize(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this.OptionsContainer = this.scene.add.container(0, 0);

    const menuBg = this.scene.add
      .image(centerX, centerY, "background2")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAngle(90)
      .setDisplaySize(height * 0.9, width * 0.8);

    const title = this.scene.add
      .text(centerX, centerY - 160, "Opcje", {
        fontFamily: "KereruBold",
        fontSize: "38px",
        color: "#000000",
      })
      .setOrigin(0.5);

    // głośności muzyki
    const musicVolumeText = this.scene.add
      .text(centerX - 210, centerY - 100, "Głośność muzyki:", {
        fontFamily: "Kereru",
        fontSize: "20px",
        color: "#000000",
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
        fontFamily: "Kereru",
        fontSize: "20px",
        color: "#000000",
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
        fontFamily: "Kereru",
        fontSize: "24px",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.cancel());

    this.OptionsContainer.add([
      backgroundImage,
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
