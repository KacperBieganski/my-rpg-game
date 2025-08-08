import { NpcBase } from "../NpcBase";
import { type NpcConfig } from "../NpcConfig";
import Phaser from "phaser";

export class GoblinTNT extends NpcBase {
  private dynamites: Phaser.Physics.Arcade.Group;
  private explosions: Phaser.Physics.Arcade.Group;
  private explodeTime: number;
  private explodeRadius: number;
  private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig & {
      explodeTime: number;
      explodeRadius: number;
    },
    type: string = "Walkable"
  ) {
    super(scene, x, y, "Red_goblinTNT_idle", player, config);
    this.isStatic = type === "Static";
    this.explodeTime = config.explodeTime;
    this.explodeRadius = config.explodeRadius;

    const gameScene = scene as unknown as {
      getDepthSortedGroup: () => Phaser.GameObjects.Group;
    };
    const depthSortedGroup = gameScene.getDepthSortedGroup();

    this.dynamites = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 5,
      createCallback: (item: Phaser.GameObjects.GameObject) => {
        const dynamite = item as Phaser.Physics.Arcade.Sprite;
        depthSortedGroup.add(dynamite);
        dynamite.setData("sortY", dynamite.y);
        if (dynamite.body) {
          dynamite.body.setOffset(10, 20);
        }
      },
    });

    this.explosions = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 3,
      createCallback: (item: Phaser.GameObjects.GameObject) => {
        const explosion = item as Phaser.Physics.Arcade.Sprite;
        depthSortedGroup.add(explosion);
        explosion.setData("sortY", explosion.y);
        if (explosion.body) {
          explosion.body.setSize(70, 70);
          explosion.body.setOffset(60, 60);
        }
      },
    });
    this.loadSounds();
  }

  private loadSounds() {
    this.scene.sound.add("explosion");
    this.scene.sound.add("throw");
    this.scene.sound.add("deathGoblin1");
  }

  public attack(): void {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    // Skrócony czas animacji ataku podczas ucieczki
    const attackDuration = this.isRetreating ? 200 : 300;

    this.scene.sound.play("throw", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    this.targetPosition.set(this.player.x, this.player.y);
    this.sprite.anims.play("Red_goblinTNT_attack", true);

    this.scene.time.delayedCall(attackDuration, () => {
      if (this.sprite.active) {
        this.throwDynamite();
      }
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
      if (!this.isRetreating) {
        this.playIdleAnimation();
      }
    });

    this.scene.time.delayedCall(this.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  private throwDynamite(): void {
    const dynamite = this.dynamites.get(this.sprite.x, this.sprite.y);
    if (!dynamite) return;

    dynamite.setTexture("Dynamite");
    dynamite.setActive(true);
    dynamite.setVisible(true);
    dynamite.play("Dynamite");
    dynamite.setData("sortY", dynamite.y);
    dynamite.setRotation(0);

    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.targetPosition.x,
      this.targetPosition.y
    );
    const flightTime = Phaser.Math.Clamp(distance / 200, 500, 1500);

    const velocityX =
      (this.targetPosition.x - this.sprite.x) / (flightTime / 1000);
    const velocityY =
      (this.targetPosition.y - this.sprite.y) / (flightTime / 1000);
    dynamite.setVelocity(velocityX, velocityY);

    const isFacingRight = this.sprite.flipX === false;
    const targetRotation = isFacingRight
      ? Phaser.Math.DegToRad(420)
      : Phaser.Math.DegToRad(-480);

    this.scene.tweens.add({
      targets: dynamite,
      rotation: targetRotation,
      duration: flightTime,
      ease: "Linear",
    });

    this.scene.tweens.add({
      targets: dynamite,
      onUpdate: () => {
        dynamite.setData("sortY", dynamite.y);
      },
      x: this.targetPosition.x,
      y: this.targetPosition.y,
      duration: flightTime,
      ease: "Linear",
      onComplete: () => {
        dynamite.setRotation(targetRotation);
        dynamite.setVelocity(0, 0);

        this.scene.time.delayedCall(this.explodeTime, () => {
          if (dynamite.active) {
            this.createExplosion(dynamite.x, dynamite.y);
            dynamite.destroy();
          }
        });
      },
    });
  }

  private createExplosion(x: number, y: number): void {
    const explosion = this.explosions.get(x, y);
    if (!explosion) return;

    explosion.setTexture("Explosions");
    explosion.setActive(true);
    explosion.setVisible(true);
    explosion.play("Explosions");
    explosion.setData("sortY", y);

    this.scene.sound.play("explosion", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    const explosionRadius = this.explodeRadius;
    const distanceToPlayer = Phaser.Math.Distance.Between(
      x,
      y,
      this.player.x,
      this.player.y
    );
    if (distanceToPlayer <= explosionRadius) {
      this.player.emit("npcAttack", this.damage, this.sprite);
    }

    const npcs = (this.scene as any).npcManager.getNPCs() as NpcBase[];
    npcs.forEach((npc) => {
      const distanceToNpc = Phaser.Math.Distance.Between(
        x,
        y,
        npc.sprite.x,
        npc.sprite.y
      );
      if (distanceToNpc <= explosionRadius) {
        npc.takeDamage(this.damage);
      }
    });

    explosion.once("animationcomplete", () => {
      explosion.destroy();
    });
  }

  public getDynamites(): Phaser.Physics.Arcade.Group {
    return this.dynamites;
  }

  public getExplosions(): Phaser.Physics.Arcade.Group {
    return this.explosions;
  }

  public playRunAnimation(): void {
    this.sprite.anims.play("Red_goblinTNT_run", true);
  }

  public playIdleAnimation(): void {
    this.sprite.anims.play("Red_goblinTNT_idle", true);
  }

  public destroy(): void {
    this.scene.sound.play("deathGoblin1", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });
  }
}
