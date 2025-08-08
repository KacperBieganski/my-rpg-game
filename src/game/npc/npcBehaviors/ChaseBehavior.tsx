import Phaser from "phaser";
import { NpcBase } from "../NpcBase";

export class ChaseBehavior {
  protected npc: NpcBase;

  constructor(npc: NpcBase) {
    this.npc = npc;
  }

  public handleStandardMovement(distanceToPlayer: number) {
    if (distanceToPlayer <= this.npc.attackRange) {
      this.npc.sprite.setVelocity(0, 0);
      this.npc.sprite.setFlipX(this.npc.player.x < this.npc.sprite.x);
      return;
    }

    const direction = new Phaser.Math.Vector2(
      this.npc.player.x - this.npc.sprite.x,
      this.npc.player.y - this.npc.sprite.y
    ).normalize();

    this.npc.sprite.setVelocity(
      direction.x * this.npc.speed,
      direction.y * this.npc.speed
    );
    this.npc.sprite.setFlipX(direction.x < 0);
    this.npc.playRunAnimation();
  }
}
