import Phaser from "phaser";
import { FloatingTextEffects } from "../FloatingTextEffects";
import { SoundManager } from "../SoundManager";
import type { PlayerBase } from "./PlayerBase";

export class LevelManager {
  private playerRef: PlayerBase;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private floatingTextEffects: FloatingTextEffects;

  constructor(
    playerRef: PlayerBase,
    sprite: Phaser.Physics.Arcade.Sprite,
    floatingTextEffects: FloatingTextEffects
  ) {
    this.playerRef = playerRef;
    this.sprite = sprite;
    this.floatingTextEffects = floatingTextEffects;
  }

  public addExperience(amount: number): void {
    this.playerRef.stats.experience += amount;
    this.checkLevelUp();
    this.sprite.emit("statsChanged");
  }

  private checkLevelUp(): void {
    while (
      this.playerRef.stats.experience >= this.playerRef.stats.nextLevelExp
    ) {
      this.playerRef.stats.experience -= this.playerRef.stats.nextLevelExp;
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.playerRef.stats.level++;
    this.playerRef.stats.nextLevelExp = Math.floor(
      this.playerRef.stats.nextLevelExp * 1.2
    );
    this.playerRef.stats.levelPoints++;

    SoundManager.getInstance().play(this.sprite.scene, "lvlUp", {
      volume: 1,
    });

    this.floatingTextEffects.showLevelUp(this.sprite);
    this.sprite.emit("levelUp");
    this.sprite.emit("statsChanged");
  }

  public getLevel(): number {
    return this.playerRef.stats.level;
  }

  public getExperience(): number {
    return this.playerRef.stats.experience;
  }

  public getNextLevelExp(): number {
    return this.playerRef.stats.nextLevelExp;
  }

  public getMaxHealth(): number {
    return this.playerRef.stats.maxHealth;
  }

  public setMaxHealth(value: number): void {
    this.playerRef.stats.maxHealth = value;
    // Upewnij się, że zdrowie nie przekracza nowego maksimum
    if (this.playerRef.stats.health > this.playerRef.stats.maxHealth) {
      this.playerRef.stats.health = this.playerRef.stats.maxHealth;
    }
    this.sprite.emit("healthChanged");
  }

  public setHealth(value: number): void {
    this.playerRef.stats.health = value;
  }

  public getHealth(): number {
    return this.playerRef.stats.health;
  }
}
