import Phaser from "phaser";
import { PlayerBase } from "./player/PlayerBase";

export class UIComponent {
  private scene: Phaser.Scene;
  private player: PlayerBase;

  // Elementy UI
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private expBarBg!: Phaser.GameObjects.Graphics;
  private levelIcon!: Phaser.GameObjects.Image;
  private healthIcon!: Phaser.GameObjects.Image;
  private levelText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    this.initUI();
    this.setupEventListeners();
  }

  private initUI(): void {
    this.createHealthUI();
    this.createExpUI();
    this.createLevelUI();
    this.updateAllUI();
  }

  private createHealthUI(): void {
    this.healthBarBg = this.scene.add
      .graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(60, 20, 200, 20, 5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.healthBar = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(1001);

    this.healthIcon = this.scene.add
      .image(30, 30, "ui_heart")
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.9);
  }

  private createExpUI(): void {
    this.expBarBg = this.scene.add
      .graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(60, 50, 200, 10, 3)
      .setScrollFactor(0)
      .setDepth(1000);

    this.expBar = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);
  }

  private createLevelUI(): void {
    this.levelIcon = this.scene.add
      .image(30, 60, "ui_level")
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.7);

    this.levelText = this.scene.add
      .text(60, 65, "", {
        font: "18px MedievalSharp",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1001);
  }

  private setupEventListeners(): void {
    this.player.sprite.on("healthChanged", () => this.updateHealthUI());
    this.player.sprite.on("statsChanged", () => {
      this.updateExpUI();
      this.updateLevelUI();
    });
  }

  private updateAllUI(): void {
    this.updateHealthUI();
    this.updateExpUI();
    this.updateLevelUI();
  }

  private updateHealthUI(): void {
    const healthPercent = Phaser.Math.Clamp(
      this.player.health / this.player.maxHealth,
      0,
      1
    );
    const width = 200 * healthPercent;
    const color =
      healthPercent < 0.3
        ? 0xff0000
        : healthPercent < 0.6
        ? 0xffa500
        : 0x00ff00;

    this.healthBar
      .clear()
      .fillStyle(color, 1)
      .fillRoundedRect(60, 20, width, 20, 5);

    if (healthPercent < 0.3) {
      this.healthIcon.setTint(0xff0000);
      this.healthIcon.setScale(0.9);
      this.scene.time.delayedCall(200, () => {
        this.healthIcon.setTint(0xffffff);
        this.healthIcon.setScale(0.8);
      });
    }
  }

  private updateExpUI(): void {
    const expPercent = Phaser.Math.Clamp(
      this.player.experience / this.player.nextLevelExp,
      0,
      1
    );
    const width = 200 * expPercent;

    this.expBar
      .clear()
      .fillStyle(0x4d8dff, 1)
      .fillRoundedRect(60, 50, width, 10, 3);

    if (expPercent > 0) {
      this.expBar.setAlpha(0.8);
      this.scene.time.delayedCall(100, () => this.expBar.setAlpha(1));
    }
  }

  private updateLevelUI(): void {
    this.levelText.setText(`LVL ${this.player.level}`);

    if (this.player.experience === 0) {
      this.levelIcon.setScale(0.9);
      this.levelText.setScale(1.1);
      this.levelText.setColor("#FFFFFF");

      this.scene.tweens.add({
        targets: [this.levelIcon, this.levelText],
        scale: 1,
        duration: 500,
        ease: "Back.easeOut",
      });

      this.scene.tweens.add({
        targets: this.levelText,
        color: "#FFD700",
        duration: 1000,
      });
    }
  }

  public destroy(): void {
    this.healthBar.destroy();
    this.healthBarBg.destroy();
    this.expBar.destroy();
    this.expBarBg.destroy();
    this.levelIcon.destroy();
    this.healthIcon.destroy();
    this.levelText.destroy();
  }
}
