import Phaser from "phaser";
import GameScene from "../../GameScene";
import type { PlayerBase } from "../../player/PlayerBase";
import type { StatKey } from "../../player/PlayerBase";

export default class StatsMenu {
  private scene: GameScene;
  private player: PlayerBase;
  private menuContainer!: Phaser.GameObjects.Container;
  private isVisible = false;
  private plusButtons: Phaser.GameObjects.Text[] = [];

  constructor(scene: GameScene, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    this.createContainer();
    this.hide();
  }

  private createContainer() {
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(20000)
      .setScrollFactor(0);
  }

  private buildMenu(cx: number, cy: number) {
    this.menuContainer.removeAll(true);

    // tło
    const bg = this.scene.add
      .rectangle(cx, cy + 38, 1024, 500, 0x000000, 0.4)
      .setStrokeStyle(5, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const bgImg = this.scene.add
      .tileSprite(cx, cy + 38, 1024, 500, "background1")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setTileScale(2, 2);
    this.menuContainer.add([bgImg, bg]);

    const pointsText = this.scene.add
      .text(
        cx - 450,
        cy - 170,
        `Dostępne punkty: ${this.player.stats.levelPoints}`,
        {
          fontFamily: "KereruBold",
          fontSize: "24px",
          color: "#ffff00",
        }
      )
      .setScrollFactor(0);
    this.menuContainer.add(pointsText);

    // lista statów
    const stats: Array<{ name: string; key: StatKey; getValue: () => string }> =
      [
        {
          name: "Maksymalna wytrzymałość",
          key: "maxStamina",
          getValue: () => this.player.stats.maxStamina.toString(),
        },
        {
          name: "Regeneracja wytrzymałości",
          key: "staminaRegenRate",
          getValue: () => this.player.stats.staminaRegenRate.toFixed(2),
        },
        {
          name: "Szansa na krytyczne trafienie",
          key: "criticalHitBaseChance",
          getValue: () => `${(this.player.stats.critChance * 100).toFixed(1)}%`,
        },
        {
          name: "Mnożnik krytycznego trafienia",
          key: "criticalHitDamageMultiplier",
          getValue: () =>
            `${(this.player.stats.critDamageMultiplier * 100).toFixed(0)}%`,
        },
        {
          name: "Maksymalne zdrowie",
          key: "maxHealth",
          getValue: () => this.player.stats.maxHealth.toString(),
        },
        {
          name: "Regeneracja zdrowia",
          key: "regenRate",
          getValue: () => this.player.stats.regenRate.toFixed(2),
        },
        {
          name: "Obrażenia",
          key: "attackDamage",
          getValue: () => this.player.stats.attackDamage.toString(),
        },
        {
          name: "Szybkość",
          key: "speed",
          getValue: () => this.player.stats.speed.toString(),
        },
      ];

    // render listy statów: po lewej nazwa, po prawej przycisk '+'
    let y = cy - 100;
    stats.forEach((stat) => {
      const statText = this.scene.add
        .text(cx - 450, y, `${stat.name}: ${stat.getValue()}`, {
          fontFamily: "Kereru",
          fontSize: "20px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setScrollFactor(0);

      this.menuContainer.add(statText);

      if (this.player.stats.levelPoints > 0) {
        const plusX = cx - 100;
        const plusButton = this.scene.add
          .text(plusX, y, "+", {
            fontFamily: "Kereru",
            fontSize: "24px",
            color: "#00ff00",
          })
          .setOrigin(0.5)
          .setScrollFactor(0);

        this.menuContainer.add(plusButton);

        plusButton
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            if (this.player.stats.levelPoints <= 0) return;
            if (this.increaseStat(stat.key)) {
              // aktualizacja tekstów
              statText.setText(`${stat.name}: ${stat.getValue()}`);
              pointsText.setText(
                `Dostępne punkty: ${this.player.stats.levelPoints}`
              );

              if (this.player.stats.levelPoints === 0) this.hidePlusButtons();
            }
          });
      }
      y += 34;
    });

    const { centerX, centerY } = this.scene.cameras.main;
    const characterSprite = this.scene.add
      .sprite(centerX + 280, centerY + 120, this.player.getCharacterTexture())
      .setScale(2)
      .setFlipX(true)
      .setScrollFactor(0);

    const levelText = this.scene.add
      .text(centerX + 280, centerY - 20, `Poziom ${this.player.stats.level}`, {
        fontFamily: "KereruBold",
        fontSize: "24px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.menuContainer.add([characterSprite, levelText]);
  }

  private hidePlusButtons() {
    this.plusButtons.forEach((b) => b.setVisible(false));
  }

  public show() {
    if (!this.menuContainer) return;
    if (this.isVisible) return;

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.buildMenu(cx, cy);
    this.menuContainer.setVisible(true);
    this.isVisible = true;
  }

  public hide() {
    if (!this.menuContainer) return;
    this.menuContainer.removeAll(true);
    this.menuContainer.setVisible(false);
    this.isVisible = false;
  }

  private increaseStat(stat: StatKey): boolean {
    if (this.player.stats.levelPoints <= 0) return false;

    switch (stat) {
      case "maxStamina":
        this.player.stats.maxStamina += 10;
        this.player.stats.currentStamina = Math.min(
          this.player.stats.currentStamina,
          this.player.stats.maxStamina
        );
        break;
      case "staminaRegenRate":
        this.player.stats.staminaRegenRate += 0.5;
        break;
      case "criticalHitBaseChance":
        this.player.stats.critChance += 0.01;
        break;
      case "criticalHitDamageMultiplier":
        this.player.stats.critDamageMultiplier += 0.02;
        break;
      case "maxHealth":
        this.player.stats.maxHealth += 10;
        this.player.levelManager.setMaxHealth(this.player.stats.maxHealth);
        break;
      case "regenRate":
        this.player.stats.regenRate += 0.5;
        break;
      case "attackDamage":
        this.player.stats.attackDamage += 2;
        break;
      case "speed":
        this.player.stats.speed += 5;
        break;
      default:
        return false;
    }

    this.player.stats.levelPoints--;
    this.player.sprite.emit("statsChanged");
    return true;
  }

  public destroy() {
    this.scene.togglePause(false);
    this.menuContainer.destroy(true);
  }
}
