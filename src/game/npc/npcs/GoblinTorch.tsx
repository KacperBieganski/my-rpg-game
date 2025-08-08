import { NpcBase } from "../NpcBase";
import { type NpcConfig } from "../NpcConfig";
import Phaser from "phaser";

export class GoblinTorch extends NpcBase {
  private torchSwingSounds: Phaser.Sound.BaseSound[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig,
    type: string = "Walkable"
  ) {
    super(scene, x, y, "Red_goblinTorch_idle", player, config);
    this.isStatic = type === "Static";

    this.loadSounds();
  }

  private loadSounds() {
    this.torchSwingSounds = [
      this.scene.sound.add("torchSwing1"),
      this.scene.sound.add("torchSwing2"),
      this.scene.sound.add("torchSwing3"),
    ];
    this.scene.sound.add("torchHit1");
    this.scene.sound.add("deathGoblin1");
  }

  public attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    const randomSoundIndex = Phaser.Math.Between(
      0,
      this.torchSwingSounds.length - 1
    );
    this.torchSwingSounds[randomSoundIndex].play({ volume: 0.6 });

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );
    const angleDeg = Phaser.Math.RadToDeg(angle);

    let attackAnim: string;
    if (angleDeg >= -45 && angleDeg < 45) {
      attackAnim = "Red_goblinTorch_right_attack";
      this.sprite.setFlipX(false);
    } else if (angleDeg >= 45 && angleDeg < 135) {
      attackAnim = "Red_goblinTorch_down_attack";
    } else if (angleDeg >= -135 && angleDeg < -45) {
      attackAnim = "Red_goblinTorch_up_attack";
    } else {
      attackAnim = "Red_goblinTorch_right_attack";
      this.sprite.setFlipX(true);
    }

    this.sprite.anims.play(attackAnim, true);

    this.scene.time.delayedCall(300, () => {
      if (this.sprite.active) {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          this.player.x,
          this.player.y
        );

        if (distance <= this.attackRange) {
          this.player.emit("npcAttack", this.damage, this.sprite);
          this.scene.sound.play("torchHit1", {
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
    this.sprite.anims.play("Red_goblinTorch_run", true);
  }

  public playIdleAnimation(): void {
    this.sprite.anims.play("Red_goblinTorch_idle", true);
  }

  public destroy() {
    this.scene.sound.play("deathGoblin1", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });
  }
}
