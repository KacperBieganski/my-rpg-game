import { type NpcConfig, NpcBase } from "./NpcBase";
import Phaser from "phaser";

export class GoblinTNT extends NpcBase {
  private dynamites: Phaser.Physics.Arcade.Group;
  private explosions: Phaser.Physics.Arcade.Group;
  private distanceFromPlayer: number;
  private explodeTime: number;
  private explodeRadius: number;
  private avoidanceVector: Phaser.Math.Vector2;
  private targetPosition: Phaser.Math.Vector2;
  private isAvoidingExplosion: boolean = false;
  private explosionPosition: Phaser.Math.Vector2 | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite,
    config: NpcConfig & {
      distanceFromThePlayer: number;
      explodeTime: number;
      explodeRadius: number;
    },
    type: string = "Walkable"
  ) {
    super(scene, x, y, "Red_goblinTNT_idle", player, config);

    this.isStatic = type === "Static";

    // Ustawienie głębokości dla statycznego NPC
    if (this.isStatic) {
      this.sprite.setDepth(10000);
    } else {
      this.sprite.setDepth(4);
    }

    this.distanceFromPlayer = config.distanceFromThePlayer;
    this.explodeTime = config.explodeTime;
    this.explodeRadius = config.explodeRadius;
    this.avoidanceVector = new Phaser.Math.Vector2();
    this.targetPosition = new Phaser.Math.Vector2();

    const gameScene = scene as unknown as {
      getDepthSortedGroup: () => Phaser.GameObjects.Group;
    };
    const depthSortedGroup = gameScene.getDepthSortedGroup();

    this.dynamites = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 5,
      createCallback: (item: Phaser.GameObjects.GameObject) => {
        const dynamite = item as Phaser.Physics.Arcade.Sprite;
        // Add to depth sorted group when created
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
        // Add to depth sorted group when created
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

  public update(): void {
    this.updateHealthBar();

    if (this.isStatic) {
      this.updateStaticBehavior();
      return;
    }

    if (this.isAttacking) {
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    if (distanceToPlayer <= this.detectionRange) {
      this.handleMovement(distanceToPlayer);

      if (distanceToPlayer <= this.attackRange && !this.attackCooldown) {
        this.attack();
      }
    } else {
      this.sprite.anims.play("Red_goblinTNT_idle", true);
      this.sprite.setVelocity(0, 0);
    }

    // Aktualizacja sortowania tylko dla ruchomych NPC
    if (!this.isStatic) {
      this.sprite.setData("sortY", this.sprite.y);
    }
  }

  protected updateStaticBehavior() {
    if (!this.isStatic) return;

    this.sprite.setDepth(10000);

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.player.x,
      this.player.y
    );

    // Obracanie się w kierunku gracza
    if (distanceToPlayer <= this.detectionRange) {
      this.sprite.setFlipX(this.player.x < this.sprite.x);

      // Atakowanie gdy gracz jest w zasięgu i nie ma cooldownu
      if (
        distanceToPlayer <= this.attackRange &&
        !this.isAttacking &&
        !this.attackCooldown
      ) {
        this.attack();
      }
    }
  }

  protected attack(): void {
    if (this.attackCooldown || this.isAttacking) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    this.scene.sound.play("throw", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    // Zapisz pozycję gracza w momencie rzutu
    this.targetPosition.set(this.player.x, this.player.y);

    this.sprite.anims.play("Red_goblinTNT_attack", true);
    this.sprite.setVelocity(0, 0);

    // Rzuc dynamitem w połowie animacji ataku
    this.scene.time.delayedCall(300, () => {
      if (this.sprite.active) {
        this.throwDynamite();
      }
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(this.attackRate, () => {
      this.attackCooldown = false;
    });
  }

  private throwDynamite(): void {
    const dynamite = this.dynamites.get(this.sprite.x, this.sprite.y);
    if (!dynamite) return;

    // Zapisz pozycję przyszłej eksplozji
    this.explosionPosition = new Phaser.Math.Vector2(
      this.targetPosition.x,
      this.targetPosition.y
    );
    this.isAvoidingExplosion = true;

    dynamite.setTexture("Dynamite");
    dynamite.setActive(true);
    dynamite.setVisible(true);
    dynamite.play("Dynamite");
    dynamite.setData("sortY", dynamite.y);
    dynamite.setRotation(0);

    // Obliczenia odległości i czasu lotu
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.targetPosition.x,
      this.targetPosition.y
    );
    const flightTime = Phaser.Math.Clamp(distance / 200, 500, 1500);

    // Prędkość początkowa
    const velocityX =
      (this.targetPosition.x - this.sprite.x) / (flightTime / 1000);
    const velocityY =
      (this.targetPosition.y - this.sprite.y) / (flightTime / 1000);
    dynamite.setVelocity(velocityX, velocityY);

    // Określenie kierunku rzutu na podstawie orientacji NPC
    const isFacingRight = this.sprite.flipX === false; // Zakładając, że flipX oznacza patrzenie w lewo
    const targetRotation = isFacingRight
      ? Phaser.Math.DegToRad(420) // 420° w prawo
      : Phaser.Math.DegToRad(-480); // 480° w lewo

    // Tween dla rotacji
    this.scene.tweens.add({
      targets: dynamite,
      rotation: targetRotation,
      duration: flightTime,
      ease: "Linear",
    });

    // Tween dla ruchu
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
        // Upewniamy się, że rotacja jest dokładnie docelowa
        dynamite.setRotation(targetRotation);
        dynamite.setVelocity(0, 0);

        // Eksplozja po krótkim opóźnieniu
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

    // Efekt dźwiękowy eksplozji
    this.scene.sound.play("explosion", {
      volume: 0.6,
      detune: Phaser.Math.Between(-100, 100),
    });

    // Promień eksplozji
    const explosionRadius = this.explodeRadius;

    // Zadaj obrażenia graczowi
    const distanceToPlayer = Phaser.Math.Distance.Between(
      x,
      y,
      this.player.x,
      this.player.y
    );
    if (distanceToPlayer <= explosionRadius) {
      this.player.emit("npcAttack", this.damage, this.sprite);
    }

    // Zadaj obrażenia wszystkim NPC w zasięgu
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

    // Zniszcz eksplozję po zakończeniu animacji
    explosion.once("animationcomplete", () => {
      explosion.destroy();
      this.isAvoidingExplosion = false;
      this.explosionPosition = null;
    });
  }

  private handleMovement(distanceToPlayer: number): void {
    // Jeśli unikamy eksplozji, zastosuj specjalne zachowanie
    if (this.isAvoidingExplosion && this.explosionPosition) {
      this.avoidExplosionArea();
      return;
    }

    const direction = new Phaser.Math.Vector2(
      this.player.x - this.sprite.x,
      this.player.y - this.sprite.y
    ).normalize();

    if (distanceToPlayer < this.distanceFromPlayer - 20) {
      direction.scale(-1);
      this.avoidObstacles(direction);
      this.sprite.setVelocity(
        direction.x * this.speed,
        direction.y * this.speed
      );
      this.sprite.anims.play("Red_goblinTNT_run", true);
      this.sprite.setFlipX(direction.x > 0);
    } else if (distanceToPlayer > this.distanceFromPlayer + 20) {
      this.avoidObstacles(direction);
      this.sprite.setVelocity(
        direction.x * this.speed,
        direction.y * this.speed
      );
      this.sprite.anims.play("Red_goblinTNT_run", true);
      this.sprite.setFlipX(direction.x < 0);
    } else {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.play("Red_goblinTNT_idle", true);
    }
  }

  private avoidExplosionArea(): void {
    if (!this.explosionPosition) return;

    const safeDistance = this.explodeRadius * 1.5; // Bezpieczna odległość większa niż promień eksplozji
    const distanceToExplosion = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.explosionPosition.x,
      this.explosionPosition.y
    );

    // Jeśli jesteśmy już w bezpiecznej odległości, zatrzymaj się
    if (distanceToExplosion > safeDistance) {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.play("Red_goblinTNT_idle", true);
      return;
    }

    // Oblicz kierunek ucieczki od epicentrum wybuchu
    const escapeDirection = new Phaser.Math.Vector2(
      this.sprite.x - this.explosionPosition.x,
      this.sprite.y - this.explosionPosition.y
    ).normalize();

    // Uwzględnij unikanie przeszkód
    this.avoidObstacles(escapeDirection);

    // Ustaw prędkość w kierunku ucieczki
    this.sprite.setVelocity(
      escapeDirection.x * this.speed * 1.5, // Szybsze tempo ucieczki
      escapeDirection.y * this.speed * 1.5
    );

    // Animacja i odwrócenie sprite'a
    this.sprite.anims.play("Red_goblinTNT_run", true);
    this.sprite.setFlipX(escapeDirection.x < 0);
  }

  private avoidObstacles(direction: Phaser.Math.Vector2): boolean {
    const rayLength = 30;
    const ray = new Phaser.Geom.Line(
      this.sprite.x,
      this.sprite.y,
      this.sprite.x + direction.x * rayLength,
      this.sprite.y + direction.y * rayLength
    );

    let hit = false;

    // First check world bounds
    const worldBounds = this.scene.physics.world.bounds;
    if (Phaser.Geom.Intersects.LineToRectangle(ray, worldBounds)) {
      hit = true;
      this.avoidanceVector.set(-direction.y, direction.x);
      direction.add(this.avoidanceVector).normalize();
      return hit;
    }

    // Get all static bodies in the scene
    const staticBodies = this.scene.physics.world.staticBodies;

    // Create a temporary array to hold colliders
    const colliders: Phaser.Physics.Arcade.StaticBody[] = (
      staticBodies as Phaser.Structs.Set<Phaser.Physics.Arcade.StaticBody>
    ).entries;

    // Check each static body
    for (const body of colliders) {
      if (!body.gameObject) continue;

      // Get bounds using the game object's position and display size
      const gameObj = body.gameObject as Phaser.GameObjects.GameObject;
      const x = (gameObj as any).x || 0;
      const y = (gameObj as any).y || 0;
      const width =
        (gameObj as any).displayWidth || (gameObj as any).width || 0;
      const height =
        (gameObj as any).displayHeight || (gameObj as any).height || 0;
      const bounds = new Phaser.Geom.Rectangle(
        x - width * 0.5,
        y - height * 0.5,
        width,
        height
      );

      if (Phaser.Geom.Intersects.LineToRectangle(ray, bounds)) {
        hit = true;
        this.avoidanceVector.set(-direction.y, direction.x);
        direction.add(this.avoidanceVector).normalize();
        break; // Only need to avoid one obstacle at a time
      }
    }

    return hit;
  }

  public getDynamites(): Phaser.Physics.Arcade.Group {
    return this.dynamites;
  }

  public getExplosions(): Phaser.Physics.Arcade.Group {
    return this.explosions;
  }

  public destroy(): void {
    super.destroy();
    this.scene.sound.play("deathGoblin1", {
      volume: 0.5,
      detune: Phaser.Math.Between(-100, 100),
    });
  }
}
