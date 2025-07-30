import { PlayerBase } from "./PlayerBase";
import { NPC } from "../NPC";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";

export class ArcherPlayer extends PlayerBase {
  private arrows: Phaser.Physics.Arcade.Group;
  private lastArrowTime: number = 0;
  private arrowSpeed: number =
    DefaultGameSettings.player.archer.attackRange * 3;
  private looseArrowRange: number = 200;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_archer_idle", DefaultGameSettings.player.archer);
    this.arrows = this.scene.physics.add.group();
  }

  private setupArrowCollisions(arrow: Phaser.Physics.Arcade.Sprite) {
    const worldBounds = this.scene.add.rectangle(
      0,
      0,
      this.scene.physics.world.bounds.width,
      this.scene.physics.world.bounds.height
    );
    this.scene.physics.add.existing(worldBounds);

    this.scene.physics.add.collider(arrow, worldBounds, () => {
      this.handleArrowCollision(arrow);
      worldBounds.destroy();
    });

    const elevatedLayer = (this.scene as any).elevated1;
    if (elevatedLayer) {
      this.scene.physics.add.collider(arrow, elevatedLayer, () => {
        this.handleArrowCollision(arrow);
      });
    }

    const blockedLayer = (this.scene as any).blocked;
    if (blockedLayer) {
      this.scene.physics.add.collider(arrow, blockedLayer, () => {
        this.handleArrowCollision(arrow);
      });
    }
  }

  private handleArrowCollision(arrow: Phaser.Physics.Arcade.Sprite) {
    arrow.setVelocity(0, 0);
    if (arrow.body) {
      arrow.body.enable = false;
    }

    this.scene.time.delayedCall(1000, () => {
      if (arrow.active) {
        arrow.destroy();
      }
    });
  }

  attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    const nearestEnemy = this.findNearestEnemy();
    const classSettings = DefaultGameSettings.player.archer;

    this.sprite.setVelocity(0);
    this.sprite.anims.play("player_archer_shoot", true);

    if (nearestEnemy) {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        nearestEnemy.sprite.x,
        nearestEnemy.sprite.y
      );

      if (dist <= classSettings.attackRange) {
        this.sprite.setFlipX(nearestEnemy.sprite.x < this.sprite.x);
        this.shootAtTarget(nearestEnemy);
      } else {
        this.shootLooseArrow(this.sprite.flipX ? -1 : 1);
      }
    } else {
      this.shootLooseArrow(this.sprite.flipX ? -1 : 1);
    }

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(classSettings.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  private shootLooseArrow(direction: number) {
    if (this.scene.time.now - this.lastArrowTime < 300) return;

    this.lastArrowTime = this.scene.time.now;
    const arrow = this.arrows.create(
      this.sprite.x,
      this.sprite.y,
      "arrow"
    ) as Phaser.Physics.Arcade.Sprite;

    arrow.setScale(0.8);
    arrow.setDepth(10);
    if (arrow.body) {
      arrow.body.setSize(10, 3);
    }

    const angle = direction > 0 ? 0 : Math.PI;
    arrow.setRotation(angle);

    // Ustawiamy prędkość w obu osiach, aby uniknąć problemów z kolizjami
    const speedX = this.arrowSpeed * direction;
    const speedY = 0;
    arrow.setVelocity(speedX, speedY);

    // Dodajemy małą grawitację, aby strzały nie utykały
    arrow.setGravityY(20);

    this.setupArrowCollisions(arrow);

    // Śledzenie odległości zamiast czasu
    let distanceTraveled = 0;
    const updateDistance = () => {
      if (!arrow.active) return;

      const prevX = arrow.x;
      const prevY = arrow.y;

      this.scene.time.delayedCall(50, () => {
        if (!arrow.active) return;

        distanceTraveled += Phaser.Math.Distance.Between(
          prevX,
          prevY,
          arrow.x,
          arrow.y
        );

        if (distanceTraveled >= this.looseArrowRange) {
          this.handleArrowCollision(arrow);
        } else {
          updateDistance();
        }
      });
    };

    updateDistance();
  }

  private shootAtTarget(target: NPC) {
    if (this.scene.time.now - this.lastArrowTime < 300) return;

    this.lastArrowTime = this.scene.time.now;
    const arrow = this.arrows.create(
      this.sprite.x,
      this.sprite.y,
      "arrow"
    ) as Phaser.Physics.Arcade.Sprite;

    arrow.setScale(0.8);
    arrow.setDepth(10);
    if (arrow.body) {
      arrow.body.setSize(10, 3);
    }

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      target.sprite.x,
      target.sprite.y
    );

    arrow.setRotation(angle);

    if (arrow.body) {
      this.scene.physics.velocityFromRotation(
        angle,
        this.arrowSpeed,
        arrow.body.velocity
      );
    }

    this.scene.physics.add.overlap(
      arrow,
      target.sprite,
      () => {
        target.takeDamage(
          DefaultGameSettings.player.archer.attackDamage,
          this.sprite.x,
          this.sprite.y
        );
        arrow.destroy();
      },
      undefined,
      this
    );

    this.setupArrowCollisions(arrow);
  }

  protected getCharacterType(): "warrior" | "archer" {
    return "archer";
  }

  protected getIdleAnimation(): string {
    return "player_archer_idle";
  }

  protected getRunAnimation(): string {
    return "player_archer_run";
  }
}
