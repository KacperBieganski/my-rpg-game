import Phaser from "phaser";
import { FloatingTextEffects } from "../FloatingTextEffects";
import { SoundManager } from "../SoundManager";
import type { PlayerBase } from "./PlayerBase";

export class LevelManager {
  private playerRef: PlayerBase;
  public level: number;
  public experience: number;
  public nextLevelExp: number;
  public maxHealth: number;
  public health: number;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public floatingTextEffects: FloatingTextEffects;

  constructor(
    playerRef: PlayerBase,
    initialLevel: number,
    initialExp: number,
    initialMaxHealth: number,
    initialHealth: number,
    sprite: Phaser.Physics.Arcade.Sprite,
    floatingTextEffects: FloatingTextEffects
  ) {
    this.playerRef = playerRef;
    this.level = initialLevel;
    this.experience = initialExp;
    this.nextLevelExp = 100;
    this.maxHealth = initialMaxHealth;
    this.health = initialHealth;
    this.sprite = sprite;
    this.floatingTextEffects = floatingTextEffects;
  }

  public addExperience(amount: number): void {
    this.experience += amount;
    this.checkLevelUp();
    this.sprite.emit("statsChanged");
  }

  private checkLevelUp(): void {
    while (this.experience >= this.nextLevelExp) {
      this.experience -= this.nextLevelExp;
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.level++;
    this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2);

    this.playerRef.levelPoints++;

    SoundManager.getInstance().play(this.sprite.scene, "lvlUp", {
      volume: 1,
    });

    this.floatingTextEffects.showLevelUp(this.sprite);
    this.sprite.emit("levelUp");
    this.sprite.emit("statsChanged");
  }

  public setMaxHealth(value: number) {
    this.maxHealth = value;
    // Upewnij się, że zdrowie nie przekracza nowego maksimum
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
    this.sprite.emit("healthChanged");
  }

  public getLevel(): number {
    return this.level;
  }

  public getExperience(): number {
    return this.experience;
  }

  public getNextLevelExp(): number {
    return this.nextLevelExp;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public setHealth(value: number): void {
    this.health = value;
  }

  public getHealth(): number {
    return this.health;
  }
}
