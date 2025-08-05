import Phaser from "phaser";

export class FloatingTextEffects {
  private scene: Phaser.Scene;
  private damageTextPool: Phaser.GameObjects.Text[] = [];
  private healTextPool: Phaser.GameObjects.Text[] = [];
  private levelUpTextPool: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, poolSize: number = 5) {
    this.scene = scene;
    this.initializePools(poolSize);
  }

  private initializePools(poolSize: number) {
    // Pool for damage numbers
    for (let i = 0; i < poolSize; i++) {
      const text = this.scene.add
        .text(0, 0, "", {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#ff0000",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setVisible(false)
        .setDepth(20);
      this.damageTextPool.push(text);
    }

    // Pool for heal numbers
    for (let i = 0; i < poolSize; i++) {
      const text = this.scene.add
        .text(0, 0, "", {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setVisible(false)
        .setDepth(20);
      this.healTextPool.push(text);
    }

    // Pool for level up texts
    for (let i = 0; i < poolSize; i++) {
      const text = this.scene.add
        .text(0, 0, "LEVEL UP!", {
          fontFamily: "Arial",
          fontSize: "30px",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setVisible(false)
        .setDepth(20);
      this.levelUpTextPool.push(text);
    }
  }

  public showDamage(source: Phaser.GameObjects.GameObject, amount: number) {
    this.showFloatingText(
      this.damageTextPool,
      source,
      `-${amount}`,
      Phaser.Math.Between(-10, 10),
      Phaser.Math.Between(-40, -20)
    );
  }

  public showHeal(source: Phaser.GameObjects.GameObject, amount: number) {
    this.showFloatingText(
      this.healTextPool,
      source,
      `+${amount}HP`,
      Phaser.Math.Between(-10, 10),
      Phaser.Math.Between(-40, -20)
    );
  }

  public showLevelUp(source: Phaser.GameObjects.GameObject) {
    this.showFloatingText(
      this.levelUpTextPool,
      source,
      "LEVEL UP!",
      Phaser.Math.Between(-30, 30),
      Phaser.Math.Between(-60, -40),
      1500,
      0.8
    );
  }

  showCriticalHit(target: Phaser.GameObjects.Sprite): void {
    const text = this.scene.add
      .text(target.x, target.y - 50, "CRITICAL!", {
        font: "20px Arial",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: target.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  private showFloatingText(
    pool: Phaser.GameObjects.Text[],
    source: Phaser.GameObjects.GameObject,
    text: string,
    xOffset: number,
    yOffset: number,
    duration: number = 2000,
    scale: number = 1
  ) {
    const availableText = pool.find((text) => !text.visible);
    if (availableText && source.active) {
      availableText.setText(text);
      availableText.setPosition(
        (source as any).x + xOffset,
        (source as any).y + yOffset
      );
      availableText.setScale(scale);
      availableText.setVisible(true);
      availableText.setAlpha(1);

      this.scene.tweens.add({
        targets: availableText,
        y: availableText.y - 50,
        alpha: 0,
        scale: scale * 1.2,
        duration: duration,
        ease: "Power1",
        onComplete: () => {
          availableText.setVisible(false);
          availableText.setScale(scale);
        },
      });
    }
  }

  public applyDamageEffects(
    sprite: Phaser.Physics.Arcade.Sprite,
    knockbackForce: number = 0,
    attackerX?: number,
    attackerY?: number
  ) {
    // Flash effect
    let flashCount = 0;
    const flashTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        flashCount++;
      },
      callbackScope: this,
      repeat: 3,
    });

    // Shake effect
    const originalX = sprite.x;
    const originalY = sprite.y;
    let shakeCount = 0;
    const shakeTimer = this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        sprite.x = originalX + (Math.random() * 4 - 2);
        sprite.y = originalY + (Math.random() * 4 - 2);
        shakeCount++;
        if (shakeCount >= 4) {
          sprite.x = originalX;
          sprite.y = originalY;
          shakeTimer.remove();
        }
      },
      callbackScope: this,
      repeat: 3,
    });

    // Knockback effect
    if (
      knockbackForce > 0 &&
      attackerX !== undefined &&
      attackerY !== undefined
    ) {
      const knockbackDirection = new Phaser.Math.Vector2(
        sprite.x - attackerX,
        sprite.y - attackerY
      )
        .normalize()
        .scale(30)
        .scale(knockbackForce);

      sprite.setVelocity(knockbackDirection.x, knockbackDirection.y);
    }

    // Reset effects after delay
    this.scene.time.delayedCall(300, () => {
      if (sprite.active) {
        sprite.setVelocity(0);
        sprite.x = originalX;
        sprite.y = originalY;
        flashTimer.remove();
        shakeTimer.remove();
      }
    });
  }

  public destroy() {
    [
      ...this.damageTextPool,
      ...this.healTextPool,
      ...this.levelUpTextPool,
    ].forEach((text) => text.destroy());
  }
}
