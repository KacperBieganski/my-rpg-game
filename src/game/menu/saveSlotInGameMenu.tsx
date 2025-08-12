import Phaser from "phaser";
import GameScene from "../GameScene";
import { SaveManager, type SaveData } from "../SaveManager";

export default class saveSlotInGameMenu {
  private scene: GameScene;
  private container!: Phaser.GameObjects.Container;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createSavesContainer();
    this.escKey = this.scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.escKey?.on("down", () => {
      if (this.container.visible) {
        this.hide();
      }
    });

    this.build();
  }

  private createSavesContainer() {
    this.container = this.scene.add
      .container(169, 0)
      .setDepth(1000000)
      .setScrollFactor(0)
      .setVisible(false);
  }

  public show() {
    if (!this.container) return;
    this.build();
    this.container.setVisible(true);
  }

  public hide() {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  private build() {
    this.container.removeAll(true);
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło i tytuł
    const bg = this.scene.add
      .rectangle(cx, cy + 38, 683, 500)
      //.setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const title = this.scene.add
      .text(cx - 100, cy - 150, "Wybierz slot zapisu", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.container.add([bg, title]);

    // sloty
    const slots = [1, 2, 3, 4] as const;
    slots.forEach((slot, i) => {
      const data = SaveManager.load(slot);
      const label = data
        ? `Slot ${slot}: ${data.characterClass} Lvl ${data.level}`
        : `Slot ${slot}: pusty`;

      const btn = this.scene.add
        .text(cx, cy - 100 + i * 40, label, {
          fontSize: "18px",
          color: data ? "#aaffaa" : "#aaaaaa",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          if (data) {
            this.showConfirm(slot);
          } else {
            this.performSave(slot);
          }
        });

      this.container.add(btn);
    });

    const autoSaveData = SaveManager.getAutoSaveData();
    const autoSaveLabel = autoSaveData
      ? `Autozapis: ${autoSaveData.characterClass} Lvl ${autoSaveData.level}`
      : "Autozapis: brak";

    const autoSaveBtn = this.scene.add
      .text(cx, cy + 60, autoSaveLabel, {
        fontSize: "18px",
        color: autoSaveData ? "#ffaa88" : "#aaaaaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.container.add(autoSaveBtn);
  }

  private showConfirm(slot: 1 | 2 | 3 | 4) {
    this.container.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    const bg = this.scene.add
      .rectangle(cx, cy, 300, 180, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.container.add(bg);

    const q = this.scene.add
      .text(cx, cy - 40, `Nadpisać slot ${slot}?`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.container.add(q);

    const yes = this.scene.add
      .text(cx - 60, cy + 40, "Tak", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.performSave(slot);
      });
    this.container.add(yes);

    const no = this.scene.add
      .text(cx + 60, cy + 40, "Nie", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.show(); // wracamy do listy slotów
      });
    this.container.add(no);
  }

  private performSave(slot: 1 | 2 | 3 | 4) {
    const { x, y } = this.scene.player.sprite;
    const saveData: SaveData = {
      x,
      y,
      characterClass: this.scene.characterClass,
      health: this.scene.player.health,
      maxHealth: this.scene.player.maxHealth,
      regenRate: this.scene.player.stats.regenRate,
      level: this.scene.player.level,
      experience: this.scene.player.experience,
      levelPoints: this.scene.player.levelPoints,
      currentStamina: this.scene.player.currentStamina,
      maxStamina: this.scene.player.maxStamina,
      staminaRegenRate: this.scene.player.stats.staminaRegenRate,
      critChance: this.scene.player.critChance,
      critDamageMultiplier: this.scene.player.critDamageMultiplier,
      attackDamage: this.scene.player.stats.attackDamage,
      speed: this.scene.player.stats.speed,
    };
    SaveManager.save(slot, saveData);
    this.show(); // odśwież listę
  }

  public destroy() {
    if (this.escKey) {
      this.escKey.off("down");
      this.scene.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
