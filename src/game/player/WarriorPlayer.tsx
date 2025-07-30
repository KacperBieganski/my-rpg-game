import { PlayerBase } from "./PlayerBase";
import { NPC } from "../NPC";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";

export class WarriorPlayer extends PlayerBase {
  private attackToggle = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Blue_warrior_idle", DefaultGameSettings.player.warrior);
  }

  attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    const nearestEnemy = this.findNearestEnemy();
    const classSettings = DefaultGameSettings.player.warrior;

    // Zawsze odtwarzaj animację ataku
    const anim = this.attackToggle
      ? "player_warrior_attack1"
      : "player_warrior_attack2";
    this.attackToggle = !this.attackToggle;
    this.sprite.setVelocity(0);
    this.sprite.anims.play(anim, true);

    // Jeśli wróg jest w zasięgu, zadaj obrażenia
    if (nearestEnemy) {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        nearestEnemy.sprite.x,
        nearestEnemy.sprite.y
      );

      if (dist <= classSettings.attackRange) {
        this.sprite.setFlipX(nearestEnemy.sprite.x < this.sprite.x);

        const hitBox = new Phaser.Geom.Circle(
          this.sprite.x,
          this.sprite.y,
          classSettings.attackRange
        );

        const npcs = (this.scene as any).npcManager.getNPCs() as NPC[];
        npcs.forEach((npc) => {
          const dist = Phaser.Math.Distance.Between(
            npc.sprite.x,
            npc.sprite.y,
            this.sprite.x,
            this.sprite.y
          );
          if (dist < hitBox.radius) {
            npc.takeDamage(
              classSettings.attackDamage,
              this.sprite.x,
              this.sprite.y
            );
          }
        });
      }
    }

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(classSettings.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  protected getCharacterType(): "warrior" | "archer" {
    return "warrior";
  }

  protected getIdleAnimation(): string {
    return "player_warrior_idle";
  }

  protected getRunAnimation(): string {
    return "player_warrior_run";
  }
}
