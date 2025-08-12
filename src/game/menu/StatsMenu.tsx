import Phaser from "phaser";
import GameScene from "../GameScene";
import { GameState } from "../GameState";
import type { PlayerBase } from "../player/PlayerBase";
import type { StatKey } from "../player/PlayerBase";

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
    // trzymamy container w (0,0), kiedy show() budujemy elementy w oparciu o kamerę
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(1000000)
      .setScrollFactor(0);
  }

  private buildMenu(cx: number, cy: number) {
    // wyczyść poprzednie elementy
    this.menuContainer.removeAll(true);

    // tło
    const bg = this.scene.add
      .rectangle(cx, cy, 620, 420, 0x0a0a0a, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xaaaa77)
      .setScrollFactor(0);
    this.menuContainer.add(bg);

    const title = this.scene.add
      .text(cx, cy - 190, "Statystyki", {
        fontFamily: "serif",
        fontSize: "32px",
        color: "#ffeeaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.menuContainer.add(title);

    const pointsText = this.scene.add
      .text(cx - 280, cy - 140, `Dostępne punkty: ${this.player.levelPoints}`, {
        fontFamily: "serif",
        fontSize: "24px",
        color: "#ffff00",
      })
      .setScrollFactor(0);
    this.menuContainer.add(pointsText);

    // lista statów (możesz rozszerzyć)
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
          getValue: () =>
            `${(this.player.stats.criticalHitBaseChance * 100).toFixed(1)}%`,
        },
        {
          name: "Mnożnik krytycznego trafienia",
          key: "criticalHitDamageMultiplier",
          getValue: () =>
            `${(this.player.stats.criticalHitDamageMultiplier * 100).toFixed(
              0
            )}%`,
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
        .text(cx - 280, y, `${stat.name}: ${stat.getValue()}`, {
          fontFamily: "serif",
          fontSize: "20px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setScrollFactor(0);

      this.menuContainer.add(statText);

      if (this.player.levelPoints > 0) {
        const plusX = cx + 240;
        const plusButton = this.scene.add
          .text(plusX, y, "+", {
            fontFamily: "serif",
            fontSize: "24px",
            color: "#00ff00",
          })
          .setOrigin(0.5)
          .setScrollFactor(0);

        this.menuContainer.add(plusButton);

        // ustaw interaktywność PO dodaniu do container (unikanie problemów z hitbox)
        plusButton
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            if (this.player.levelPoints <= 0) return;
            if (this.increaseStat(stat.key)) {
              // aktualizacja tekstów
              statText.setText(`${stat.name}: ${stat.getValue()}`);
              pointsText.setText(`Dostępne punkty: ${this.player.levelPoints}`);

              if (this.player.levelPoints === 0) this.hidePlusButtons();
            }
          });
      }
      y += 34;
    });

    // przycisk Zamknij
    const closeButton = this.scene.add
      .text(cx, cy + 170, "Zamknij", {
        fontFamily: "serif",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.menuContainer.add(closeButton);

    // ustaw interaktywność na close PO dodaniu do container
    closeButton
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
      });
  }

  private hidePlusButtons() {
    this.plusButtons.forEach((b) => b.setVisible(false));
  }

  public show() {
    if (!this.menuContainer) return;
    if (this.isVisible) return;

    // pause i stan sceny — kontrola analogiczna do InGameMenu
    this.scene.togglePause(true);
    this.scene.currentState = GameState.IN_STATS_MENU;

    // użyj wymiarów kamery (tak jak InGameMenu)
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.buildMenu(cx, cy);
    this.menuContainer.setVisible(true);
    this.isVisible = true;
  }

  public hide() {
    if (!this.menuContainer) return;
    // usuwamy elementy ale nie niszczymy containeru (tak jak InGameMenu)
    this.menuContainer.removeAll(true);
    this.menuContainer.setVisible(false);
    this.isVisible = false;

    // przywróć grę
    this.scene.togglePause(false);
    this.scene.currentState = GameState.IN_GAME;
  }

  private increaseStat(stat: StatKey): boolean {
    if (this.player.levelPoints <= 0) return false;

    switch (stat) {
      case "maxStamina":
        this.player.stats.maxStamina += 10;
        this.player.maxStamina = this.player.stats.maxStamina;
        this.player.currentStamina = Math.min(
          this.player.currentStamina,
          this.player.maxStamina
        );
        break;
      case "staminaRegenRate":
        this.player.stats.staminaRegenRate += 0.5;
        break;
      case "criticalHitBaseChance":
        this.player.stats.criticalHitBaseChance += 0.01;
        this.player.critChance = this.player.stats.criticalHitBaseChance;
        break;
      case "criticalHitDamageMultiplier":
        this.player.stats.criticalHitDamageMultiplier += 0.05;
        this.player.critDamageMultiplier =
          this.player.stats.criticalHitDamageMultiplier;
        break;
      case "maxHealth":
        this.player.stats.maxHealth += 10;
        this.player.levelManager.setMaxHealth(this.player.stats.maxHealth);
        break;
      case "regenRate":
        this.player.stats.regenRate += 0.5;
        this.player.regenRate = this.player.stats.regenRate;
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

    this.player.levelPoints--;
    // powiadamiamy UI i inne systemy
    this.player.sprite.emit("statsChanged");
    return true;
  }

  public destroy() {
    this.scene.togglePause(false);
    this.menuContainer.destroy(true);
  }
}
