import type { PlayerBase } from "../../player/PlayerBase";
import { SoundManager } from "../../SoundManager";
import { NpcBase } from "../NpcBase";
import { type NpcConfig } from "../NpcConfig";
import Phaser from "phaser";

export class Snake extends NpcBase {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: PlayerBase,
    config: NpcConfig,
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ) {
    super(scene, x, y, "Snake_Idle", player, config, terrainLayers);

    this.sprite.setData("isEnemy", true);
    this.sprite.setScale(0.8);
    this.sprite.setSize(85, 40);
    this.sprite.setOffset(40, 65);
  }

  public attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    SoundManager.getInstance().play(this.scene, "attackSnake", {
      volume: 0.6,
      detune: Phaser.Math.Between(-300, 300),
    });

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y
    );
    const angleDeg = Phaser.Math.RadToDeg(angle);

    let attackAnim: string;
    if (angleDeg >= -45 && angleDeg < 45) {
      attackAnim = "Snake_Attack";
      this.sprite.setFlipX(false);
    } else {
      attackAnim = "Snake_Attack";
      this.sprite.setFlipX(true);
    }

    this.sprite.anims.play(attackAnim, true);

    this.scene.time.delayedCall(300, () => {
      if (this.sprite.active) {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          this.player.sprite.x,
          this.player.sprite.y
        );

        if (distance <= this.attackRange) {
          this.player.sprite.emit("npcAttack", this.damage, this.sprite);
          SoundManager.getInstance().play(this.scene, "torchHit1", {
            volume: 0.6,
            detune: Phaser.Math.Between(-100, 100),
          });
        }
      }
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
      this.playIdleAnimation();
    });

    this.scene.time.delayedCall(this.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  public playRunAnimation(): void {
    this.sprite.anims.play("Snake_Run", true);
  }

  public playIdleAnimation(): void {
    if (this.sprite) this.sprite.anims.play("Snake_Idle", true);
  }

  protected getDeathSoundKey(): string {
    return "deathSnake";
  }
}
