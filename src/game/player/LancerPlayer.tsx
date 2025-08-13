import { PlayerBase } from "./PlayerBase";
import { NpcBase } from "../npc/NpcBase";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";
import { SoundManager } from "../SoundManager";

export class LancerPlayer extends PlayerBase {
  private attackToggle = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterClass: "warrior" | "archer" | "lancer" = "warrior"
  ) {
    super(
      scene,
      x,
      y,
      "lancer",
      characterClass,
      DefaultGameSettings.player.warrior
    );
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setOffset(140, 155);
  }

  update() {
    // Logika bloku - tylko gdy nie atakujemy
    if (!this.isAttacking) {
      if (this.blockKey.isDown && !this.isBlocking && !this.blockCooldown) {
        this.startBlock();
      } else if (this.blockKey.isUp && this.isBlocking) {
        this.endBlock();
      }
    }

    super.update();
  }

  takeDamage(amount: number, attacker?: Phaser.Physics.Arcade.Sprite) {
    super.takeDamage(amount, attacker);

    if (this.isBlocking && this.currentStamina >= 0 && amount > 0) {
      if (attacker) {
        this.playDirectionalBlockAnimation(attacker);
      } else {
        this.sprite.anims.play(this.getBlockAnimation(), true);
      }
      return;
    }
  }

  private playDirectionalBlockAnimation(
    attacker: Phaser.Physics.Arcade.Sprite
  ) {
    const dx = attacker.x - this.sprite.x;
    const dy = attacker.y - this.sprite.y;
    const angle = Math.atan2(dy, dx);
    const angleDeg = Phaser.Math.RadToDeg(angle);

    let anim: string;
    let flipX = false;

    // Określ animację na podstawie kąta ataku
    if (angleDeg >= -22.5 && angleDeg < 22.5) {
      anim = "player_lancer_right_defence";
      flipX = false;
    } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
      anim = "player_lancer_downright_defence";
      flipX = false;
    } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
      anim = "player_lancer_down_defence";
    } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
      anim = "player_lancer_downright_defence";
      flipX = true;
    } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
      anim = "player_lancer_right_defence";
      flipX = true;
    } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
      anim = "player_lancer_upright_defence";
      flipX = true;
    } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
      anim = "player_lancer_up_defence";
    } else {
      anim = "player_lancer_upright_defence";
      flipX = false;
    }

    this.sprite.setFlipX(flipX);
    this.sprite.anims.play(anim, true);

    // Efekt wizualny
    this.sprite.setTint(0x8888ff);
    this.scene.time.delayedCall(200, () => {
      if (this.sprite.active) {
        this.sprite.clearTint();
      }
    });
  }

  attack() {
    if (this.isBlocking) return;
    if (
      this.attackCooldown ||
      this.isAttacking ||
      !this.useStamina(DefaultGameSettings.player.stamina.attackCost)
    )
      return;

    const isCrit = this.checkCriticalHit();
    const baseDmg = DefaultGameSettings.player.lancer.attackDamage;
    const damage = baseDmg * this.getCriticalDamageMultiplier();

    this.isAttacking = true;
    this.attackCooldown = true;

    const nearestEnemy = this.findNearestEnemy();
    const classSettings = DefaultGameSettings.player.lancer;

    const thrustSounds = ["spearThrust1", "spearThrust2", "spearThrust3"];
    const randomSoundKey = Phaser.Math.RND.pick(thrustSounds);
    SoundManager.getInstance().play(this.scene, randomSoundKey, {
      volume: 0.3,
    });

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
    //this.sprite.setVelocity(0);
    this.sprite.anims.play(anim, true);

    // Jeśli wróg jest w zasięgu, zadaj obrażenia
    if (nearestEnemy) {
      const npcs = (this.scene as any).npcManager.getNPCs() as NpcBase[];

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
            npc.takeDamage(damage);
            if (isCrit) {
              this.floatingTextEffects.showCriticalHit(npc.sprite);
            }
            SoundManager.getInstance().play(this.scene, "spearHit", {
              volume: 0.6,
              detune: Phaser.Math.Between(-100, 100),
            });
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

  protected getBlockAnimation(): string {
    return "player_lancer_right_defence";
  }

  protected startBlock() {
    this.isBlocking = true;
    // Standardowa animacja bloku - zmieni się na kierunkową jeśli będzie atak
    this.sprite.anims.play(this.getBlockAnimation(), true);
  }

  protected getCharacterType(): "warrior" | "archer" | "lancer" {
    return "lancer";
  }

  protected getIdleAnimation(): string {
    return "player_lancer_idle";
  }

  protected getBlockSoundKey(): string {
    return "spearBlock";
  }

  protected getRunAnimation(): string {
    return "player_lancer_run";
  }
}
