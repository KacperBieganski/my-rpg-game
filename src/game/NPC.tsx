import Phaser from "phaser";
import { DefaultGameSettings } from "./GameSettings";
import { FloatingTextEffects } from "./FloatingTextEffects";

export class NPC {
  sprite: Phaser.Physics.Arcade.Sprite;
  direction: Phaser.Math.Vector2;
  scene: Phaser.Scene;
  health: number = DefaultGameSettings.npc.health;
  private maxHealth: number = DefaultGameSettings.npc.maxHealth;
  private changeDirectionTimer: Phaser.Time.TimerEvent;
  private lastPosition: Phaser.Math.Vector2;
  private stuckTime: number = 0;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;
  private floatingTextEffects: FloatingTextEffects;

  private isFollowing: boolean = false;
  private attackToggle: boolean = false;
  private swordHitSounds: Phaser.Sound.BaseSound[] = [];
  private isAttacking: boolean = false;
  private attackCooldown: boolean = false;
  private speed: number = DefaultGameSettings.npc.speed;
  private detectionRange: number = DefaultGameSettings.npc.detectionRange;
  private attackRange: number = DefaultGameSettings.npc.attackRange;
  private damage: number = DefaultGameSettings.npc.damage;
  private attackRate: number = DefaultGameSettings.npc.attackRate;
  private player: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite
  ) {
    this.scene = scene;
    this.player = player;
    this.sprite = scene.physics.add.sprite(x, y, "Red_goblin_idle");
    this.sprite.setScale(1);
    this.sprite.setDepth(4);
    this.sprite.setData("sortY", y);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 40);
    body.setOffset(74, 90);

    this.direction = new Phaser.Math.Vector2();
    this.pickRandomDirection();

    this.lastPosition = new Phaser.Math.Vector2(x, y);

    this.changeDirectionTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: this.pickRandomDirection,
      callbackScope: this,
      loop: true,
    });

    this.healthBarBg = scene.add
      .rectangle(x, y - 50, 50, 6, 0x000000)
      .setOrigin(0.5)
      .setDepth(10);
    this.healthBar = scene.add
      .rectangle(x, y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5)
      .setDepth(11);

    this.floatingTextEffects = new FloatingTextEffects(scene);

    this.loadSounds();
  }

  private loadSounds() {
    this.swordHitSounds = [
      this.scene.sound.add("swordHit1"),
      this.scene.sound.add("swordHit2"),
    ];
    this.scene.sound.add("swordSwing1");
    this.scene.sound.add("deathEnemy");
  }

  pickRandomDirection() {
    if (!this.isFollowing && !this.isAttacking) {
      const directions = [
        new Phaser.Math.Vector2(1, 0),
        new Phaser.Math.Vector2(1, 1),
        new Phaser.Math.Vector2(-1, 0),
        new Phaser.Math.Vector2(0, 1),
        new Phaser.Math.Vector2(0, -1),
        new Phaser.Math.Vector2(-1, -1),
        new Phaser.Math.Vector2(0, 0),
      ];
      this.direction = Phaser.Utils.Array.GetRandom(directions);
    }
  }

  update() {
    if (this.isAttacking) {
      this.updateHealthBar();
      return;
    }

    if (!this.player || !this.player.body) {
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

      if (distanceToPlayer <= this.attackRange) {
        this.sprite.setVelocity(0, 0);
        this.attackPlayer();
      } else {
        const direction = new Phaser.Math.Vector2(
          this.player.x - this.sprite.x,
          this.player.y - this.sprite.y
        ).normalize();

        this.direction = direction;
        this.sprite.setVelocity(
          this.direction.x * this.speed,
          this.direction.y * this.speed
        );
        this.sprite.anims.play("Red_goblin_run", true);
        this.sprite.setFlipX(this.direction.x < 0);
      }
    } else {
      this.isFollowing = false;
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
    this.updateHealthBar();
    this.sprite.setData("sortY", this.sprite.y);
  }

  private attackPlayer() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    this.scene.sound.play("swordSwing1", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });

    this.sprite.setFlipX(this.player.x < this.sprite.x);

    this.sprite.anims.play("Red_goblin_right_attack", true);

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

          const randomSwingIndex = Phaser.Math.Between(
            0,
            this.swordHitSounds.length - 1
          );
          this.swordHitSounds[randomSwingIndex].play();
        }
      }
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(this.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  private updateHealthBar() {
    const { x, y } = this.sprite;
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBar.setPosition(x, y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(x, y - 50);
  }

  takeDamage(amount: number, attackerX?: number, attackerY?: number) {
    if (!this.sprite.active) return;

    this.health -= amount;
    this.floatingTextEffects.showDamage(this.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(
      this.sprite,
      DefaultGameSettings.npc.knockbackForce,
      attackerX,
      attackerY
    );

    if (this.health <= 0) {
      console.log(`Granting exp: ${DefaultGameSettings.npc.expGain}`);
      this.scene.events.emit("npcKilled", DefaultGameSettings.npc.expGain);
      this.destroy();
    }
  }

  destroy() {
    this.scene.sound.play("deathEnemy", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });
    if (this.sprite.active) {
      this.sprite.destroy();
    }
    if (this.changeDirectionTimer) {
      this.changeDirectionTimer.destroy();
    }
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    if (this.healthBarBg) {
      this.healthBarBg.destroy();
    }

    this.floatingTextEffects.destroy();
  }
}
