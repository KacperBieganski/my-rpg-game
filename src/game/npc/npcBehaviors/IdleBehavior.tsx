import Phaser from "phaser";
import { NpcBase } from "../NpcBase";

export class IdleBehavior {
  protected npc: NpcBase;

  constructor(npc: NpcBase) {
    this.npc = npc;
  }

  public handleIdleBehavior() {
    this.npc.sprite.setVelocity(
      (this.npc.direction.x * this.npc.speed) / 2,
      (this.npc.direction.y * this.npc.speed) / 2
    );

    if (this.npc.direction.length() > 0) {
      this.npc.playRunAnimation();
      this.npc.sprite.setFlipX(this.npc.direction.x < 0);
    } else {
      this.npc.playIdleAnimation();
    }

    this.checkIfStuck();
  }

  public pickRandomDirection() {
    if (!this.npc.isFollowing && !this.npc.isAttacking) {
      const possibleDirections = [
        new Phaser.Math.Vector2(1, 0),
        new Phaser.Math.Vector2(1, 1).normalize(),
        new Phaser.Math.Vector2(-1, 0),
        new Phaser.Math.Vector2(0, 1),
        new Phaser.Math.Vector2(0, -1),
        new Phaser.Math.Vector2(-1, -1).normalize(),
        new Phaser.Math.Vector2(0, 0),
      ];
      this.npc.direction = Phaser.Utils.Array.GetRandom(possibleDirections);
      this.npc.sprite.setVelocity(0, 0);
      this.npc.playIdleAnimation();
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

    if (this.npc.direction.length() > 0 && !this.npc.isFollowing) {
      if (distance < 1) {
        this.npc.stuckTime += this.npc.scene.game.loop.delta;
        if (this.npc.stuckTime > 200) {
          this.pickRandomDirection();
          this.npc.stuckTime = 0;
        }
      } else {
        this.npc.stuckTime = 0;
      }
    }

    this.npc.lastPosition.copy(currentPosition);
  }
}
