import Phaser from "phaser";

export class NPC {
  sprite: Phaser.Physics.Arcade.Sprite;
  direction: Phaser.Math.Vector2;
  scene: Phaser.Scene;
  health: number = 100;
  private maxHealth: number = 100;

  private changeDirectionTimer: Phaser.Time.TimerEvent;
  private lastPosition: Phaser.Math.Vector2;
  private stuckTime: number = 0;

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "warrior_idle");
    this.sprite.setScale(0.7);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    this.direction = new Phaser.Math.Vector2();
    this.pickRandomDirection();

    this.lastPosition = new Phaser.Math.Vector2(x, y);

    this.changeDirectionTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: this.pickRandomDirection,
      callbackScope: this,
      loop: true,
    });

    // Pasek zdrowia
    this.healthBarBg = scene.add
      .rectangle(x, y - 50, 50, 6, 0x000000)
      .setOrigin(0.5);
    this.healthBar = scene.add
      .rectangle(x, y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5);
  }

  pickRandomDirection() {
    const directions = [
      new Phaser.Math.Vector2(1, 0),
      new Phaser.Math.Vector2(-1, 0),
      new Phaser.Math.Vector2(0, 1),
      new Phaser.Math.Vector2(0, -1),
      new Phaser.Math.Vector2(0, 0),
    ];
    this.direction = Phaser.Utils.Array.GetRandom(directions);
  }

  update() {
    const PLAYER_SPEED = 200;
    const speed = PLAYER_SPEED / 2;

    // Ustaw prędkość
    this.sprite.setVelocity(this.direction.x * speed, this.direction.y * speed);

    // Animacja
    if (this.direction.length() > 0) {
      this.sprite.anims.play("run", true);
      this.sprite.setFlipX(this.direction.x < 0);
    } else {
      this.sprite.anims.play("idle", true);
    }

    // Sprawdzanie czy NPC się ruszył
    const currentPosition = new Phaser.Math.Vector2(
      this.sprite.x,
      this.sprite.y
    );
    const distance = Phaser.Math.Distance.BetweenPoints(
      currentPosition,
      this.lastPosition
    );

    if (this.direction.length() > 0) {
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
  }

  private updateHealthBar() {
    const { x, y } = this.sprite;
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBar.setPosition(x, y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(x, y - 50);
  }

  destroy() {
    this.sprite.destroy();
    this.changeDirectionTimer.destroy();
    this.healthBar.destroy();
    this.healthBarBg.destroy();
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
