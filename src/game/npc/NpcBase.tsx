import Phaser from "phaser";
import { FloatingTextEffects } from "../FloatingTextEffects";

export interface NpcConfig {
  health: number;
  maxHealth: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  damage: number;
  attackRate: number;
  expGain: number;
  knockbackForce: number;
}

export abstract class NpcBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number;
  protected maxHealth: number;
  protected scene: Phaser.Scene;
  protected speed: number;
  protected detectionRange: number;
  protected attackRange: number;
  protected damage: number;
  protected attackRate: number;
  protected expGain: number;
  protected knockbackForce: number;
  protected isStatic: boolean = false;

  protected healthBarBg!: Phaser.GameObjects.Rectangle;
  protected healthBar!: Phaser.GameObjects.Rectangle;
  protected floatingTextEffects: FloatingTextEffects;

  protected isAttacking: boolean = false;
  protected attackCooldown: boolean = false;
  protected player: Phaser.Physics.Arcade.Sprite;

  public readonly config: NpcConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig
  ) {
    this.scene = scene;
    this.player = player;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setData("sortY", y);
    this.config = config;

    this.health = config.health;
    this.maxHealth = config.maxHealth;
    this.speed = config.speed;
    this.detectionRange = config.detectionRange;
    this.attackRange = config.attackRange;
    this.damage = config.damage;
    this.attackRate = config.attackRate;
    this.expGain = config.expGain;
    this.knockbackForce = config.knockbackForce;

    this.setupPhysics();
    this.setupHealthBar();
    this.floatingTextEffects = new FloatingTextEffects(scene);
  }

  public setStatic(isStatic: boolean): void {
    this.isStatic = isStatic;

    if (!this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.moves = !isStatic;

    if (isStatic) {
      body.setVelocity(0, 0);
      body.setImmovable(true);
    }
  }

  protected updateStaticBehavior() {
    if (!this.isStatic) return;

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    // Obracanie się w kierunku gracza
    if (distanceToPlayer <= this.detectionRange) {
      this.sprite.setFlipX(this.player.x < this.sprite.x);

      // Atakowanie gdy gracz jest w zasięgu i nie ma cooldownu
      if (
        distanceToPlayer <= this.attackRange &&
        !this.isAttacking &&
        !this.attackCooldown
      ) {
        this.attack();
      }
    }
  }

  protected setupPhysics() {
    this.sprite.setScale(1);
    this.sprite.setDepth(4);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 40);
    body.setOffset(74, 90);

    if (this.isStatic) {
      body.moves = false;
    }
  }

  protected setupHealthBar() {
    this.healthBarBg = this.scene.add
      .rectangle(this.sprite.x, this.sprite.y - 50, 50, 6, 0x000000)
      .setOrigin(0.5)
      .setDepth(10);
    this.healthBar = this.scene.add
      .rectangle(this.sprite.x, this.sprite.y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5)
      .setDepth(11);
  }

  protected updateHealthBar() {
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBar.setPosition(this.sprite.x, this.sprite.y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 50);
  }

  public takeDamage(amount: number, attackerX?: number, attackerY?: number) {
    if (!this.sprite.active) return;

    this.health -= amount;
    this.floatingTextEffects.showDamage(this.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(
      this.sprite,
      this.knockbackForce,
      attackerX,
      attackerY
    );

    if (this.health <= 0) {
      this.scene.events.emit("npcKilled", this.expGain);
      this.destroy();
    }
  }

  public destroy() {
    this.sprite.destroy();
    this.healthBar?.destroy();
    this.healthBarBg?.destroy();
    this.floatingTextEffects.destroy();
  }

  abstract update(): void;
  protected abstract attack(): void;
}
