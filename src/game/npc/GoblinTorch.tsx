import { type NpcConfig, NpcBase } from "./NpcBase";
import Phaser from "phaser";

export class GoblinTorch extends NpcBase {
  private changeDirectionTimer!: Phaser.Time.TimerEvent;
  private lastPosition: Phaser.Math.Vector2;
  private stuckTime: number = 0;
  private isFollowing: boolean = false;
  private swordHitSounds: Phaser.Sound.BaseSound[] = [];
  private direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig,
    type: string = "Walkable"
  ) {
    super(scene, x, y, "Red_goblin_idle", player, config);

    this.isStatic = type === "Static";
    this.lastPosition = new Phaser.Math.Vector2(x, y);

    if (!this.isStatic) {
      this.setupMovement();
    }

    this.loadSounds();
  }

  private setupMovement() {
    if (this.isStatic) return;
    this.changeDirectionTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: this.pickRandomDirection,
      callbackScope: this,
      loop: true,
    });
  }

  private loadSounds() {
    this.swordHitSounds = [
      this.scene.sound.add("swordHit1"),
      this.scene.sound.add("swordHit2"),
    ];
    this.scene.sound.add("swordSwing1");
    this.scene.sound.add("deathEnemy");
  }

  private pickRandomDirection() {
    if (!this.isFollowing && !this.isAttacking) {
      const possibleDirections = [
        new Phaser.Math.Vector2(1, 0),
        new Phaser.Math.Vector2(1, 1),
        new Phaser.Math.Vector2(-1, 0),
        new Phaser.Math.Vector2(0, 1),
        new Phaser.Math.Vector2(0, -1),
        new Phaser.Math.Vector2(-1, -1),
        new Phaser.Math.Vector2(0, 0),
      ];
      this.direction = Phaser.Utils.Array.GetRandom(possibleDirections);
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.play("Red_goblin_idle", true);
    }
  }

  update() {
    this.updateHealthBar();

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
      this.isFollowing = true;
      this.handlePlayerDetection(distanceToPlayer);
    } else {
      this.isFollowing = false;
      this.handleRandomMovement();
    }

    this.checkIfStuck();
    this.sprite.setData("sortY", this.sprite.y);
  }

  protected attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    this.scene.sound.play("swordSwing1", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });

    // Oblicz kierunek względem gracza
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );
    const angleDeg = Phaser.Math.RadToDeg(angle);

    // Wybierz animację w zależności od kierunku
    let attackAnim: string;
    if (angleDeg >= -45 && angleDeg < 45) {
      attackAnim = "Red_goblin_right_attack";
      this.sprite.setFlipX(false);
    } else if (angleDeg >= 45 && angleDeg < 135) {
      attackAnim = "Red_goblin_down_attack";
    } else if (angleDeg >= -135 && angleDeg < -45) {
      attackAnim = "Red_goblin_up_attack";
    } else {
      attackAnim = "Red_goblin_right_attack";
      this.sprite.setFlipX(true);
    }

    // Odtwórz odpowiednią animację
    this.sprite.anims.play(attackAnim, true);

    this.scene.time.delayedCall(300, () => {
      if (this.sprite.active) {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          this.player.x,
          this.player.y
        );

        if (distance <= this.attackRange) {
          this.player.emit("npcAttack", this.damage, this.sprite);
          this.swordHitSounds[
            Phaser.Math.Between(0, this.swordHitSounds.length - 1)
          ].play();
        }
      }
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
      this.sprite.anims.play("Red_goblin_idle", true);
    });

    this.scene.time.delayedCall(this.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  private handlePlayerDetection(distanceToPlayer: number) {
    if (distanceToPlayer <= this.attackRange) {
      this.sprite.setVelocity(0, 0);
      this.attack();
    } else {
      const direction = new Phaser.Math.Vector2(
        this.player.x - this.sprite.x,
        this.player.y - this.sprite.y
      ).normalize();

      this.sprite.setVelocity(
        direction.x * this.speed,
        direction.y * this.speed
      );
      this.sprite.anims.play("Red_goblin_run", true);
      this.sprite.setFlipX(direction.x < 0);
    }
  }

  private handleRandomMovement() {
    this.sprite.setVelocity(
      (this.direction.x * this.speed) / 2,
      (this.direction.y * this.speed) / 2
    );

    if (this.direction.length() > 0) {
      this.sprite.anims.play("Red_goblin_run", true);
      this.sprite.setFlipX(this.direction.x < 0);
    } else {
      this.sprite.anims.play("Red_goblin_idle", true);
    }
  }

  private checkIfStuck() {
    const currentPosition = new Phaser.Math.Vector2(
      this.sprite.x,
      this.sprite.y
    );
    const distance = Phaser.Math.Distance.BetweenPoints(
      currentPosition,
      this.lastPosition
    );

    if (this.direction.length() > 0 && !this.isFollowing) {
      if (distance < 1) {
        this.stuckTime += this.scene.game.loop.delta;
        if (this.stuckTime > 200) {
          this.pickRandomDirection();
          this.stuckTime = 0;
        }
      } else {
        this.stuckTime = 0;
      }
    }

    this.lastPosition.copy(currentPosition);
  }

  public destroy() {
    super.destroy();
    this.scene.sound.play("deathEnemy", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });
    this.changeDirectionTimer?.destroy();
  }
}
