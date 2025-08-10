import Phaser from "phaser";
import { type NpcConfig } from "./NpcConfig";
import { BehaviorCoordinator } from "./npcBehaviors/BehaviorCoordinator";
import { NpcHealth } from "./NpcHealth";
import { SoundManager } from "../SoundManager";

export abstract class NpcBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public isDead = false;
  private deathAnimationStarted = false;
  public health: number;
  public maxHealth: number;
  public scene: Phaser.Scene;
  public speed: number;
  public detectionRange: number;
  public attackRange: number;
  public damage: number;
  public attackRate: number;
  public expGain: number;
  public isStatic: boolean = false;
  public shouldMaintainDistance: boolean = false;
  public distanceFromPlayer: number;
  public isRetreating: boolean = false;
  public currentRetreatAngle: number = 0;

  public changeDirectionTimer?: Phaser.Time.TimerEvent;
  public lastPosition: Phaser.Math.Vector2;
  public stuckTime: number = 0;
  public direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public isFollowing: boolean = false;

  public isAttacking: boolean = false;
  public attackCooldown: boolean = false;
  public player: Phaser.Physics.Arcade.Sprite;

  public behaviorCoordinator: BehaviorCoordinator;
  public healthSystem: NpcHealth;
  protected abstract getDeathSoundKey(): string;

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
    this.shouldMaintainDistance = config.shouldMaintainDistance || false;
    this.distanceFromPlayer = config.distanceFromPlayer;
    this.lastPosition = new Phaser.Math.Vector2(x, y);

    this.behaviorCoordinator = new BehaviorCoordinator(this);
    this.healthSystem = new NpcHealth(this);

    if (this.isStatic) {
      this.playIdleAnimation();
    }

    if (!this.isStatic) {
      this.setupMovement();
    }
    this.setupPhysics();
  }

  public setStatic(isStatic: boolean): void {
    this.isStatic = isStatic;

    if (!this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.sprite.setDepth(10000);
    body.moves = !isStatic;

    if (isStatic) {
      body.setVelocity(0, 0);
      body.setImmovable(true);
      this.playIdleAnimation();
    }
  }

  protected setupMovement() {
    if (this.isStatic) return;

    this.changeDirectionTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: () => {
        this.behaviorCoordinator.idleBehavior.pickRandomDirection();
      },
      callbackScope: this,
      loop: true,
    });
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

  public update() {
    if (this.isDead) {
      this.sprite.setData("sortY", this.sprite.y);
      return;
    }

    this.healthSystem.updateHealthBar();

    if (this.isStatic) {
      this.updateStaticBehavior();
      return;
    }

    if (this.isAttacking) {
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    if (distanceToPlayer <= this.detectionRange) {
      this.behaviorCoordinator.handlePlayerDetection(distanceToPlayer);
    } else {
      this.behaviorCoordinator.handleIdleBehavior();
    }

    this.sprite.setData("sortY", this.sprite.y);
  }

  protected updateStaticBehavior() {
    if (!this.isStatic) return;

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    this.sprite.setDepth(100000);

    if (distanceToPlayer <= this.detectionRange) {
      this.sprite.setFlipX(this.player.x < this.sprite.x);

      if (
        distanceToPlayer <= this.attackRange &&
        !this.isAttacking &&
        !this.attackCooldown
      ) {
        this.attack();
      }
    }
  }

  public takeDamage(amount: number) {
    this.healthSystem.takeDamage(amount);
  }

  protected cancelAttack() {
    this.isAttacking = false;

    if (
      this.sprite.anims.currentAnim &&
      this.sprite.anims.currentAnim.key.includes("attack")
    ) {
      this.sprite.anims.stop();
      this.sprite.setTexture(this.sprite.texture.key, 0);
    }

    this.sprite.anims.play("Red_goblinTNT_idle", true);
  }

  abstract attack(): void;
  public abstract playRunAnimation(): void;
  public abstract playIdleAnimation(): void;

  public startDeathAnimation(): void {
    if (this.deathAnimationStarted) return;
    this.deathAnimationStarted = true;

    this.isDead = true;

    this.healthSystem.destroy();
    this.changeDirectionTimer?.destroy();

    if (this.sprite.body) {
      (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.sprite.body.enable = false;
    }

    SoundManager.getInstance().play(this.scene, this.getDeathSoundKey(), {
      volume: 0.5,
    });

    this.sprite.anims.play("dead_anim1");
    this.sprite.once("animationcomplete-dead_anim1", () => {
      this.sprite.anims.play("dead_anim2");
      this.sprite.once("animationcomplete-dead_anim2", () => {
        this.sprite.destroy();
      });
    });
  }
}
