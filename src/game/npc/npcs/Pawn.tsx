import type { PlayerBase } from "../../player/PlayerBase";
import { NpcBase } from "../NpcBase";
import { type NpcConfig } from "../NpcConfig";
import Phaser from "phaser";

export class Pawn extends NpcBase {
  private isPanicking: boolean = false;
  private panicTarget: Phaser.Physics.Arcade.Sprite | null = null;
  private panicTimer: Phaser.Time.TimerEvent | null = null;
  private damagePanicTimer: Phaser.Time.TimerEvent | null = null;
  private isDamagePanic: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: PlayerBase,
    config: NpcConfig,
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ) {
    super(scene, x, y, "Red_Pawn_Idle", player, config, terrainLayers);
    this.sprite.setScale(1);
    this.detectionRange = config.detectionRange;
  }

  public attack() {
    // Pawn nie atakuje
  }

  public playRunAnimation(): void {
    if (!this.isPanicking && !this.isDamagePanic) {
      this.sprite.anims.play("Red_Pawn_Run", true);
    }
  }

  public playIdleAnimation(): void {
    if (!this.isPanicking && !this.isDamagePanic) {
      this.sprite.anims.play("Red_Pawn_Idle", true);
    }
  }

  protected getDeathSoundKey(): string {
    return "deathGoblin1";
  }

  public takeDamage(amount: number) {
    super.takeDamage(amount);

    // Uruchom ucieczkę po otrzymaniu obrażeń
    if (!this.isDead && !this.isDamagePanic) {
      this.startDamagePanic();
    }
  }

  public update() {
    if (this.isDead) {
      this.sprite.setData("sortY", this.sprite.y);
      return;
    }

    this.healthSystem.updateHealthBar();

    // Sprawdzanie obecności wrogich NPC w pobliżu
    this.checkForEnemies();

    if (this.isPanicking && this.panicTarget) {
      this.handleEnemyPanic();
    } else if (this.isDamagePanic) {
      this.handleDamagePanic();
    } else if (!this.isStatic) {
      // Normalne zachowanie - tylko idle
      this.behaviorCoordinator.handleIdleBehavior();
    }

    this.sprite.setData("sortY", this.sprite.y);
  }

  private startDamagePanic() {
    this.isDamagePanic = true;
    this.playPanicAnimation();

    // Wybierz losowy kierunek ucieczki
    const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.direction.setTo(Math.cos(randomAngle), Math.sin(randomAngle));

    // Ustaw timer na 5 sekund ucieczki
    if (this.damagePanicTimer) {
      this.damagePanicTimer.destroy();
    }

    this.damagePanicTimer = this.scene.time.addEvent({
      delay: 5000, // 5 sekund
      callback: this.stopDamagePanic,
      callbackScope: this,
    });
  }

  private handleDamagePanic() {
    // Uciekaj w losowym kierunku
    this.sprite.setVelocity(
      this.direction.x * this.speed * 1.3,
      this.direction.y * this.speed * 1.3
    );

    this.sprite.setFlipX(this.direction.x < 0);
    this.playPanicAnimation();
  }

  private stopDamagePanic() {
    this.isDamagePanic = false;

    if (this.damagePanicTimer) {
      this.damagePanicTimer.destroy();
      this.damagePanicTimer = null;
    }

    this.sprite.setVelocity(0, 0);
    this.playIdleAnimation();
  }

  private checkForEnemies() {
    if (this.isPanicking || this.isDamagePanic) return;

    const bodies = this.scene.physics.overlapCirc(
      this.sprite.x,
      this.sprite.y,
      this.detectionRange,
      true,
      false
    ) as Phaser.Physics.Arcade.Body[];

    for (const body of bodies) {
      const gameObject = body.gameObject;

      if (
        gameObject instanceof Phaser.Physics.Arcade.Sprite &&
        gameObject !== this.sprite &&
        gameObject.getData("isEnemy") === true
      ) {
        this.startPanic(gameObject);
        break;
      }
    }
  }

  private startPanic(target: Phaser.Physics.Arcade.Sprite) {
    this.isPanicking = true;
    this.panicTarget = target;
    this.playPanicAnimation();

    if (this.panicTimer) {
      this.panicTimer.destroy();
    }

    this.panicTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.checkPanicCondition,
      callbackScope: this,
      loop: true,
    });
  }

  private playPanicAnimation() {
    if (!this.isStatic) this.sprite.anims.play("Red_Pawn_Panic2", true);
    else this.sprite.anims.play("Red_Pawn_Panic1", true);
  }

  private handleEnemyPanic() {
    if (!this.panicTarget || !this.panicTarget.body) {
      this.stopPanic();
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      this.panicTarget.x,
      this.panicTarget.y,
      this.sprite.x,
      this.sprite.y
    );

    this.sprite.setVelocity(
      Math.cos(angle) * this.speed * 1.5,
      Math.sin(angle) * this.speed * 1.5
    );

    this.sprite.setFlipX(this.panicTarget.x < this.sprite.x);
  }

  private checkPanicCondition() {
    if (!this.panicTarget || !this.panicTarget.body) {
      this.stopPanic();
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.panicTarget.x,
      this.panicTarget.y
    );

    if (distance > this.detectionRange * 1.5) {
      this.stopPanic();
    }
  }

  private stopPanic() {
    this.isPanicking = false;
    this.panicTarget = null;

    if (this.panicTimer) {
      this.panicTimer.destroy();
      this.panicTimer = null;
    }

    this.sprite.setVelocity(0, 0);
    this.playIdleAnimation();
  }

  public destroy() {
    this.damagePanicTimer?.destroy();
  }
}
