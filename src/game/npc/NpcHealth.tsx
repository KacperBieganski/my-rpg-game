import Phaser from "phaser";
import { FloatingTextEffects } from "../FloatingTextEffects";
import { NpcBase } from "./NpcBase";

export class NpcHealth {
  protected npc: NpcBase;
  protected healthBarBg!: Phaser.GameObjects.Rectangle;
  protected healthBar!: Phaser.GameObjects.Rectangle;
  protected floatingTextEffects: FloatingTextEffects;
  private isHealthBarVisible: boolean = false;

  constructor(npc: NpcBase) {
    this.npc = npc;
    this.setupHealthBar();
    this.floatingTextEffects = new FloatingTextEffects(npc.scene);
    this.hide(); // Ukryj na początku
  }

  protected setupHealthBar() {
    this.healthBarBg = this.npc.scene.add
      .rectangle(this.npc.sprite.x, this.npc.sprite.y - 50, 50, 6, 0x000000)
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false); // Ukryj na początku
    this.healthBar = this.npc.scene.add
      .rectangle(this.npc.sprite.x, this.npc.sprite.y - 50, 50, 4, 0xff0000)
      .setOrigin(0.5)
      .setDepth(11)
      .setVisible(false); // Ukryj na początku
  }

  public updateHealthBar() {
    if (!this.healthBar || !this.healthBarBg || !this.npc.sprite.active) return;

    const healthPercent = Phaser.Math.Clamp(
      this.npc.health / this.npc.maxHealth,
      0,
      1
    );

    // Pokaż pasek zdrowia tylko jeśli zdrowie jest mniejsze niż maksymalne
    if (healthPercent < 1 && !this.isHealthBarVisible) {
      this.show();
    } else if (healthPercent >= 1 && this.isHealthBarVisible) {
      this.hide();
    }

    // Aktualizuj pozycję i rozmiar paska zdrowia
    this.healthBar.setPosition(this.npc.sprite.x, this.npc.sprite.y - 50);
    this.healthBar.setSize(50 * healthPercent, 4);
    this.healthBarBg.setPosition(this.npc.sprite.x, this.npc.sprite.y - 50);
  }

  public takeDamage(amount: number) {
    if (!this.npc.sprite.active) return;

    this.npc.health -= amount;
    this.floatingTextEffects.showDamage(this.npc.sprite, amount);
    this.floatingTextEffects.applyDamageEffects(this.npc.sprite);

    // Pokaż pasek zdrowia po otrzymaniu obrażeń
    if (!this.isHealthBarVisible) {
      this.show();
    }

    if (this.npc.health <= 0) {
      this.npc.scene.events.emit("npcKilled", this.npc.expGain);
      this.npc.startDeathAnimation();
    }
  }

  public hide() {
    this.healthBar?.setVisible(false);
    this.healthBarBg?.setVisible(false);
    this.isHealthBarVisible = false;
  }

  public show() {
    this.healthBar?.setVisible(true);
    this.healthBarBg?.setVisible(true);
    this.isHealthBarVisible = true;
  }

  public destroy() {
    this.healthBar?.destroy();
    this.healthBarBg?.destroy();
    this.floatingTextEffects.destroy();
  }
}
