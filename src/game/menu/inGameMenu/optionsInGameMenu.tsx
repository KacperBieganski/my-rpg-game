import Phaser from "phaser";
import GameScene from "../../GameScene";
import { MusicManager } from "../../MusicManager";
import { SoundManager } from "../../SoundManager";

export default class optionsInGameMenu {
  private scene: GameScene;
  private container!: Phaser.GameObjects.Container;
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
      .dom(cx + 130, cy - 70, musicSliderElement)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // głośności efektów
    const effectsVolumeText = this.scene.add
      .text(cx - 180, cy - 40, "Głośność efektów:", {
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
      .dom(cx + 130, cy - 40, soundsSliderElement)
      .setOrigin(0.5);

    this.container.add([
      bg,
      musicVolumeText,
      musicVolumeSlider,
      effectsVolumeText,
      soundsVolumeSlider,
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
  }
}
