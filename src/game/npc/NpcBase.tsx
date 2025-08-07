import Phaser from "phaser";
import { FloatingTextEffects } from "../FloatingTextEffects";

export interface NpcConfig {
  health: number;
  maxHealth: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  damage: number;
  attackRate: number;
  expGain: number;
  distanceFromPlayer: number;
  shouldMaintainDistance?: boolean;
}

export abstract class NpcBase {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number;
  protected maxHealth: number;
  protected scene: Phaser.Scene;
  protected speed: number;
  protected detectionRange: number;
  protected attackRange: number;
  protected damage: number;
  protected attackRate: number;
  protected expGain: number;
  protected isStatic: boolean = false;
  protected shouldMaintainDistance: boolean = false;
  protected distanceFromPlayer: number;
  protected isRetreating: boolean = false;
  protected currentRetreatAngle: number = 0;

  protected healthBarBg!: Phaser.GameObjects.Rectangle;
  protected healthBar!: Phaser.GameObjects.Rectangle;
  protected floatingTextEffects: FloatingTextEffects;

  protected changeDirectionTimer?: Phaser.Time.TimerEvent;
  protected lastPosition: Phaser.Math.Vector2;
  protected stuckTime: number = 0;
  protected direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  protected isFollowing: boolean = false;

  protected isAttacking: boolean = false;
  protected attackCooldown: boolean = false;
  protected player: Phaser.Physics.Arcade.Sprite;

  public readonly config: NpcConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig
  ) {
    this.scene = scene;
    this.player = player;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setData("sortY", y);
    this.config = config;

    this.health = config.health;
    this.maxHealth = config.maxHealth;
    this.speed = config.speed;
    this.detectionRange = config.detectionRange;
    this.attackRange = config.attackRange;
    this.damage = config.damage;
    this.attackRate = config.attackRate;
    this.expGain = config.expGain;
    this.shouldMaintainDistance = config.shouldMaintainDistance || false;
    this.distanceFromPlayer = config.distanceFromPlayer;
    this.lastPosition = new Phaser.Math.Vector2(x, y);

    if (!this.isStatic) {
      this.setupMovement();
    }
    this.setupPhysics();
    this.setupHealthBar();
    this.floatingTextEffects = new FloatingTextEffects(scene);
  }

  public setStatic(isStatic: boolean): void {
    this.isStatic = isStatic;

    if (!this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 20);
    body.setOffset(74, 110);
    body.moves = !isStatic;

    if (isStatic) {
      body.setVelocity(0, 0);
      body.setImmovable(true);
    }
  }

  protected updateStaticBehavior() {
    if (!this.isStatic) return;

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    // Obracanie się w kierunku gracza
    if (distanceToPlayer <= this.detectionRange) {
      this.sprite.setFlipX(this.player.x < this.sprite.x);

      // Atakowanie gdy gracz jest w zasięgu i nie ma cooldownu
      if (
        distanceToPlayer <= this.attackRange &&
        !this.isAttacking &&
        !this.attackCooldown
      ) {
        this.attack();
      }
    }
  }

  protected setupMovement() {
    if (this.isStatic) return;

    this.changeDirectionTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: this.pickRandomDirection,
      callbackScope: this,
      loop: true,
    });
  }

  protected handleIdleBehavior() {
    this.sprite.setVelocity(
      (this.direction.x * this.speed) / 2,
      (this.direction.y * this.speed) / 2
    );

    if (this.direction.length() > 0) {
      this.playRunAnimation();
      this.sprite.setFlipX(this.direction.x < 0);
    } else {
      this.playIdleAnimation();
    }

    this.checkIfStuck();
  }

  protected pickRandomDirection() {
    if (!this.isFollowing && !this.isAttacking) {
      const possibleDirections = [
        new Phaser.Math.Vector2(1, 0),
        new Phaser.Math.Vector2(1, 1).normalize(),
        new Phaser.Math.Vector2(-1, 0),
        new Phaser.Math.Vector2(0, 1),
        new Phaser.Math.Vector2(0, -1),
        new Phaser.Math.Vector2(-1, -1).normalize(),
        new Phaser.Math.Vector2(0, 0),
      ];
      this.direction = Phaser.Utils.Array.GetRandom(possibleDirections);
      this.sprite.setVelocity(0, 0);
      this.playIdleAnimation();
    }
  }

  protected checkIfStuck() {
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

  protected setupPhysics() {
    this.sprite.setScale(1);
    this.sprite.setDepth(4);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 20);
    body.setOffset(74, 110);

    if (this.isStatic) {
      body.moves = false;
    }
  }

  protected setupHealthBar() {
    this.healthBarBg = this.scene.add
      .rectangle(this.sprite.x, this.sprite.y - 50, 50, 6, 0x000000)
      .setOrigin(0.5)
      .setDepth(10);
    this.healthBar = this.scene.add
      .rectangle(this.sprite.x, this.sprite.y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5)
      .setDepth(11);
  }

  protected updateHealthBar() {
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBar.setPosition(this.sprite.x, this.sprite.y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 50);
  }

  public takeDamage(amount: number) {
    if (!this.sprite.active) return;

    this.health -= amount;
    this.floatingTextEffects.showDamage(this.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(this.sprite);

    if (this.health <= 0) {
      this.scene.events.emit("npcKilled", this.expGain);
      this.destroy();
    }
  }

  // Główna metoda update dla wszystkich NPC
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

    // Uniwersalna detekcja gracza
    if (distanceToPlayer <= this.detectionRange) {
      this.handlePlayerDetection(distanceToPlayer);
    } else {
      this.handleIdleBehavior();
    }

    this.sprite.setData("sortY", this.sprite.y);
  }

  // Uniwersalna obsługa wykrycia gracza
  protected handlePlayerDetection(distanceToPlayer: number) {
    if (this.shouldMaintainDistance && this.distanceFromPlayer !== undefined) {
      this.handleMaintainDistance(distanceToPlayer);
    } else {
      this.handleStandardMovement(distanceToPlayer);

      // Atak tylko gdy nie trzymamy dystansu
      if (
        distanceToPlayer <= this.attackRange &&
        !this.attackCooldown &&
        !this.isAttacking
      ) {
        this.attack();
      }
    }
  }

  // Standardowe poruszanie się w kierunku gracza
  protected handleStandardMovement(distanceToPlayer: number) {
    if (distanceToPlayer <= this.attackRange) {
      this.sprite.setVelocity(0, 0);
      this.sprite.setFlipX(this.player.x < this.sprite.x);
      return;
    }

    const direction = new Phaser.Math.Vector2(
      this.player.x - this.sprite.x,
      this.player.y - this.sprite.y
    ).normalize();

    this.sprite.setVelocity(direction.x * this.speed, direction.y * this.speed);
    this.sprite.setFlipX(direction.x < 0);

    this.playRunAnimation();
  }

  // Specjalne zachowanie dla GoblinTNT - utrzymanie określonego dystansu
  protected handleMaintainDistance(distanceToPlayer: number) {
    const targetDistance = this.distanceFromPlayer || 150;
    const buffer = 15;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    this.checkIfStuck();

    // 1. Jeśli gracz jest zbyt blisko — uciekaj
    if (distanceToPlayer < targetDistance - buffer) {
      this.isRetreating = true;

      if (this.stuckTime > 0) {
        this.findNewRetreatDirection(angle);
        return;
      }

      this.playRunAnimation();
      return;
    }

    this.isRetreating = false;
    this.stuckTime = 0;

    // 2. Jeśli gracz jest za daleko — podejdź
    if (distanceToPlayer > targetDistance + buffer) {
      const approachX = Math.cos(angle) * this.speed;
      const approachY = Math.sin(angle) * this.speed;

      this.sprite.setVelocity(approachX, approachY);
      this.sprite.setFlipX(approachX < 0);
      this.playRunAnimation();
      return;
    }

    // 3. Gracz jest w idealnym dystansie — zatrzymaj się i atakuj
    this.sprite.setVelocity(0, 0);
    this.sprite.setFlipX(this.player.x < this.sprite.x);
    this.playIdleAnimation();

    if (!this.attackCooldown && !this.isAttacking) {
      this.attack();
    }
  }

  protected findNewRetreatDirection(baseAngle: number): void {
    // Losowy kąt ucieczki w zakresie ±90 stopni od pierwotnego kierunku
    const angleVariation = Phaser.Math.FloatBetween(-Math.PI / 2, Math.PI / 2);
    this.currentRetreatAngle = baseAngle + Math.PI + angleVariation;

    // Aktualizujemy kierunek dla checkIfStuck
    this.direction.set(
      Math.cos(this.currentRetreatAngle),
      Math.sin(this.currentRetreatAngle)
    );

    // Tymczasowe zatrzymanie i animacja "dezorientacji"
    this.sprite.setVelocity(0, 0);
    this.sprite.anims.play("Red_goblinTNT_idle", true);

    // Po krótkim opóźnieniu kontynuuj ucieczkę
    this.scene.time.delayedCall(200, () => {
      if (this.sprite.active) {
        const retreatX = Math.cos(this.currentRetreatAngle) * this.speed * 1.3;
        const retreatY = Math.sin(this.currentRetreatAngle) * this.speed * 1.3;
        this.sprite.setVelocity(retreatX, retreatY);
        this.sprite.setFlipX(retreatX < 0);
        this.playRunAnimation();
      }
    });
  }

  protected cancelAttack() {
    this.isAttacking = false;

    // Przerwij aktualną animację, jeśli trzeba
    if (
      this.sprite.anims.currentAnim &&
      this.sprite.anims.currentAnim.key.includes("attack")
    ) {
      this.sprite.anims.stop();
      this.sprite.setTexture(this.sprite.texture.key, 0); // resetuj klatkę
    }

    // Ustaw animację idle jako domyślną po przerwaniu
    this.sprite.anims.play("Red_goblinTNT_idle", true);
  }

  abstract attack(): void;
  protected abstract playRunAnimation(): void;
  protected abstract playIdleAnimation(): void;
  public destroy() {
    this.sprite.destroy();
    this.healthBar?.destroy();
    this.healthBarBg?.destroy();
    this.floatingTextEffects.destroy();
  }
}
