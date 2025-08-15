import Phaser from "phaser";
import { type NpcConfig } from "./NpcConfig";
import { BehaviorCoordinator } from "./npcBehaviors/BehaviorCoordinator";
import { NpcHealth } from "./NpcHealth";
import { SoundManager } from "../SoundManager";
import type { PlayerBase } from "../player/PlayerBase";

export abstract class NpcBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  protected terrainLayers!: Phaser.Tilemaps.TilemapLayer[];
  public isDead = false;
  public deathAnimationStarted = false;
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
  public player: PlayerBase;

  public behaviorCoordinator: BehaviorCoordinator;
  public healthSystem: NpcHealth;
  protected abstract getDeathSoundKey(): string;
  public onDeath?: () => void;

  public readonly config: NpcConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    player: PlayerBase,
    config: NpcConfig,
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ) {
    this.scene = scene;
    this.player = player;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setData("sortY", y);
    this.config = config;
    this.terrainLayers = terrainLayers;

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
    } else {
      this.setupMovement();
    }

    this.setupPhysics();
  }

  public setStatic(isStatic: boolean): void {
    this.isStatic = isStatic;

    if (!this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.moves = !isStatic;

    if (isStatic) {
      body.setVelocity(0, 0);
      body.setImmovable(true);
      this.sprite.setDepth(5000);
      this.playIdleAnimation();

      // Usuwanie timerów dla statycznych NPC
      this.changeDirectionTimer?.destroy();
      this.changeDirectionTimer = undefined;
    } else {
      this.setupMovement();
    }
  }

  protected setupMovement() {
    if (this.changeDirectionTimer || this.isStatic) return;

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
    this.sprite.setScale(0.8);
    this.sprite.setDepth(4);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 40);
    body.setOffset(74, 80);

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

    const playerPos = this.player.getPosition();
    if (!playerPos) {
      return;
    }
    const playerX = playerPos.x;
    const playerY = playerPos.y;

    const npcBody = this.sprite.body as Phaser.Physics.Arcade.Body;
    const npcX = npcBody.x + npcBody.halfWidth;
    const npcY = npcBody.y + npcBody.halfHeight;

    // Warstwy NPC i gracza
    const npcLayer = this.getLayerForPosition(npcX, npcY);
    const playerLayer = this.getLayerForPosition(playerX, playerY);

    // Zapobiegaj atakom i zachowaniom NPC gdy są na innych warstwach
    if (npcLayer !== playerLayer) {
      if (this.isAttacking) {
        this.cancelAttack();
      }

      if (!this.isStatic) {
        this.behaviorCoordinator.handleIdleBehavior();
      }

      this.sprite.setData("sortY", this.sprite.y);
      return;
    }

    if (this.isAttacking) {
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY
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

    const npcLayer = this.getLayerForPosition(this.sprite.x, this.sprite.y);
    const playerLayer = this.getLayerForPosition(
      this.player.sprite.x,
      this.player.sprite.y
    );

    if (npcLayer !== playerLayer) {
      if (this.isAttacking) this.cancelAttack();
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y
    );

    if (distanceToPlayer <= this.detectionRange) {
      this.sprite.setFlipX(this.player.sprite.x < this.sprite.x);

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
    this.attackCooldown = false;

    if (this.sprite.anims.currentAnim?.key.includes("attack")) {
      this.sprite.anims.stop();
      this.sprite.setTexture(this.sprite.texture.key, 0);
    }

    this.playIdleAnimation();
  }

  private getLayerForPosition(x: number, y: number): number {
    let topLayer = -1;

    for (let i = this.terrainLayers.length - 1; i >= 0; i--) {
      const layer = this.terrainLayers[i];
      if (layer.visible && layer.getTileAtWorldXY(x, y)) {
        topLayer = i;
        break;
      }
    }

    return topLayer;
  }

  abstract attack(): void;
  public abstract playRunAnimation(): void;
  public abstract playIdleAnimation(): void;

  public startDeathAnimation(): void {
    if (this.deathAnimationStarted) return;
    this.deathAnimationStarted = true;

    this.isDead = true;

    if (this.onDeath) {
      this.onDeath();
    }

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
