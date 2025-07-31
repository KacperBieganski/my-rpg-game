import { PlayerBase } from "./PlayerBase";
import { NPC } from "../NPC";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";

export class LancerPlayer extends PlayerBase {
  private attackToggle = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Blue_Lancer_idle", DefaultGameSettings.player.lancer);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setOffset(130, 130);
  }

  attack() {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    const nearestEnemy = this.findNearestEnemy();
    const classSettings = DefaultGameSettings.player.lancer;

    let anim = "player_lancer_right_attack";
    let flipX = false;
    let attackAngle = 0;

    if (nearestEnemy) {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        nearestEnemy.sprite.x,
        nearestEnemy.sprite.y
      );

      // Tylko jeśli wróg jest w zasięgu ataku
      if (dist <= classSettings.attackRange + 100) {
        const dx = nearestEnemy.sprite.x - this.sprite.x;
        const dy = nearestEnemy.sprite.y - this.sprite.y;
        attackAngle = Math.atan2(dy, dx);

        // Określ kierunek na podstawie kąta (8 kierunków)
        const angleDeg = Phaser.Math.RadToDeg(attackAngle);

        if (angleDeg >= -22.5 && angleDeg < 22.5) {
          anim = "player_lancer_right_attack";
          flipX = false;
        } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
          anim = "player_lancer_downright_attack";
          flipX = false;
        } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
          anim = "player_lancer_down_attack";
        } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
          anim = "player_lancer_downright_attack";
          flipX = true;
        } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
          anim = "player_lancer_right_attack";
          flipX = true;
        } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
          anim = "player_lancer_upright_attack";
          flipX = true;
        } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
          anim = "player_lancer_up_attack";
        } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
          anim = "player_lancer_upright_attack";
          flipX = false;
        }
        this.sprite.setFlipX(flipX);
      }
    }

    this.attackToggle = !this.attackToggle;
    this.sprite.setVelocity(0);
    this.sprite.anims.play(anim, true);

    // Jeśli wróg jest w zasięgu, zadaj obrażenia
    if (nearestEnemy) {
      const npcs = (this.scene as any).npcManager.getNPCs() as NPC[];

      npcs.forEach((npc) => {
        const dist = Phaser.Math.Distance.Between(
          npc.sprite.x,
          npc.sprite.y,
          this.sprite.x,
          this.sprite.y
        );

        if (dist <= classSettings.attackRange) {
          // Oblicz kąt do NPC względem kierunku ataku
          const npcAngle = Math.atan2(
            npc.sprite.y - this.sprite.y,
            npc.sprite.x - this.sprite.x
          );

          // Sprawdź czy NPC jest w zakresie kąta ataku (45 stopni w każdą stronę)
          const angleDiff = Math.abs(
            Phaser.Math.Angle.Wrap(npcAngle - attackAngle)
          );
          if (angleDiff <= Phaser.Math.DegToRad(45)) {
            npc.takeDamage(
              classSettings.attackDamage,
              this.sprite.x,
              this.sprite.y
            );
          }
        }
      });
    }

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(classSettings.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  protected getCharacterType(): "warrior" | "archer" | "lancer" {
    return "lancer";
  }

  protected getIdleAnimation(): string {
    return "player_lancer_idle";
  }

  protected getRunAnimation(): string {
    return "player_lancer_run";
  }
}
