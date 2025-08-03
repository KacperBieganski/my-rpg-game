import Phaser from "phaser";
import { NPC } from "../NPC";
import { DefaultGameSettings } from "../GameSettings";

export abstract class PlayerBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  health: number;
  maxHealth: number;
  protected scene: Phaser.Scene;
  protected attackCooldown = false;
  protected isAttacking = false;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };
  protected lastDamageTime: number = 0;
  protected healthRegenTimer: Phaser.Time.TimerEvent;
  protected regenRate: number;
  protected regenDelay: number;
  public level: number;
  public experience: number;
  public nextLevelExp: number = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    settings: typeof DefaultGameSettings.player.warrior
  ) {
    this.scene = scene;
    this.health = settings.health;
    this.maxHealth = settings.maxHealth;
    this.regenRate = settings.regenRate;
    this.regenDelay = settings.regenDelay;
    this.level = DefaultGameSettings.player.level;
    this.experience = DefaultGameSettings.player.experience;

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.7);
    this.sprite.setDepth(5);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.healthRegenTimer = scene.time.addEvent({
      delay: 1000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true,
    });

    // scene.input.on("pointerdown", this.attack, this);
    this.wasdKeys.SPACE.on("down", this.attack, this);

    this.sprite.on("npcAttack", (damage: number) => {
      this.takeDamage(damage);
    });
  }

  update() {
    if (this.isAttacking) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const PLAYER_SPEED =
      DefaultGameSettings.player[this.getCharacterType()].speed;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;

    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx = (vx / length) * PLAYER_SPEED;
      vy = (vy / length) * PLAYER_SPEED;
      this.sprite.anims.play(this.getRunAnimation(), true);
      if (vx !== 0) {
        this.sprite.setFlipX(vx < 0);
      }
    } else {
      this.sprite.anims.play(this.getIdleAnimation(), true);
    }

    this.sprite.setVelocity(vx, vy);
  }

  protected findNearestEnemy(): NPC | null {
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

  protected regenerateHealth() {
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

      if (this.health < this.maxHealth) {
        this.health = Math.min(this.health + this.regenRate, this.maxHealth);
        this.sprite.emit("healthChanged");
        this.sprite.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
          this.sprite.clearTint();
        });
      }
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.sprite.emit("healthChanged");
    this.lastDamageTime = this.scene.time.now;
    this.health = Math.max(this.health, 0);

    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.sprite.setTint(0xff0000);
      this.sprite.setVelocity(0, 0);
    }
  }

  public addExperience(amount: number) {
    this.experience += amount;
    this.checkLevelUp();
    this.sprite.emit("statsChanged");
  }

  private checkLevelUp() {
    while (this.experience >= this.nextLevelExp) {
      this.experience -= this.nextLevelExp;
      this.levelUp();
    }
  }

  private levelUp() {
    this.level++;
    this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2); // Zwiększ próg o 20%

    // Ulepsz statystyki gracza
    this.maxHealth = Math.floor(this.maxHealth * 1.1);
    this.health = this.maxHealth;

    this.sprite.emit("levelUp");
    this.sprite.emit("statsChanged");
  }

  destroy() {
    this.healthRegenTimer.destroy();
  }

  abstract attack(): void;
  protected abstract getCharacterType(): "warrior" | "archer" | "lancer";
  protected abstract getIdleAnimation(): string;
  protected abstract getRunAnimation(): string;
}
