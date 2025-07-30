import Phaser from "phaser";
import { NPC } from "./NPC";
import { DefaultGameSettings } from "./GameSettings";

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  health: number;
  private maxHealth: number;
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
  private regenRate: number;
  private regenDelay: number;
  private characterClass: "warrior" | "archer";
  private arrows?: Phaser.Physics.Arcade.Group;
  private lastArrowTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterClass: "warrior" | "archer" = "warrior"
  ) {
    this.scene = scene;
    this.characterClass = characterClass;
    const spawnX = DefaultGameSettings.player.position.x;
    const spawnY = DefaultGameSettings.player.position.y;

    // Initialize based on class
    const classSettings = DefaultGameSettings.player[this.characterClass];
    this.health = classSettings.health;
    this.maxHealth = classSettings.maxHealth;
    this.regenRate = classSettings.regenRate;
    this.regenDelay = classSettings.regenDelay;

    const textureKey =
      this.characterClass === "warrior"
        ? "Blue_warrior_idle"
        : "player_archer_idle";
    this.sprite = scene.physics.add.sprite(spawnX, spawnY, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.7);
    this.sprite.setDepth(5);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    // Create arrow group for archer
    this.arrows = this.scene.physics.add.group();
    if (this.characterClass !== "archer") {
      this.arrows.clear(true, true); // Clear and destroy all children
    }

    // Health bar
    this.healthBarBg = scene.add
      .rectangle(x, y - 50, 50, 6, 0x000000)
      .setOrigin(0.5)
      .setDepth(10);
    this.healthBar = scene.add
      .rectangle(x, y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5)
      .setDepth(11);

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

    const PLAYER_SPEED = DefaultGameSettings.player[this.characterClass].speed;
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
      this.sprite.anims.play(
        this.characterClass === "warrior"
          ? "player_warrior_run"
          : "player_archer_run",
        true
      );
      if (vx !== 0) {
        this.sprite.setFlipX(vx < 0);
      }
    } else {
      this.sprite.anims.play(
        this.characterClass === "warrior"
          ? "player_warrior_idle"
          : "player_archer_idle",
        true
      );
    }

    this.sprite.setVelocity(vx, vy);
    this.updateHealthBar();
  }

  private shootArrow(target: NPC) {
    if (!this.arrows || this.scene.time.now - this.lastArrowTime < 300) return;

    this.lastArrowTime = this.scene.time.now;
    const arrow = this.arrows.create(
      this.sprite.x,
      this.sprite.y,
      "arrow"
    ) as Phaser.Physics.Arcade.Sprite;
    arrow.setScale(0.5);
    arrow.setRotation(
      Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        target.sprite.x,
        target.sprite.y
      )
    );

    this.scene.physics.moveTo(
      arrow,
      target.sprite.x,
      target.sprite.y,
      DefaultGameSettings.player.archer.attackRange * 2
    );

    // Collision detection
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

    // Destroy arrow if it goes out of bounds
    this.scene.time.delayedCall(1000, () => {
      if (arrow.active) {
        arrow.destroy();
      }
    });
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

    const classSettings = DefaultGameSettings.player[this.characterClass];
    const dist = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      nearestEnemy.sprite.x,
      nearestEnemy.sprite.y
    );

    if (dist > classSettings.attackRange) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    // Face the nearest enemy
    this.sprite.setFlipX(nearestEnemy.sprite.x < this.sprite.x);

    if (this.characterClass === "warrior") {
      const hitBox = new Phaser.Geom.Circle(
        this.sprite.x,
        this.sprite.y,
        classSettings.attackRange
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
          npc.takeDamage(
            classSettings.attackDamage,
            this.sprite.x,
            this.sprite.y
          );
        }
      });

      const anim = this.attackToggle
        ? "player_warrior_attack1"
        : "player_warrior_attack2";
      this.attackToggle = !this.attackToggle;
      this.sprite.setVelocity(0);
      this.sprite.anims.play(anim, true);
    } else {
      // Archer attack
      this.sprite.setVelocity(0);
      this.sprite.anims.play("player_archer_shoot", true);
      this.shootArrow(nearestEnemy);
    }

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(classSettings.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  // metoda do regeneracji zdrowia
  private regenerateHealth() {
    const currentTime = this.scene.time.now;
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
