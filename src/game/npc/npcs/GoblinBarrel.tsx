import Phaser from "phaser";
import { NpcBase } from "../NpcBase";
import { type NpcConfig } from "../NpcConfig";
import { SoundManager } from "../../SoundManager";
import type { PlayerBase } from "../../player/PlayerBase";

export class GoblinBarrel extends NpcBase {
  private explodeRadius: number;
  private explosions: Phaser.Physics.Arcade.Group;
  private activationTimer?: Phaser.Time.TimerEvent;
  private deactivationTimer?: Phaser.Time.TimerEvent;
  private isActivating: boolean = false;
  private isDeactivating: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: PlayerBase,
    config: NpcConfig & { explodeRadius: number },
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ) {
    super(scene, x, y, "Red_goblinBarrel_Idle", player, config, terrainLayers);

    this.sprite.setScale(1);
    this.direction.set(0, 0);
    this.explodeRadius = config.explodeRadius;

    const gameScene = scene as unknown as {
      getDepthSortedGroup: () => Phaser.GameObjects.Group;
    };
    const depthSortedGroup = gameScene.getDepthSortedGroup();

    this.healthSystem.hide();

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

    if (this.sprite.body) {
      this.sprite.body.setOffset(45, 75);
    }
  }

  public attack(): void {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.sprite.setVelocity(0, 0);
    this.sprite.anims.play("Red_goblinBarrel_Hide");

    this.sprite.once("animationcomplete", () => {
      this.playExplosionAnimation();
    });
  }

  private playExplosionAnimation(): void {
    this.sprite.anims.play("Red_goblinBarrel_Explode");

    this.sprite.once("animationcomplete", () => {
      this.createExplosion(this.sprite.x, this.sprite.y);
      this.takeDamage(this.maxHealth);
      this.activationTimer?.destroy();
      this.deactivationTimer?.destroy();
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

    SoundManager.getInstance().play(this.scene, "explosion", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    const explosionRadius = this.explodeRadius;
    const distanceToPlayer = Phaser.Math.Distance.Between(
      x,
      y,
      this.player.sprite.x,
      this.player.sprite.y
    );
    if (distanceToPlayer <= explosionRadius) {
      this.player.sprite.emit("npcAttack", this.damage, this.sprite);
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

  private startActivationSequence() {
    // anuluj deactivation jeśli w toku
    if (this.deactivationTimer) {
      this.deactivationTimer.destroy();
      this.deactivationTimer = undefined;
      this.isDeactivating = false;
    }

    if (this.isActivating || this.isFollowing || this.isAttacking) return;

    this.isActivating = true;
    this.healthSystem.show();

    this.sprite.anims.play("Red_goblinBarrel_Show");
    SoundManager.getInstance().play(this.scene, "openBox", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    this.sprite.once("animationcomplete", () => {
      this.sprite.setTexture("Red_goblinBarrel_ShowStatic");
      this.activationTimer = this.scene.time.addEvent({
        delay: 200,
        callback: () => {
          this.activationTimer = undefined;
          this.isActivating = false;
          this.setStatic(false);
          this.isFollowing = true;
        },
      });
    });
  }

  private startDeactivationSequence() {
    // zatrzymaj natychmiast ruch
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setVelocity(0, 0);
    }

    // anuluj activation jeśli w toku
    if (this.activationTimer) {
      this.sprite.anims.play("Red_goblinBarrel_Hide");
      this.sprite.once("animationcomplete", () => {
        this.activationTimer?.destroy();
        this.activationTimer = undefined;
        this.isActivating = false;
      });
    }

    if (this.isDeactivating) return;

    this.isDeactivating = true;

    this.sprite.setTexture("Red_goblinBarrel_ShowStatic");

    this.deactivationTimer = this.scene.time.addEvent({
      delay: 300,
      callback: () => {
        this.deactivationTimer = undefined;
        this.sprite.anims.play("Red_goblinBarrel_Hide");
        SoundManager.getInstance().play(this.scene, "closeBox", {
          volume: 0.6,
          detune: Phaser.Math.Between(-100, 100),
        });
        this.sprite.once("animationcomplete", () => {
          this.playIdleAnimation();
          this.setStatic(true);
          this.isDeactivating = false;
          this.isFollowing = false;
          this.healthSystem.hide();
        });
      },
    });
  }

  public update(): void {
    // odśwież HUD życia
    this.healthSystem.updateHealthBar();

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y
    );

    // Gracz w zasięgu detekcji
    if (distanceToPlayer <= this.detectionRange && !this.isAttacking) {
      if (!this.isFollowing && !this.isActivating) {
        this.startActivationSequence();
      }

      if (this.isFollowing) {
        this.behaviorCoordinator.handlePlayerDetection(distanceToPlayer);
      } else {
        this.sprite.setFlipX(this.player.sprite.x < this.sprite.x);
      }
    } else {
      // Gracz poza zasięgiem -> zatrzymaj się i wróć do idle po sekwencji
      if (this.isFollowing || this.isActivating) {
        this.startDeactivationSequence();
      } else {
        // nic się nie dzieje — upewnij się że stoi w miejscu
        const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
        if (body) body.setVelocity(0, 0);
        this.playIdleAnimation();
      }
    }

    this.sprite.setData("sortY", this.sprite.y);
  }

  public playIdleAnimation(): void {
    this.sprite.setTexture("Red_goblinBarrel_Idle");
  }

  public playRunAnimation(): void {
    this.sprite.anims.play("Red_goblinBarrel_Run", true);
  }

  public getExplosions(): Phaser.Physics.Arcade.Group {
    return this.explosions;
  }

  protected getDeathSoundKey(): string {
    return "deathGoblin1";
  }
}
