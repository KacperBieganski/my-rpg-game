import Phaser from "phaser";
import { NpcBase } from "../NpcBase";

export class MaintainDistanceBehavior {
  protected npc: NpcBase;
  private retreatCooldown: number = 0;
  private lastRetreatTime: number = 0;

  constructor(npc: NpcBase) {
    this.npc = npc;
  }

  public handleMaintainDistance(distanceToPlayer: number) {
    const targetDistance = this.npc.distanceFromPlayer || 150;
    const buffer = 20; // Zwiększony bufor dla płynniejszego przejścia

    const angle = Phaser.Math.Angle.Between(
      this.npc.sprite.x,
      this.npc.sprite.y,
      this.npc.player.x,
      this.npc.player.y
    );

    // Aktualizacja czasu cooldownu ucieczki
    const currentTime = this.npc.scene.time.now;
    if (currentTime - this.lastRetreatTime > 1000) {
      this.retreatCooldown = Math.max(
        0,
        this.retreatCooldown - (currentTime - this.lastRetreatTime)
      );
    }
    this.lastRetreatTime = currentTime;

    // 1. Jeśli gracz jest zbyt blisko — uciekaj
    if (distanceToPlayer < targetDistance - buffer) {
      this.handleRetreat(angle, distanceToPlayer, targetDistance);
      this.npc.attack();
      return;
    }

    this.npc.isRetreating = false;
    this.npc.stuckTime = 0;

    // 2. Jeśli gracz jest za daleko — podejdź
    if (distanceToPlayer > targetDistance + buffer) {
      this.handleApproach(angle);
      return;
    }

    // 3. Gracz jest w idealnym dystansie
    this.handleOptimalDistance(angle);
  }

  private handleRetreat(
    angle: number,
    distanceToPlayer: number,
    targetDistance: number
  ) {
    this.npc.isRetreating = true;

    // Oblicz jak bardzo gracz jest za blisko
    const distanceRatio = (targetDistance - distanceToPlayer) / targetDistance;
    const panicMultiplier = 1 + distanceRatio; // 1-2 w zależności od bliskości gracza

    if (this.npc.stuckTime > 0) {
      this.findNewRetreatDirection(angle);
      return;
    }

    // Uciekaj z większą prędkością gdy gracz jest bliżej
    const retreatSpeed = this.npc.speed * panicMultiplier;
    const retreatX = Math.cos(angle + Math.PI) * retreatSpeed;
    const retreatY = Math.sin(angle + Math.PI) * retreatSpeed;

    this.npc.sprite.setVelocity(retreatX, retreatY);
    this.npc.sprite.setFlipX(retreatX < 0);
    this.npc.playRunAnimation();
  }

  private handleApproach(angle: number) {
    const approachX = Math.cos(angle) * this.npc.speed * 0.8; // Podejście wolniejsze niż ucieczka
    const approachY = Math.sin(angle) * this.npc.speed * 0.8;

    this.npc.sprite.setVelocity(approachX, approachY);
    this.npc.sprite.setFlipX(approachX < 0);
    this.npc.playRunAnimation();
  }

  private handleOptimalDistance(angle: number) {
    // Płynne zatrzymanie zamiast nagłego
    const body = this.npc.sprite.body as Phaser.Physics.Arcade.Body;
    body.velocity.x *= 0.9;
    body.velocity.y *= 0.9;

    if (body.velocity.length() < 10) {
      this.npc.sprite.setVelocity(0, 0);
      this.npc.sprite.setFlipX(this.npc.player.x < this.npc.sprite.x);
      this.npc.playIdleAnimation();
    }

    if (!this.npc.attackCooldown && !this.npc.isAttacking) {
      this.npc.attack();
    }
  }

  protected findNewRetreatDirection(baseAngle: number): void {
    const angleVariation = Phaser.Math.FloatBetween(-Math.PI / 2, Math.PI / 2);
    this.npc.currentRetreatAngle = baseAngle + Math.PI + angleVariation;

    this.npc.direction.set(
      Math.cos(this.npc.currentRetreatAngle),
      Math.sin(this.npc.currentRetreatAngle)
    );

    // Animacja "dezorientacji" z efektem wizualnym
    this.npc.sprite.setVelocity(0, 0);
    this.npc.scene.tweens.add({
      targets: this.npc.sprite,
      angle: Phaser.Math.Between(-15, 15),
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.npc.sprite.angle = 0;
        this.continueRetreat();
      },
    });
  }

  private continueRetreat() {
    if (this.npc.sprite.active) {
      const retreatX =
        Math.cos(this.npc.currentRetreatAngle) * this.npc.speed * 1.5;
      const retreatY =
        Math.sin(this.npc.currentRetreatAngle) * this.npc.speed * 1.5;

      this.npc.sprite.setVelocity(retreatX, retreatY);
      this.npc.sprite.setFlipX(retreatX < 0);
      this.npc.playRunAnimation();
    }
  }
}
