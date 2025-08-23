import Phaser from "phaser";
import { DefaultGameSettings } from "../GameSettings";
import GameScene from "../GameScene";
import { type SaveData, SaveManager } from "../SaveManager";
import { PlayerBase } from "../player/PlayerBase";
import { AutoSaveIcon } from "./AutoSaveIcon";

export class UIComponent {
  private scene: Phaser.Scene;
  private player: PlayerBase;
  private autoSaveIcon: AutoSaveIcon;
  private autoSaveTimer!: Phaser.Time.TimerEvent;

  // Stałe pozycji
  private readonly MARGIN = 20;
  private readonly BAR_WIDTH = 220;
  private readonly HEALTH_Y = 20;
  private readonly STAMINA_Y = 50;
  private readonly EXP_Y = 65;
  private readonly LEVEL_Y = 80;

  // Elementy
  private healthBg!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;

  private staminaBg!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private staminaText!: Phaser.GameObjects.Text;

  private expBg!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private expText!: Phaser.GameObjects.Text;

  private levelText!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    this.initUI();
    this.setupListeners();
    this.autoSaveIcon = new AutoSaveIcon(scene);
    this.setupAutoSave();
  }

  private initUI() {
    this.createHealthUI();
    this.createStaminaUI();
    this.createExpUI();
    this.createLevelUI();
    this.createMenuButton();
    this.updateAll();
  }

  private setupAutoSave() {
    const autoSaveTime = DefaultGameSettings.game.autoSaveTime;
    this.autoSaveTimer = this.scene.time.addEvent({
      delay: autoSaveTime,
      callback: this.autoSave,
      callbackScope: this,
      loop: true,
    });
  }

  private autoSave() {
    if (!this.player) return;

    const saveData: SaveData = {
      x: this.player.sprite.x,
      y: this.player.sprite.y,
      characterClass: (this.scene as GameScene).characterClass,
      stats: {
        health: this.player.health,
        maxHealth: this.player.maxHealth,
        maxStamina: this.player.getMaxStamina(),
        currentStamina: this.player.getCurrentStamina(),
        attackDamage: this.player.stats.attackDamage,
        speed: this.player.stats.speed,
        regenRate: this.player.stats.regenRate,
        staminaRegenRate: this.player.stats.staminaRegenRate,
        critChance: this.player.stats.critChance,
        critDamageMultiplier: this.player.stats.critDamageMultiplier,
        level: this.player.level,
        experience: this.player.experience,
        levelPoints: this.player.levelPoints,
        gold: this.player.gold,
        regenDelay: 0,
        staminaRegenDelay: 0,
        nextLevelExp: this.player.nextLevelExp || 0,
      },
      inventory: this.player.itemManager.inventory,
      equippedItems: this.player.itemManager.equippedItems,
    };

    SaveManager.save("auto", saveData);
    this.autoSaveIcon.showSaving();
  }

  private createFrame(
    y: number,
    height: number,
    graphics: Phaser.GameObjects.Graphics
  ) {
    // Tło
    graphics.clear();
    graphics.fillStyle(0x332211, 0.8);
    graphics
      .fillRoundedRect(
        this.MARGIN - 4,
        y - 4,
        this.BAR_WIDTH + 8,
        height + 8,
        6
      )
      .setDepth(9999);
    // Ramka
    graphics.lineStyle(2, 0xaaaa77, 1);
    graphics
      .strokeRoundedRect(
        this.MARGIN - 4,
        y - 4,
        this.BAR_WIDTH + 8,
        height + 8,
        6
      )
      .setDepth(9999);
  }

  private createHealthUI() {
    this.healthBg = this.scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.healthBar = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(9999);
    this.healthText = this.scene.add
      .text(this.MARGIN + this.BAR_WIDTH + 12, this.HEALTH_Y, "", {
        fontFamily: "serif",
        fontSize: "16px",
        color: "#ffeeaa",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(9999);
  }

  private createStaminaUI() {
    this.staminaBg = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(1000);
    this.staminaBar = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(9999);
    this.staminaText = this.scene.add
      .text(this.MARGIN + this.BAR_WIDTH + 12, this.STAMINA_Y - 9, "", {
        fontFamily: "serif",
        fontSize: "14px",
        color: "#aaffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(9999);
  }

  private createExpUI() {
    this.expBg = this.scene.add.graphics().setScrollFactor(0).setDepth(9998);
    this.expBar = this.scene.add.graphics().setScrollFactor(0).setDepth(9999);
    this.expText = this.scene.add
      .text(this.MARGIN + this.BAR_WIDTH + 12, this.EXP_Y - 8, "", {
        fontFamily: "serif",
        fontSize: "14px",
        color: "#ddaaff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(9999);
  }

  private createLevelUI() {
    this.levelText = this.scene.add
      .text(this.MARGIN, this.LEVEL_Y, "", {
        fontFamily: "serif",
        fontSize: "20px",
        color: "#ffdd88",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(9999)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => (this.scene as GameScene).openPauseMenu("UI"));
  }

  private createMenuButton() {
    const x = this.scene.cameras.main.width - this.MARGIN;
    const y = this.MARGIN;
    this.menuButton = this.scene.add
      .text(x, y, "[ Menu ]", {
        fontFamily: "serif",
        fontSize: "18px",
        color: "#ffffcc",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(9999)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.events.emit("toggleGameMenu"));
  }

  private setupListeners() {
    this.player.sprite.on("healthChanged", () => this.updateHealthUI());
    this.player.sprite.on("staminaChanged", () => this.updateStaminaUI());
    this.player.sprite.on("statsChanged", () => {
      this.updateExpUI();
      this.updateLevelUI();
      this.updateHealthUI();
      this.updateStaminaUI();
    });
    this.player.sprite.on("equipmentChanged", () => {
      this.updateAll();
    });
  }

  public updateAll() {
    this.updateHealthUI();
    this.updateStaminaUI();
    this.updateExpUI();
    this.updateLevelUI();
  }

  private drawGradientBar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    colorStart: number,
    colorEnd: number
  ) {
    const start = Phaser.Display.Color.ValueToColor(colorStart);
    const end = Phaser.Display.Color.ValueToColor(colorEnd);

    for (let i = 0; i < width; i++) {
      const t = i / (width - 1);
      // interpolacja składowych
      const r = Phaser.Math.Interpolation.Linear([start.red, end.red], t);
      const gr = Phaser.Math.Interpolation.Linear([start.green, end.green], t);
      const b = Phaser.Math.Interpolation.Linear([start.blue, end.blue], t);
      const col = Phaser.Display.Color.GetColor(r, gr, b);

      g.fillStyle(col, 1);
      g.fillRect(x + i, y, 1, height);
    }
  }

  private updateHealthUI() {
    this.createFrame(this.HEALTH_Y, 20, this.healthBg);

    const pct = Phaser.Math.Clamp(
      this.player.health / this.player.maxHealth,
      0,
      1
    );
    const w = Math.floor(this.BAR_WIDTH * pct);

    this.healthBar.clear();
    this.drawGradientBar(
      this.healthBar,
      this.MARGIN,
      this.HEALTH_Y,
      w,
      20,
      0xaa0000,
      0xffdd00
    );

    this.healthText.setText(
      `${Math.floor(this.player.health)}/${this.player.maxHealth}`
    );
  }

  private updateStaminaUI() {
    this.createFrame(this.STAMINA_Y, 5, this.staminaBg);

    const pct = Phaser.Math.Clamp(
      this.player.getCurrentStamina() / this.player.getMaxStamina(),
      0,
      1
    );
    const w = Math.floor(this.BAR_WIDTH * pct);

    this.staminaBar.clear();
    this.drawGradientBar(
      this.staminaBar,
      this.MARGIN,
      this.STAMINA_Y,
      w,
      5,
      0x005500,
      0x88ff88
    );

    this.staminaText.setText(
      `${Math.floor(
        this.player.getCurrentStamina()
      )}/${this.player.getMaxStamina()}`
    );
  }

  private updateExpUI() {
    this.createFrame(this.EXP_Y, 4, this.expBg);

    const pct = Phaser.Math.Clamp(
      this.player.experience / this.player.nextLevelExp,
      0,
      1
    );
    const w = Math.floor(this.BAR_WIDTH * pct);

    this.expBar.clear();
    this.drawGradientBar(
      this.expBar,
      this.MARGIN,
      this.EXP_Y,
      w,
      4,
      0x222277,
      0xaaaaff
    );

    this.expText.setText(
      `${this.player.experience}/${this.player.nextLevelExp}`
    );
  }

  private updateLevelUI() {
    this.levelText.setText(`Lvl ${this.player.level}`);
  }

  public hide() {}

  public destroy() {
    [
      this.healthBg,
      this.healthBar,
      this.healthText,
      this.staminaBg,
      this.staminaBar,
      this.staminaText,
      this.expBg,
      this.expBar,
      this.expText,
      this.levelText,
      this.menuButton,
      this.autoSaveIcon,
      this.autoSaveTimer,
    ].forEach((obj) => obj.destroy());
  }
}
