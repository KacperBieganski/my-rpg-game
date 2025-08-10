import Phaser from "phaser";
import GameScene from "../GameScene";
import { GameState } from "../GameState";
import { MusicManager } from "../MusicManager";
import { SoundManager } from "../SoundManager";

export default class optionsInGameMenu {
  private scene: GameScene;
  private container: Phaser.GameObjects.Container;
  private onBack: () => void;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: GameScene, onBack: () => void) {
    this.scene = scene;
    this.onBack = onBack;
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(1000000)
      .setScrollFactor(0)
      .setVisible(false);
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

  public show() {
    if (!this.container) return;
    this.build();
    this.container.setVisible(true);
    this.scene.currentState = GameState.IN_OPTIONS_MENU;
  }

  public hide() {
    if (this.container) {
      this.container.setVisible(false);
    }
    this.onBack();
  }

  private build() {
    this.container.removeAll(true);
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło i tytuł
    const bg = this.scene.add
      .rectangle(cx, cy, 390, 360, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const title = this.scene.add
      .text(cx, cy - 130, "Opcje", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // głośności muzyki
    const musicVolumeText = this.scene.add
      .text(cx - 170, cy - 70, "Głośność muzyki:", {
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
      .dom(cx + 110, cy - 70, musicSliderElement)
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
      .dom(cx + 110, cy - 40, soundsSliderElement)
      .setOrigin(0.5);

    // przycisk „Powrót”
    const back = this.scene.add
      .text(cx, cy + 140, "◀ Powrót", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.onBack();
      });

    this.container.add([
      bg,
      title,
      musicVolumeText,
      musicVolumeSlider,
      effectsVolumeText,
      soundsVolumeSlider,
      back,
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
