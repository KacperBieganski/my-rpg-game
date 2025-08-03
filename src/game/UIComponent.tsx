import Phaser from "phaser";
import { PlayerBase } from "./player/PlayerBase";

export class UIComponent {
  private scene: Phaser.Scene;
  private player: PlayerBase;

  // Stałe pozycji
  private readonly UI_MARGIN_LEFT = 20;
  private readonly HEALTH_BAR_Y = 20;
  private readonly EXP_BAR_Y = 50;
  private readonly LEVEL_TEXT_Y = 80;
  private readonly BAR_WIDTH = 200;
  private readonly HEALTH_BAR_HEIGHT = 20;
  private readonly EXP_BAR_HEIGHT = 10;
  private readonly MENU_BUTTON_RIGHT_MARGIN = 20;
  private readonly MENU_BUTTON_TOP_MARGIN = 20;

  // Elementy UI
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Graphics;
  private expBarBg!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private expText!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;

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
    this.createMenuButton();
    this.updateAllUI();
  }

  private createHealthUI(): void {
    // Tło paska zdrowia
    this.healthBarBg = this.scene.add
      .graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(
        this.UI_MARGIN_LEFT,
        this.HEALTH_BAR_Y,
        this.BAR_WIDTH,
        this.HEALTH_BAR_HEIGHT,
        5
      )
      .setScrollFactor(0)
      .setDepth(1000);

    // Pasek zdrowia
    this.healthBar = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(1001);

    // Tekst zdrowia
    this.healthText = this.scene.add
      .text(
        this.UI_MARGIN_LEFT + this.BAR_WIDTH + 10,
        this.HEALTH_BAR_Y - 1,
        "",
        {
          font: "14px Arial",
          color: "#FFFFFF",
          backgroundColor: "#00000055",
          padding: { x: 5, y: 2 },
        }
      )
      .setScrollFactor(0)
      .setDepth(1001);
  }

  private createExpUI(): void {
    // Tło paska doświadczenia
    this.expBarBg = this.scene.add
      .graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(
        this.UI_MARGIN_LEFT,
        this.EXP_BAR_Y,
        this.BAR_WIDTH,
        this.EXP_BAR_HEIGHT,
        3
      )
      .setScrollFactor(0)
      .setDepth(1000);

    // Pasek doświadczenia
    this.expBar = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);

    // Tekst doświadczenia
    this.expText = this.scene.add
      .text(this.UI_MARGIN_LEFT + this.BAR_WIDTH + 10, this.EXP_BAR_Y - 3, "", {
        font: "14px Arial",
        color: "#FFFFFF",
        backgroundColor: "#00000055",
        padding: { x: 5, y: 2 },
      })
      .setScrollFactor(0)
      .setDepth(1001);
  }

  private createLevelUI(): void {
    // Tekst poziomu
    this.levelText = this.scene.add
      .text(this.UI_MARGIN_LEFT, this.LEVEL_TEXT_Y, "", {
        font: "18px MedievalSharp",
        color: "#FFFFFF",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1001);
  }

  private createMenuButton(): void {
    const x = this.scene.cameras.main.width - this.MENU_BUTTON_RIGHT_MARGIN;
    const y = this.MENU_BUTTON_TOP_MARGIN;

    this.menuButton = this.scene.add
      .text(x, y, "Menu", {
        font: "16px Arial",
        color: "#FFFFFF",
        backgroundColor: "#00000055",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1001)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // Emit event to scene to toggle game menu
        this.scene.events.emit("toggleGameMenu");
      });
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
    const width = this.BAR_WIDTH * healthPercent;
    const color =
      healthPercent < 0.3
        ? 0xff0000
        : healthPercent < 0.6
        ? 0xffa500
        : 0x00ff00;

    this.healthBar
      .clear()
      .fillStyle(color, 1)
      .fillRoundedRect(
        this.UI_MARGIN_LEFT,
        this.HEALTH_BAR_Y,
        width,
        this.HEALTH_BAR_HEIGHT,
        5
      );

    // Aktualizuj tekst zdrowia
    this.healthText.setText(
      `${Math.floor(this.player.health)}/${this.player.maxHealth}`
    );
  }

  private updateExpUI(): void {
    const expPercent = Phaser.Math.Clamp(
      this.player.experience / this.player.nextLevelExp,
      0,
      1
    );
    const width = this.BAR_WIDTH * expPercent;

    this.expBar
      .clear()
      .fillStyle(0x4d8dff, 1)
      .fillRoundedRect(
        this.UI_MARGIN_LEFT,
        this.EXP_BAR_Y,
        width,
        this.EXP_BAR_HEIGHT,
        3
      );

    // Aktualizuj tekst doświadczenia
    this.expText.setText(
      `${this.player.experience}/${this.player.nextLevelExp}`
    );
  }

  private updateLevelUI(): void {
    this.levelText.setText(`Lvl ${this.player.level}`);
  }

  public destroy(): void {
    this.healthBar.destroy();
    this.healthBarBg.destroy();
    this.healthText.destroy();
    this.expBar.destroy();
    this.expBarBg.destroy();
    this.levelText.destroy();
    this.expText.destroy();
    this.menuButton.destroy();

    // Remove keyboard listener
    this.scene.input.keyboard?.off("keydown-ESC");
  }
}
