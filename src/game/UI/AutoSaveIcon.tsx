import Phaser from "phaser";

export class AutoSaveIcon {
  private scene: Phaser.Scene;
  private icon: Phaser.GameObjects.Sprite;
  private saving: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = this.scene.cameras.main;

    this.icon = this.scene.add
      .sprite(width - 40, height - 40, "save_icon")
      .setScrollFactor(0)
      .setDepth(10000)
      .setAlpha(0)
      .setScale(0.5);
  }

  showSaving() {
    if (this.saving) return;
    this.saving = true;

    this.scene.tweens.add({
      targets: this.icon,
      alpha: 1,
      duration: 300,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.saving = false;
        this.icon.setAlpha(0);
      },
    });
  }

  destroy() {
    this.icon.destroy();
  }
}
