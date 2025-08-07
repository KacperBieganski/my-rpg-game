import Phaser from "phaser";
import { NpcBase } from "../npc/NpcBase";
import { DefaultGameSettings } from "../GameSettings";
import { FloatingTextEffects } from "../FloatingTextEffects";

export abstract class PlayerBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number;
  public maxHealth: number;
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
  protected blockSound: Phaser.Sound.BaseSound;
  protected blockCooldown = false;
  protected floatingTextEffects: FloatingTextEffects;
  protected lastDamageTime: number = 0;
  protected healthRegenTimer: Phaser.Time.TimerEvent;
  protected regenRate: number;
  protected regenDelay: number;

  private lastStaminaUseTime: number = 0;
  private staminaRegenTimer: Phaser.Time.TimerEvent;
  private isStaminaDepleted: boolean = false;
  private lastCriticalHit: boolean = false;
  public level: number;
  public experience: number;
  public nextLevelExp: number = 100;
  public currentStamina: number;
  public maxStamina: number;
  public critChance: number;
  public critDamageMultiplier: number;

  private runningSound: Phaser.Sound.BaseSound;
  private lvlUpSound: Phaser.Sound.BaseSound;
  private isMoving: boolean = false;
  private soundFadeDuration: number = 200;

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
    this.maxStamina = DefaultGameSettings.player.stamina.maxStamina;
    this.currentStamina = this.maxStamina;
    this.critChance = DefaultGameSettings.player.criticalHit.baseChance;
    this.critDamageMultiplier =
      DefaultGameSettings.player.criticalHit.damageMultiplier;
    this.regenRate = settings.regenRate;
    this.regenDelay = settings.regenDelay;
    this.currentStamina = DefaultGameSettings.player.stamina.maxStamina;
    this.level = DefaultGameSettings.player.level;
    this.experience = DefaultGameSettings.player.experience;

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(1);
    this.sprite.setDepth(5);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 40);
    body.setOffset(74, 90);

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

    this.staminaRegenTimer = scene.time.addEvent({
      delay: 100, // Check every 100ms for better responsiveness
      callback: this.regenerateStamina,
      callbackScope: this,
      loop: true,
    });

    // scene.input.on("pointerdown", this.attack, this);
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
    this.blockSound = this.scene.sound.add("shieldBlock", { volume: 0.7 });

    this.floatingTextEffects = new FloatingTextEffects(scene);

    this.runningSound = this.scene.sound.add("runningGrass", {
      loop: true,
      volume: 0,
    });
    this.lvlUpSound = this.scene.sound.add("lvlUp", {
      volume: 1,
    });
  }

  update() {
    const PLAYER_SPEED =
      DefaultGameSettings.player[this.getCharacterType()].speed;
    let vx = 0;
    let vy = 0;

    // Obsługa ruchu - działa nawet podczas ataku i blokowania
    if (!this.isBlocking) {
      // Tylko jeśli nie blokujemy
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;
    }

    const length = Math.hypot(vx, vy);

    if (this.isBlocking) {
      // Podczas blokowania pokazujemy tylko animację bloku
      this.sprite.anims.play(this.getBlockAnimation(), true);
      this.sprite.setVelocity(0, 0); // Zatrzymujemy postać podczas blokowania
    } else if (this.isAttacking) {
      // Podczas ataku pozwalamy na ruch, ale nie zmieniamy animacji
      if (length > 0) {
        vx = (vx / length) * PLAYER_SPEED;
        vy = (vy / length) * PLAYER_SPEED;
        if (vx !== 0) {
          this.sprite.setFlipX(vx < 0);
        }
      }
      this.sprite.setVelocity(vx, vy);
    } else {
      // Normalny ruch
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
    // Jeśli zdrowie jest już pełne, nie ma co regenerować
    if (this.health >= this.maxHealth) {
      return;
    }

    const currentTime = this.scene.time.now;

    // Sprawdź czy minął wymagany czas od ostatnich obrażeń
    if (currentTime - this.lastDamageTime > this.regenDelay) {
      const healAmount = Math.min(this.regenRate, this.maxHealth - this.health);

      // Dodaj tylko jeśli jest co dodawać
      if (healAmount > 0) {
        this.health += healAmount;
        this.sprite.emit("healthChanged");
        this.floatingTextEffects.showHeal(this.sprite, healAmount);
      }
    }
  }

  private regenerateStamina() {
    if (this.currentStamina >= DefaultGameSettings.player.stamina.maxStamina) {
      this.currentStamina = DefaultGameSettings.player.stamina.maxStamina;
      this.isStaminaDepleted = false;
      return;
    }

    const currentTime = this.scene.time.now;
    const staminaSettings = DefaultGameSettings.player.stamina;

    // Check if enough time has passed since last stamina use
    if (
      currentTime - this.lastStaminaUseTime >
      staminaSettings.staminaRegenDelay
    ) {
      const regenAmount = staminaSettings.staminaRegenRate * 0.1; // Convert to per 100ms
      this.currentStamina = Phaser.Math.Clamp(
        this.currentStamina + regenAmount,
        0,
        staminaSettings.maxStamina
      );
      this.sprite.emit("staminaChanged");
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
    return this.currentStamina / DefaultGameSettings.player.stamina.maxStamina;
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

    // Krótki cooldown przed ponownym blokiem (300ms)
    this.scene.time.delayedCall(200, () => {
      this.blockCooldown = false;
    });
  }

  public takeDamage(amount: number, _attacker?: Phaser.Physics.Arcade.Sprite) {
    if (this.isBlocking) {
      const cost = DefaultGameSettings.player.stamina.blockCost;
      if (this.useStamina(cost)) {
        this.blockSound.play();
        this.floatingTextEffects.showDamage(this.sprite, 0);
        return;
      }
    }

    // Normalne obrażenia
    this.health = Phaser.Math.Clamp(this.health - amount, 0, this.maxHealth);
    this.sprite.emit("healthChanged");
    this.lastDamageTime = this.scene.time.now;

    this.floatingTextEffects.showDamage(this.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(this.sprite);

    if (this.health <= 0) {
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
    this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2);

    if (!this.lvlUpSound.isPlaying) {
      this.lvlUpSound.play();
    }

    // Zapisz poprzednie maksymalne zdrowie
    const previousMaxHealth = this.maxHealth;

    // Zwiększ maksymalne zdrowie
    this.maxHealth = Math.floor(this.maxHealth * 1.1);

    // Dodaj różnicę do obecnego zdrowia (zamiast ustawiać na max)
    const healthIncrease = this.maxHealth - previousMaxHealth;
    this.health += healthIncrease;

    this.lastDamageTime = 0;

    this.floatingTextEffects.showLevelUp(this.sprite);
    this.sprite.emit("levelUp");
    this.sprite.emit("statsChanged");

    // Pokaż efekt uleczenia jeśli było zwiększenie zdrowia
    if (healthIncrease > 0) {
      this.floatingTextEffects.showHeal(this.sprite, healthIncrease);
    }
  }

  private startRunningSound() {
    if (!this.isMoving) {
      this.isMoving = true;
      if (!this.runningSound.isPlaying) {
        this.runningSound.play();
      }
      // Płynne pojawienie się dźwięku
      this.scene.tweens.add({
        targets: this.runningSound,
        volume: { from: 0, to: 0.2 },
        duration: this.soundFadeDuration,
        ease: "Linear",
      });
    }
  }

  private stopRunningSound() {
    if (this.isMoving) {
      this.isMoving = false;
      // Płynne zanikanie dźwięku przed zatrzymaniem
      this.scene.tweens.add({
        targets: this.runningSound,
        volume: { from: 0.2, to: 0 },
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

  destroy() {
    this.runningSound.stop();
    this.healthRegenTimer.destroy();
    this.floatingTextEffects.destroy();
  }

  abstract attack(): void;
  protected abstract getCharacterType(): "warrior" | "archer" | "lancer";
  protected abstract getIdleAnimation(): string;
  protected abstract getRunAnimation(): string;
  protected abstract getBlockAnimation(): string;
}
