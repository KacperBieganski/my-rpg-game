import Phaser from "phaser";
import { NPC } from "./NPC";

export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  health: number = 100;
  private maxHealth: number = 100;
  private scene: Phaser.Scene;
  private attackCooldown = false;
  private attackToggle = false;
  private isAttacking = false;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "warrior_idle");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.7);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    // Pasek zdrowia
    this.healthBarBg = scene.add
      .rectangle(x, y - 50, 50, 6, 0x000000)
      .setOrigin(0.5);
    this.healthBar = scene.add
      .rectangle(x, y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5);

    scene.input.on("pointerdown", this.attack, this);

    this.cursors = scene.input.keyboard!.createCursorKeys();
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

    if (this.cursors.left.isDown) vx -= 1;
    if (this.cursors.right.isDown) vx += 1;
    if (this.cursors.up.isDown) vy -= 1;
    if (this.cursors.down.isDown) vy += 1;

    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx = (vx / length) * PLAYER_SPEED;
      vy = (vy / length) * PLAYER_SPEED;
      this.sprite.anims.play("run", true);
      this.sprite.setFlipX(vx < 0);
    } else {
      this.sprite.anims.play("idle", true);
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

  attack(pointer: Phaser.Input.Pointer) {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    const direction = new Phaser.Math.Vector2(
      pointer.worldX - this.sprite.x,
      pointer.worldY - this.sprite.y
    ).normalize();

    const attackRange = 50;
    const hitBox = new Phaser.Geom.Circle(
      this.sprite.x + direction.x * attackRange,
      this.sprite.y + direction.y * attackRange,
      30
    );

    const npcs = (this.scene as any).npcManager.getNPCs() as NPC[];
    npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(
        npc.sprite.x,
        npc.sprite.y,
        hitBox.x,
        hitBox.y
      );
      if (dist < hitBox.radius) {
        npc.takeDamage(20);
      }
    });

    const anim = this.attackToggle ? "attack1" : "attack2";
    this.attackToggle = !this.attackToggle;
    this.sprite.setVelocity(0);
    this.sprite.setFlipX(pointer.worldX < this.sprite.x);
    this.sprite.anims.play(anim, true);

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(500, () => {
      this.attackCooldown = false;
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.health = Math.max(this.health, 0);
    if (this.health <= 0) {
      this.sprite.setTint(0xff0000);
      this.sprite.setVelocity(0, 0);
    }
  }
}
