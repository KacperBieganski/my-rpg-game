import Phaser from "phaser";
import { NpcBase } from "../NpcBase";

export class IdleBehavior {
  protected npc: NpcBase;
  private idleTimer: Phaser.Time.TimerEvent | null = null;
  private moveTimer: Phaser.Time.TimerEvent | null = null;
  private currentAction: "idle" | "moving" = "idle";
  private smoothDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(npc: NpcBase) {
    this.npc = npc;
    this.setupBehaviorTimers();
  }

  private setupBehaviorTimers() {
    // Losowy czas między akcjami (3-8 sekund)
    const idleDuration = Phaser.Math.Between(3000, 8000);
    const moveDuration = Phaser.Math.Between(2000, 5000);

    this.idleTimer = this.npc.scene.time.addEvent({
      delay: idleDuration,
      callback: this.startIdlePeriod,
      callbackScope: this,
      loop: true,
    });

    this.moveTimer = this.npc.scene.time.addEvent({
      delay: moveDuration,
      callback: this.startMovingPeriod,
      callbackScope: this,
      loop: true,
    });

    // Początkowy stan - idle
    this.startIdlePeriod();
  }

  private startIdlePeriod() {
    if (
      this.currentAction === "idle" ||
      this.npc.isFollowing ||
      this.npc.isAttacking
    )
      return;

    this.currentAction = "idle";
    this.npc.direction.set(0, 0);
    this.npc.sprite.setVelocity(0, 0);
    this.npc.playIdleAnimation();

    // Losowy czas bezruchu (1-7 sekundy)
    const idleTime = Phaser.Math.Between(1000, 7000);
    this.npc.scene.time.delayedCall(idleTime, () => {
      if (
        this.currentAction === "idle" &&
        !this.npc.isFollowing &&
        !this.npc.isAttacking
      ) {
        this.startMovingPeriod();
      }
    });
  }

  private startMovingPeriod() {
    if (
      this.currentAction === "moving" ||
      this.npc.isFollowing ||
      this.npc.isAttacking
    )
      return;

    this.currentAction = "moving";
    this.pickRandomDirection();

    // Losowy czas ruchu (2-5 sekund)
    const moveTime = Phaser.Math.Between(2000, 5000);
    this.npc.scene.time.delayedCall(moveTime, () => {
      if (
        this.currentAction === "moving" &&
        !this.npc.isFollowing &&
        !this.npc.isAttacking
      ) {
        this.startIdlePeriod();
      }
    });
  }

  public handleIdleBehavior() {
    if (this.npc.isFollowing || this.npc.isAttacking) return;

    this.smoothDirection.lerp(this.npc.direction, 0.1);

    const velocityX = this.smoothDirection.x * this.npc.speed * 0.5;
    const velocityY = this.smoothDirection.y * this.npc.speed * 0.5;

    this.npc.sprite.setVelocity(velocityX, velocityY);

    if (this.smoothDirection.length() > 0.1) {
      this.npc.playRunAnimation();
      this.npc.sprite.setFlipX(this.smoothDirection.x < 0);
    } else {
      this.npc.playIdleAnimation();
    }

    this.checkIfStuck();
  }

  public pickRandomDirection() {
    if (this.npc.isFollowing || this.npc.isAttacking) return;

    // Losowy kierunek z większym prawdopodobieństwem kontynuacji obecnego kierunku
    if (Math.random() < 0.7 && this.npc.direction.length() > 0) {
      // 70% szans na lekko zmodyfikowany obecny kierunek
      const angleVariation = Phaser.Math.FloatBetween(-0.5, 0.5);
      const currentAngle = this.npc.direction.angle();
      const newAngle = currentAngle + angleVariation;

      this.npc.direction.setTo(Math.cos(newAngle), Math.sin(newAngle));
    } else {
      // 30% szans na całkowicie nowy kierunek
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.npc.direction.setTo(Math.cos(angle), Math.sin(angle));
    }

    // 20% szans na zatrzymanie się
    if (Math.random() < 0.2) {
      this.npc.direction.set(0, 0);
    }
  }

  protected checkIfStuck() {
    const currentPosition = new Phaser.Math.Vector2(
      this.npc.sprite.x,
      this.npc.sprite.y
    );
    const distance = Phaser.Math.Distance.BetweenPoints(
      currentPosition,
      this.npc.lastPosition
    );

    if (this.npc.direction.length() > 0 && this.currentAction === "moving") {
      if (distance < 1) {
        this.npc.stuckTime += this.npc.scene.game.loop.delta;
        if (this.npc.stuckTime > 500) {
          this.handleObstacle();
          this.npc.stuckTime = 0;
        }
      } else {
        this.npc.stuckTime = 0;
      }
    }

    this.npc.lastPosition.copy(currentPosition);
  }

  private handleObstacle() {
    // Obracaj się o 90 stopni w losową stronę gdy napotkasz przeszkodę
    const currentAngle = this.npc.direction.angle();
    const turnDirection = Math.random() < 0.5 ? 1 : -1;
    const newAngle = currentAngle + (Math.PI / 2) * turnDirection;

    this.npc.direction.setTo(Math.cos(newAngle), Math.sin(newAngle));
  }

  public destroy() {
    this.idleTimer?.destroy();
    this.moveTimer?.destroy();
    this.idleTimer = null;
    this.moveTimer = null;
  }
}
