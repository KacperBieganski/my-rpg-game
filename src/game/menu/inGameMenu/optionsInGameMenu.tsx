import Phaser from "phaser";
import GameScene from "../../GameScene";
import { MusicManager } from "../../MusicManager";
import { SoundManager } from "../../SoundManager";
import { CustomSlider } from "../CustomSlider";

export default class optionsInGameMenu {
  private scene: GameScene;
  private container!: Phaser.GameObjects.Container;
  private musicSlider!: CustomSlider;
  private effectsSlider!: CustomSlider;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createOptionsContainer();
    this.escKey = this.scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.escKey?.on("down", () => {
      if (this.container.visible) {
        this.hide();
      }
    });

    this.build();
  }

  private createOptionsContainer() {
    this.container = this.scene.add
      .container(169, 0)
      .setDepth(1000000)
      .setScrollFactor(0)
      .setVisible(false);
  }

  public show() {
    if (!this.container) return;
    this.build();
    this.container.setVisible(true);
  }

  public hide() {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  private build() {
    this.container.removeAll(true);
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło i tytuł
    const bg = this.scene.add
      .rectangle(cx, cy + 38, 683, 500)
      .setOrigin(0.5)
      .setScrollFactor(0);

    // głośności muzyki
    const musicVolumeText = this.scene.add
      .text(cx - 180, cy - 70, "Głośność muzyki:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    this.musicSlider = new CustomSlider(
      this.scene,
      cx + 130,
      cy - 70,
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
        depth: 2,
      }
    );

    // głośności efektów
    const effectsVolumeText = this.scene.add
      .text(cx - 180, cy - 40, "Głośność efektów:", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(2);

    this.effectsSlider = new CustomSlider(
      this.scene,
      cx + 130,
      cy - 40,
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
        depth: 2,
      }
    );

    this.container.add([
      bg,
      musicVolumeText,
      effectsVolumeText,
      ...this.musicSlider.getGameObjects(),
      ...this.effectsSlider.getGameObjects(),
    ]);
  }

  public destroy() {
    if (this.escKey) {
      this.escKey.off("down");
      this.scene.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    if (this.container) {
      this.container.destroy();
    }

    if (this.musicSlider) {
      this.musicSlider.destroy();
    }
    if (this.effectsSlider) {
      this.effectsSlider.destroy();
    }
  }
}
