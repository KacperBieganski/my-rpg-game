import Phaser from "phaser";
import { NpcBase } from "../npc/NpcBase";
import { DefaultGameSettings } from "../GameSettings";
import { FloatingTextEffects } from "../FloatingTextEffects";
import { SoundManager } from "../SoundManager";
import { LevelManager } from "./LevelManager";

export type StatKey =
  | "maxStamina"
  | "staminaRegenRate"
  | "criticalHitBaseChance"
  | "criticalHitDamageMultiplier"
  | "maxHealth"
  | "regenRate"
  | "attackDamage"
  | "speed";

export abstract class PlayerBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
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
  protected isBlocking = false;
  protected blockKey: Phaser.Input.Keyboard.Key;
  protected blockCooldown = false;
  protected abstract getBlockSoundKey(): string;
  protected floatingTextEffects: FloatingTextEffects;
  protected lastDamageTime: number = 0;
  protected healthRegenTimer: Phaser.Time.TimerEvent;
  public regenRate: number;
  protected regenDelay: number;

  private lastStaminaUseTime: number = 0;
  private staminaRegenTimer: Phaser.Time.TimerEvent;
  private isStaminaDepleted: boolean = false;
  private lastCriticalHit: boolean = false;
  public currentStamina: number;
  public maxStamina: number;
  public critChance: number;
  public critDamageMultiplier: number;

  private runningSound: Phaser.Sound.BaseSound;
  private isMoving: boolean = false;
  private soundFadeDuration: number = 200;

  public levelManager: LevelManager;
  public characterClass!: "warrior" | "archer" | "lancer";
  public levelPoints: number;
  public stats = {
    maxStamina: DefaultGameSettings.player.stamina.maxStamina,
    staminaRegenRate: DefaultGameSettings.player.stamina.staminaRegenRate,
    criticalHitBaseChance: DefaultGameSettings.player.criticalHit.baseChance,
    criticalHitDamageMultiplier:
      DefaultGameSettings.player.criticalHit.damageMultiplier,
    maxHealth: DefaultGameSettings.player.warrior.maxHealth,
    regenRate: DefaultGameSettings.player.warrior.regenRate,
    attackDamage: DefaultGameSettings.player.warrior.attackDamage,
    speed: DefaultGameSettings.player.warrior.speed,
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    characterClass: "warrior" | "archer" | "lancer",
    settings: typeof DefaultGameSettings.player.warrior
  ) {
    this.scene = scene;
    this.characterClass = characterClass;

    this.maxStamina = DefaultGameSettings.player.stamina.maxStamina;
    this.currentStamina = this.maxStamina;
    this.critChance = DefaultGameSettings.player.criticalHit.baseChance;
    this.critDamageMultiplier =
      DefaultGameSettings.player.criticalHit.damageMultiplier;
    this.regenRate = settings.regenRate;
    this.regenDelay = settings.regenDelay;
    this.currentStamina = DefaultGameSettings.player.stamina.maxStamina;
    this.levelPoints = DefaultGameSettings.player.levelPoints;

    this.stats.maxHealth = settings.maxHealth;
    this.stats.regenRate = settings.regenRate;
    this.stats.attackDamage = settings.attackDamage;
    this.stats.speed = settings.speed;

    this.floatingTextEffects = new FloatingTextEffects(scene);

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.9);
    this.sprite.setDepth(5);
    this.sprite.setData("player", this);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 20);
    body.setOffset(74, 110);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.levelManager = new LevelManager(
      this,
      DefaultGameSettings.player.level,
      DefaultGameSettings.player.experience,
      settings.maxHealth,
      settings.health,
      this.sprite,
      this.floatingTextEffects
    );

    this.healthRegenTimer = scene.time.addEvent({
      delay: 1000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true,
    });

    this.staminaRegenTimer = scene.time.addEvent({
      delay: 100,
      callback: this.regenerateStamina,
      callbackScope: this,
      loop: true,
    });

    this.wasdKeys.SPACE.on("down", this.attack, this);

    this.sprite.on(
      "npcAttack",
      (damage: number, attacker?: Phaser.Physics.Arcade.Sprite) => {
        this.takeDamage(damage, attacker);
      }
    );

    this.blockKey = this.scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.Q
    );

    this.runningSound = SoundManager.getInstance().play(scene, "runningGrass", {
      loop: true,
      volume: 0,
      rate: 1.0,
    });
    this.runningSound.pause();
  }

  update() {
    const PLAYER_SPEED =
      DefaultGameSettings.player[this.getCharacterType()].speed;
    let vx = 0;
    let vy = 0;

    if (!this.isBlocking) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;
    }

    const length = Math.hypot(vx, vy);

    if (this.isBlocking) {
      this.sprite.anims.play(this.getBlockAnimation(), true);
      this.sprite.setVelocity(0, 0);
    } else if (this.isAttacking) {
      if (length > 0) {
        vx = (vx / length) * PLAYER_SPEED;
        vy = (vy / length) * PLAYER_SPEED;
        if (vx !== 0) {
          this.sprite.setFlipX(vx < 0);
        }
      }
      this.sprite.setVelocity(vx, vy);
    } else {
      if (length > 0) {
        vx = (vx / length) * PLAYER_SPEED;
        vy = (vy / length) * PLAYER_SPEED;
        this.sprite.anims.play(this.getRunAnimation(), true);
        if (vx !== 0) {
          this.sprite.setFlipX(vx < 0);
        }
        this.startRunningSound();
      } else {
        this.sprite.anims.play(this.getIdleAnimation(), true);
        this.stopRunningSound();
      }
      this.sprite.setVelocity(vx, vy);
    }

    if (this.isStaminaDepleted) {
    }
  }

  protected findNearestEnemy(): NpcBase | null {
    const npcs = (this.scene as any).npcManager.getNPCs() as NpcBase[];
    if (npcs.length === 0) return null;

    let nearestEnemy: NpcBase | null = null;
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

  private regenerateHealth() {
    if (this.levelManager.getHealth() >= this.levelManager.getMaxHealth()) {
      return;
    }

    const currentTime = this.scene.time.now;

    if (currentTime - this.lastDamageTime > this.regenDelay) {
      const healAmount = Math.min(
        this.regenRate,
        this.levelManager.getMaxHealth() - this.levelManager.getHealth()
      );

      if (healAmount > 0) {
        this.levelManager.setHealth(this.levelManager.getHealth() + healAmount);
        this.sprite.emit("healthChanged");
        this.floatingTextEffects.showHeal(this.sprite, healAmount);
      }
    }
  }

  private regenerateStamina() {
    if (this.currentStamina >= this.maxStamina) {
      this.currentStamina = this.maxStamina;
      this.isStaminaDepleted = false;
      return;
    }

    const currentTime = this.scene.time.now;
    const staminaSettings = DefaultGameSettings.player.stamina;

    if (
      currentTime - this.lastStaminaUseTime >
      staminaSettings.staminaRegenDelay
    ) {
      const regenRate = this.stats.staminaRegenRate;
      const regenAmount = regenRate * 0.1;
      this.currentStamina = Phaser.Math.Clamp(
        this.currentStamina + regenAmount,
        0,
        this.maxStamina
      );
      this.sprite.emit("staminaChanged");

      if (this.currentStamina > 0) {
        this.isStaminaDepleted = false;
      }
    }
  }

  protected useStamina(amount: number): boolean {
    if (this.currentStamina < amount) return false;

    this.currentStamina -= amount;
    this.lastStaminaUseTime = this.scene.time.now;
    this.currentStamina = Phaser.Math.Clamp(
      this.currentStamina,
      0,
      this.getMaxStamina()
    );

    this.sprite.emit("staminaChanged");

    if (this.currentStamina <= 0) {
      this.isStaminaDepleted = true;
    }

    return true;
  }

  protected checkCriticalHit(): boolean {
    this.lastCriticalHit = Phaser.Math.FloatBetween(0, 1) < this.critChance;
    return this.lastCriticalHit;
  }

  protected getCriticalDamageMultiplier(): number {
    return this.lastCriticalHit ? this.critDamageMultiplier : 1;
  }

  public getStaminaPercentage(): number {
    return this.currentStamina / this.getMaxStamina();
  }

  public getCurrentStamina(): number {
    return this.currentStamina;
  }

  public getMaxStamina(): number {
    return this.maxStamina;
  }

  protected startBlock() {
    this.isBlocking = true;
    this.sprite.anims.play(this.getBlockAnimation(), true);
    this.stopRunningSound();
  }

  protected endBlock() {
    this.isBlocking = false;
    this.sprite.clearTint();
    this.blockCooldown = true;

    if (this.isMoving) {
      this.startRunningSound();
    }

    this.scene.time.delayedCall(200, () => {
      this.blockCooldown = false;
    });
  }

  public takeDamage(amount: number, _attacker?: Phaser.Physics.Arcade.Sprite) {
    if (this.isBlocking) {
      const cost = DefaultGameSettings.player.stamina.blockCost;
      if (this.useStamina(cost)) {
        SoundManager.getInstance().play(this.scene, this.getBlockSoundKey(), {
          volume: 0.7,
        });
        this.floatingTextEffects.showDamage(this.sprite, 0);
        return;
      }
    }

    const newHealth = Phaser.Math.Clamp(
      this.levelManager.getHealth() - amount,
      0,
      this.levelManager.getMaxHealth()
    );
    this.levelManager.setHealth(newHealth);
    this.sprite.emit("healthChanged");
    this.lastDamageTime = this.scene.time.now;

    this.floatingTextEffects.showDamage(this.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(this.sprite);

    if (this.levelManager.getHealth() <= 0) {
      this.sprite.setVelocity(0, 0);
    }
  }

  public addExperience(amount: number) {
    this.levelManager.addExperience(amount);
  }

  public get health(): number {
    return this.levelManager.getHealth();
  }

  public set health(value: number) {
    this.levelManager.setHealth(value);
  }

  public get maxHealth(): number {
    return this.levelManager.getMaxHealth();
  }

  public get level(): number {
    return this.levelManager.getLevel();
  }

  public get experience(): number {
    return this.levelManager.getExperience();
  }

  public get nextLevelExp(): number {
    return this.levelManager.getNextLevelExp();
  }

  private startRunningSound() {
    if (!this.isMoving) {
      this.isMoving = true;

      if (this.runningSound.isPaused) {
        this.runningSound.resume();
      }

      SoundManager.getInstance().playInstance(this.runningSound, {
        volume: 0.2,
        rate: Phaser.Math.FloatBetween(0.9, 1.1),
      });

      this.scene.tweens.add({
        targets: this.runningSound,
        volume: { from: 0, to: 0.2 * SoundManager.getInstance().getVolume() },
        duration: this.soundFadeDuration,
        ease: "Linear",
      });
    }
  }

  private stopRunningSound() {
    if (this.isMoving) {
      this.isMoving = false;

      this.scene.tweens.add({
        targets: this.runningSound,
        volume: 0,
        duration: this.soundFadeDuration,
        ease: "Linear",
        onComplete: () => {
          if (!this.isMoving) {
            this.runningSound.pause();
          }
        },
      });
    }
  }

  public getCharacterTexture(): string {
    switch (this.characterClass) {
      case "warrior":
        return "Blue_warrior_idle";
      case "archer":
        return "Blue_archer_idle";
      case "lancer":
        return "Blue_lancer_idle";
      default:
        return "Blue_warrior_idle";
    }
  }

  public getPosition(): { x: number; y: number } {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return {
      x: body.x + body.halfWidth,
      y: body.y + body.halfHeight,
    };
  }

  public getCurrentLayer(
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ): number {
    const pos = this.getPosition();
    for (let i = terrainLayers.length - 1; i >= 0; i--) {
      if (terrainLayers[i].getTileAtWorldXY(pos.x, pos.y)) {
        return i;
      }
    }
    return -1;
  }

  destroy() {
    SoundManager.getInstance()["activeSounds"] = SoundManager.getInstance()[
      "activeSounds"
    ].filter((s) => s !== this.runningSound);

    this.runningSound.stop();
    this.healthRegenTimer.destroy();
    this.floatingTextEffects.destroy();
    this.staminaRegenTimer.destroy();
  }

  abstract attack(): void;
  protected abstract getCharacterType(): "warrior" | "archer" | "lancer";
  protected abstract getIdleAnimation(): string;
  protected abstract getRunAnimation(): string;
  protected abstract getBlockAnimation(): string;
}
