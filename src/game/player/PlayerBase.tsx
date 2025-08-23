import Phaser from "phaser";
import { NpcBase } from "../npc/NpcBase";
import { DefaultGameSettings } from "../GameSettings";
import { FloatingTextEffects } from "../FloatingTextEffects";
import { SoundManager } from "../SoundManager";
import { LevelManager } from "./LevelManager";
import { DeathScene } from "../menu/inGameMenu/DeathScene";
import GameScene from "../GameScene";
import { Item } from "../items/Item";
import { ItemManager } from "./ItemManager";
import { StatsManager } from "./StatsManager";

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
  public isDestroyed: boolean = false;
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
  private lastStaminaUseTime: number = 0;
  private staminaRegenTimer: Phaser.Time.TimerEvent;
  private isStaminaDepleted: boolean = false;
  private lastCriticalHit: boolean = false;

  private runningSound: Phaser.Sound.BaseSound;
  private isMoving: boolean = false;
  private soundFadeDuration: number = 200;

  public levelManager: LevelManager;
  public characterClass!: "warrior" | "archer" | "lancer";
  public stats: StatsManager;
  public itemManager: ItemManager;

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

    this.stats = new StatsManager({
      maxHealth: settings.maxHealth,
      health: settings.health,
      maxStamina: DefaultGameSettings.player.stamina.maxStamina,
      currentStamina: DefaultGameSettings.player.stamina.maxStamina,
      attackDamage: settings.attackDamage,
      speed: settings.speed,
      regenRate: settings.regenRate,
      regenDelay: settings.regenDelay,
      staminaRegenRate: DefaultGameSettings.player.stamina.staminaRegenRate,
      staminaRegenDelay: DefaultGameSettings.player.stamina.staminaRegenDelay,
      critChance: DefaultGameSettings.player.criticalHit.baseChance,
      critDamageMultiplier:
        DefaultGameSettings.player.criticalHit.damageMultiplier,
      level: DefaultGameSettings.player.level,
      experience: DefaultGameSettings.player.experience,
      nextLevelExp: 100,
      levelPoints: DefaultGameSettings.player.levelPoints,
      gold: DefaultGameSettings.player.gold || 0,
    });

    this.itemManager = new ItemManager(scene, this);
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
    if (this.isDestroyed || !this.sprite) return;

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
    if (this.isDestroyed) return null;

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
    if (this.stats.health >= this.stats.maxHealth) {
      return;
    }

    const currentTime = this.scene.time.now;

    if (currentTime - this.lastDamageTime > this.stats.regenDelay) {
      const healAmount = Math.min(
        this.stats.regenRate,
        this.stats.maxHealth - this.stats.health
      );

      if (healAmount > 0) {
        this.stats.addHealth(healAmount);
        this.sprite.emit("healthChanged");
        this.floatingTextEffects.showHeal(this.sprite, healAmount);
      }
    }
  }

  private regenerateStamina() {
    if (this.stats.currentStamina >= this.stats.maxStamina) {
      this.stats.currentStamina = this.stats.maxStamina;
      this.isStaminaDepleted = false;
      return;
    }

    const currentTime = this.scene.time.now;

    if (currentTime - this.lastStaminaUseTime > this.stats.staminaRegenDelay) {
      const regenAmount = this.stats.staminaRegenRate * 0.1;
      this.stats.addStamina(regenAmount);
      this.sprite.emit("staminaChanged");

      if (this.stats.currentStamina > 0) {
        this.isStaminaDepleted = false;
      }
    }
  }

  protected useStamina(amount: number): boolean {
    if (this.stats.currentStamina < amount) return false;

    this.stats.reduceStamina(amount);
    this.lastStaminaUseTime = this.scene.time.now;
    this.sprite.emit("staminaChanged");

    if (this.stats.currentStamina <= 0) {
      this.isStaminaDepleted = true;
    }

    return true;
  }

  protected checkCriticalHit(): boolean {
    this.lastCriticalHit =
      Phaser.Math.FloatBetween(0, 1) < this.stats.critChance;
    return this.lastCriticalHit;
  }

  protected getCriticalDamageMultiplier(): number {
    return this.lastCriticalHit ? this.stats.critDamageMultiplier : 1;
  }

  public getStaminaPercentage(): number {
    return this.stats.currentStamina / this.stats.maxStamina;
  }

  public getCurrentStamina(): number {
    return this.stats.currentStamina;
  }

  public getMaxStamina(): number {
    return this.stats.maxStamina;
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
    if (this.levelManager.getHealth() <= 0 || this.isDestroyed) return;

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
      SoundManager.getInstance().play(this.scene, "deathPlayer", {
        volume: 0.7,
      });
      this.destroy();
      (this.scene as GameScene).ui.destroy();

      this.scene.time.delayedCall(1500, () => {
        if (!this.scene.scene.isActive()) return;
        SoundManager.getInstance().play(this.scene, "deathScene", {
          volume: 1,
        });
        new DeathScene(this.scene as GameScene).show();
      });
    }
  }

  public addExperience(amount: number) {
    this.levelManager.addExperience(amount);
  }

  public get health(): number {
    return this.stats.health;
  }

  public set health(value: number) {
    this.stats.health = value;
  }

  public get maxHealth(): number {
    return this.stats.maxHealth;
  }

  public get level(): number {
    return this.stats.level;
  }

  public get experience(): number {
    return this.stats.experience;
  }

  public get nextLevelExp(): number {
    return this.stats.nextLevelExp;
  }

  public get levelPoints(): number {
    return this.stats.levelPoints;
  }

  public set levelPoints(value: number) {
    this.stats.levelPoints = value;
  }

  public get gold(): number {
    return this.stats.gold;
  }

  public set gold(value: number) {
    this.stats.gold = value;
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

  public getPosition(): { x: number; y: number } | null {
    if (this.isDestroyed || !this.sprite || !this.sprite.body) {
      return null;
    }

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
    if (!pos) {
      return -1;
    }

    for (let i = terrainLayers.length - 1; i >= 0; i--) {
      if (terrainLayers[i].getTileAtWorldXY(pos.x, pos.y)) {
        return i;
      }
    }
    return -1;
  }

  addToInventory(item: Item) {
    this.itemManager.addToInventory(item);
  }

  removeFromInventory(itemId: string, quantity: number = 1) {
    this.itemManager.removeFromInventory(itemId, quantity);
  }

  equipItem(itemId: string) {
    return this.itemManager.equipItem(itemId, () => {
      this.sprite.emit("statsChanged");
    });
  }

  unequipItem(itemId: string) {
    return this.itemManager.unequipItem(itemId, () => {
      this.sprite.emit("statsChanged");
    });
  }

  useItem(itemId: string) {
    return this.itemManager.useItem(itemId, () => {
      this.sprite.emit("statsChanged");
    });
  }

  // Dodajemy gettery dla kompatybilności z istniejącym kodem
  get inventory() {
    return this.itemManager.inventory;
  }

  get equippedItems() {
    return this.itemManager.equippedItems;
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    SoundManager.getInstance()["activeSounds"] = SoundManager.getInstance()[
      "activeSounds"
    ].filter((s) => s !== this.runningSound);

    this.runningSound.stop();
    this.healthRegenTimer.destroy();
    this.floatingTextEffects.destroy();
    this.staminaRegenTimer.destroy();

    if (this.sprite.body) {
      (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.sprite.body.enable = false;
    }

    this.sprite.anims.play("dead_anim1");
    this.sprite.once("animationcomplete-dead_anim1", () => {
      this.sprite.anims.play("dead_anim2");
      this.sprite.once("animationcomplete-dead_anim2", () => {
        this.sprite.destroy();
      });
    });
  }

  abstract attack(): void;
  protected abstract getCharacterType(): "warrior" | "archer" | "lancer";
  protected abstract getIdleAnimation(): string;
  protected abstract getRunAnimation(): string;
  protected abstract getBlockAnimation(): string;
}
