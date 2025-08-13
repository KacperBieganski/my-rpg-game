import Phaser from "phaser";
import GameScene from "../../GameScene";

/** Callbacky dla Navbar */
type NavbarCallbacks = {
  onMenu: () => void;
  onStats: () => void;
};

export default class Navbar {
  private scene: GameScene;
  private navContainer!: Phaser.GameObjects.Container;
  private callbacks: NavbarCallbacks;

  constructor(scene: GameScene, callbacks: NavbarCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.createNavContainer();
    this.hide();
  }

  private createNavContainer() {
    this.navContainer = this.scene.add
      .container(0, 0)
      .setDepth(20000)
      .setScrollFactor(0)
      .setVisible(false);
  }

  public show() {
    if (!this.navContainer) return;
    this.navContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2 - 250;

    this.build(cx, cy);
    this.navContainer.setVisible(true);
  }

  public hide() {
    if (this.navContainer) {
      this.navContainer.setVisible(false);
    }
  }

  private build(cx: number, cy: number) {
    this.navContainer.removeAll(true);

    // tło
    const bg = this.scene.add
      .rectangle(cx, cy, 1024, 76, 0x000000)
      .setStrokeStyle(2, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .disableInteractive();

    const menu = this.scene.add
      .text(cx - 70, cy, "Menu", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.callbacks.onMenu();
      });

    const stats = this.scene.add
      .text(cx + 30, cy, "Postać", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.callbacks.onStats();
      });

    this.navContainer.add([bg, menu, stats]);
  }

  public destroy() {
    this.navContainer.destroy();
  }
}
