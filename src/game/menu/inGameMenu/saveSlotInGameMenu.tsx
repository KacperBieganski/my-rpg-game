import Phaser from "phaser";
import GameScene from "../../GameScene";
import { SaveManager, type SaveData } from "../../SaveManager";

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
      //.setStrokeStyle(2, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);
    const title = this.scene.add
      .text(cx, cy - 110, "Wybierz slot zapisu", {
        fontFamily: "KereruBold",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.container.add([bg, title]);

    // sloty
    const slots = [1, 2, 3, 4] as const;
    slots.forEach((slot, i) => {
      const data = SaveManager.load(slot);
      let label: string;
      if (data && data.timestamp) {
        const formattedDate = this.formatTimestamp(data.timestamp);
        label = `Slot ${slot}: ${data.characterClass} Lvl ${data.stats.level} (${formattedDate})`;
      } else {
        label = `Slot ${slot}: pusty`;
      }

      const btn = this.scene.add
        .text(cx, cy - 50 + i * 40, label, {
          fontFamily: "Kereru",
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
    let autoSaveLabel: string;
    if (autoSaveData && autoSaveData.timestamp) {
      const level = autoSaveData.stats?.level ?? "?";
      const formattedDate = this.formatTimestamp(autoSaveData.timestamp);
      autoSaveLabel = `Autozapis: ${autoSaveData.characterClass} Lvl ${level} (${formattedDate})`;
    } else {
      autoSaveLabel = "Autozapis: brak";
    }

    const autoSaveBtn = this.scene.add
      .text(cx, cy + 110, autoSaveLabel, {
        fontFamily: "Kereru",
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

    const q = this.scene.add
      .text(cx, cy - 40, `Nadpisać slot ${slot}?`, {
        fontFamily: "Kereru",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.container.add(q);

    const yes = this.scene.add
      .text(cx - 60, cy + 40, "Tak", {
        fontFamily: "Kereru",
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
        fontFamily: "Kereru",
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
      stats: {
        health: this.scene.player.stats.health,
        maxHealth: this.scene.player.stats.maxHealth,
        maxStamina: this.scene.player.stats.maxStamina,
        currentStamina: this.scene.player.stats.currentStamina,
        attackDamage: this.scene.player.stats.attackDamage,
        speed: this.scene.player.stats.speed,
        regenRate: this.scene.player.stats.regenRate,
        staminaRegenRate: this.scene.player.stats.staminaRegenRate,
        critChance: this.scene.player.stats.critChance,
        critDamageMultiplier: this.scene.player.stats.critDamageMultiplier,
        level: this.scene.player.stats.level,
        experience: this.scene.player.stats.experience,
        levelPoints: this.scene.player.stats.levelPoints,
        gold: this.scene.player.stats.gold,
        regenDelay: 0,
        staminaRegenDelay: 0,
        nextLevelExp: 0,
      },
      inventory: this.scene.player.itemManager.inventory,
      equippedItems: this.scene.player.itemManager.equippedItems,
    };
    SaveManager.save(slot, saveData);
    this.show(); // odśwież listę
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    // Format: DD.MM.YYYY HH:MM
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
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
