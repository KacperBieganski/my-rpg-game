import Phaser from "phaser";
import { NPC } from "./NPC";

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  health: number = 100;
  private maxHealth: number = 100;
  private scene: Phaser.Scene;
  private attackCooldown = false;
  private attackToggle = false;
  private isAttacking = false;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;
  private lastDamageTime: number = 0;
  private healthRegenTimer: Phaser.Time.TimerEvent;
  private regenRate: number = 5; // punkty zdrowia na sekundę
  private regenDelay: number = 8000; // 8 sekund opóźnienia

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "Blue_warrior_idle");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.7);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    // Health bar
    this.healthBarBg = scene.add
      .rectangle(x, y - 50, 50, 6, 0x000000)
      .setOrigin(0.5);
    this.healthBar = scene.add
      .rectangle(x, y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5);

    // Input setup
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Timer regeneracji zdrowia
    this.healthRegenTimer = scene.time.addEvent({
      delay: 1000, // sprawdzaj co sekundę
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true,
    });

    // Both mouse click and spacebar will trigger attack
    scene.input.on("pointerdown", this.attack, this);
    this.wasdKeys.SPACE.on("down", this.attack, this);

    this.sprite.on("npcAttack", (damage: number) => {
      this.takeDamage(damage);
    });

    // Reakcja na atak NPC
    this.sprite.on("npcAttack", (damage: number) => {
      this.takeDamage(damage);
    });
  }

  update() {
    if (this.isAttacking) {
      this.sprite.setVelocity(0, 0);
      this.updateHealthBar();
      return;
    }

    const PLAYER_SPEED = 200;
    let vx = 0;
    let vy = 0;

    // Handle both arrow keys and WASD
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;

    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx = (vx / length) * PLAYER_SPEED;
      vy = (vy / length) * PLAYER_SPEED;
      this.sprite.anims.play("player_run", true);
      // Flip sprite based on movement direction
      if (vx !== 0) {
        this.sprite.setFlipX(vx < 0);
      }
    } else {
      this.sprite.anims.play("player_idle", true);
    }

    this.sprite.setVelocity(vx, vy);
    this.updateHealthBar();
  }

  private updateHealthBar() {
    const { x, y } = this.sprite;
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBar.setPosition(x, y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(x, y - 50);
  }

  private findNearestEnemy(): NPC | null {
    const npcs = (this.scene as any).npcManager.getNPCs() as NPC[];
    if (npcs.length === 0) return null;

    let nearestEnemy: NPC | null = null;
    let minDistance = Number.MAX_VALUE;

    npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        npc.sprite.x,
        npc.sprite.y
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestEnemy = npc;
      }
    });

    return nearestEnemy;
  }

  attack() {
    if (this.attackCooldown || this.isAttacking) return;

    const nearestEnemy = this.findNearestEnemy();
    if (!nearestEnemy) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    // Face the nearest enemy
    this.sprite.setFlipX(nearestEnemy.sprite.x < this.sprite.x);

    const attackRange = 80;
    const hitBox = new Phaser.Geom.Circle(
      this.sprite.x,
      this.sprite.y,
      attackRange
    );

    const npcs = (this.scene as any).npcManager.getNPCs() as NPC[];
    npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(
        npc.sprite.x,
        npc.sprite.y,
        this.sprite.x,
        this.sprite.y
      );
      if (dist < hitBox.radius) {
        npc.takeDamage(20);
      }
    });

    const anim = this.attackToggle ? "player_attack1" : "player_attack2";
    this.attackToggle = !this.attackToggle;
    this.sprite.setVelocity(0);
    this.sprite.anims.play(anim, true);

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(500, () => {
      this.attackCooldown = false;
    });
  }

  // metoda do regeneracji zdrowia
  private regenerateHealth() {
    const currentTime = this.scene.time.now;

    // Jeśli minęło 5 sekund od ostatnich obrażeń i zdrowie nie jest pełne
    if (
      currentTime - this.lastDamageTime > this.regenDelay &&
      this.health < this.maxHealth
    ) {
      this.health = Phaser.Math.Clamp(
        this.health + this.regenRate,
        0,
        this.maxHealth
      );

      // Efekt wizualny regeneracji (zielony błysk)
      if (this.health < this.maxHealth) {
        this.sprite.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
          this.sprite.clearTint();
        });
      }
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.lastDamageTime = this.scene.time.now;
    this.health = Math.max(this.health, 0);

    // Efekt wizualny przy otrzymywaniu obrażeń
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.sprite.setTint(0xff0000);
      this.sprite.setVelocity(0, 0);
    }
  }

  destroy() {
    this.healthRegenTimer.destroy();
  }
}
