import { PlayerBase } from "./PlayerBase";
import { NpcBase } from "../npc/NpcBase";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";
import { SoundManager } from "../SoundManager";

export class ArcherPlayer extends PlayerBase {
  private arrows: Phaser.Physics.Arcade.Group;
  private lastArrowTime: number = 0;
  private arrowSpeed: number =
    DefaultGameSettings.player.archer.attackRange * 3;
  private maxArrowDistance: number =
    DefaultGameSettings.player.archer.attackRange;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_archer_idle", DefaultGameSettings.player.archer);
    this.arrows = this.scene.physics.add.group();
  }

  private setupArrowCollisions(arrow: Phaser.Physics.Arcade.Sprite) {
    // Ustawiamy zdarzenie kolizji z granicami świata
    arrow.setCollideWorldBounds(true);

    this.scene.physics.world.on(
      "worldbounds",
      (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === arrow) {
          this.handleArrowCollision(arrow);
        }
      }
    );

    // Kolizje z innymi obiektami
    const collisions = (this.scene as any).collisions;
    if (collisions) {
      this.scene.physics.add.collider(arrow, collisions, () => {
        this.handleArrowCollision(arrow);
      });
    }
  }

  private handleArrowCollision(arrow: Phaser.Physics.Arcade.Sprite) {
    // Zatrzymaj strzałę
    arrow.setVelocity(0, 0);
    if (arrow.body) {
      arrow.body.enable = false;
    }

    // Zniszcz strzałę po 2 sekundach
    this.scene.time.delayedCall(2000, () => {
      if (arrow.active) {
        arrow.destroy();
      }
    });
  }

  attack() {
    if (
      this.attackCooldown ||
      this.isAttacking ||
      !this.useStamina(DefaultGameSettings.player.stamina.attackCost)
    )
      return;

    this.isAttacking = true;
    this.attackCooldown = true;

    SoundManager.getInstance().play(this.scene, "bowShoot", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    this.sprite.anims.play("player_archer_shoot", true);

    // Pobierz pozycję kursora myszy w świecie gry
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(
      pointer.x,
      pointer.y
    );

    this.sprite.setFlipX(worldPoint.x < this.sprite.x);

    // Strzel w kierunku kursora
    this.shootAtPosition(worldPoint.x, worldPoint.y);

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(
      DefaultGameSettings.player.archer.attackRate,
      () => {
        this.attackCooldown = false;
      }
    );
  }

  private shootAtPosition(targetX: number, targetY: number) {
    if (this.scene.time.now - this.lastArrowTime < 300) return;

    this.lastArrowTime = this.scene.time.now;
    const arrow = this.arrows.create(
      this.sprite.x,
      this.sprite.y,
      "Arrow"
    ) as Phaser.Physics.Arcade.Sprite;

    arrow.setScale(0.8);
    arrow.setDepth(10);
    if (arrow.body) {
      arrow.body.setSize(10, 3);
    }

    // Oblicz kąt do celu
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY
    );

    arrow.setRotation(angle);

    // Ustaw prędkość strzały
    this.scene.physics.velocityFromRotation(
      angle,
      this.arrowSpeed,
      arrow.body?.velocity
    );

    // Sprawdź kolizje z wrogami
    const npcs = (this.scene as any).npcManager?.getNPCs() as NpcBase[];
    if (npcs) {
      npcs.forEach((npc) => {
        this.scene.physics.add.overlap(
          arrow,
          npc.sprite,
          () => {
            this.handleArrowHit(arrow, npc);
          },
          undefined,
          this
        );
      });
    }

    // Automatyczne zniszczenie strzały po pewnym czasie/dystansie
    this.setupArrowCollisions(arrow);
    this.setupArrowLifetime(arrow);
  }

  private handleArrowHit(arrow: Phaser.Physics.Arcade.Sprite, target: NpcBase) {
    const isCrit = this.checkCriticalHit();
    const baseDmg = DefaultGameSettings.player.archer.attackDamage;
    const damage = baseDmg * this.getCriticalDamageMultiplier();

    SoundManager.getInstance().play(this.scene, "bowHit", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });

    target.takeDamage(damage);
    if (isCrit) {
      this.floatingTextEffects.showCriticalHit(target.sprite);
    }

    arrow.destroy();
  }

  private setupArrowLifetime(arrow: Phaser.Physics.Arcade.Sprite) {
    const startX = arrow.x;
    const startY = arrow.y;

    // Sprawdzaj odległość co klatkę
    const checkDistance = () => {
      if (!arrow.active) return;

      const distance = Phaser.Math.Distance.Between(
        startX,
        startY,
        arrow.x,
        arrow.y
      );

      if (distance >= this.maxArrowDistance) {
        this.handleArrowCollision(arrow);
      } else {
        this.scene.time.delayedCall(50, checkDistance);
      }
    };

    checkDistance();
  }

  protected getCharacterType(): "warrior" | "archer" | "lancer" {
    return "archer";
  }

  protected getIdleAnimation(): string {
    return "player_archer_idle";
  }

  protected getRunAnimation(): string {
    return "player_archer_run";
  }

  protected getBlockSoundKey(): string {
    return "shieldBlock"; // Możesz dodać specjalny dźwięk bloku dla łucznika
  }

  protected getBlockAnimation(): string {
    return "player_archer_idle";
  }
}
