import Phaser from "phaser";
import GameScene from "../GameScene";
import SaveSlotMenu from "./SaveSlotMenu";

export default class InGameMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;
  private isVisible = false;
  private SaveSlotMenu: SaveSlotMenu;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.SaveSlotMenu = new SaveSlotMenu(scene, () => this.show());
    this.createContainer();
    this.hide();
  }

  private createContainer() {
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(10000)
      .setScrollFactor(0);
  }

  private buildMainMenu(centerX: number, centerY: number) {
    const bg = this.scene.add
      .rectangle(centerX, centerY, 300, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const title = this.scene.add
      .text(centerX, centerY - 80, "Menu Gry", {
        fontSize: "25px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const resumeBtn = this.scene.add
      .text(centerX, centerY - 20, "Wznów grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const saveBtn = this.scene.add
      .text(centerX, centerY + 30, "Zapisz grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.SaveSlotMenu.show();
      });

    const mainMenuBtn = this.scene.add
      .text(centerX, centerY + 80, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.showConfirmReturn());

    this.menuContainer.add([bg, title, resumeBtn, saveBtn, mainMenuBtn]);
  }

  public show() {
    this.menuContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.buildMainMenu(cx, cy);
    this.menuContainer.setVisible(true);
    this.scene.togglePause(true);
    this.isVisible = true;
  }

  public hide() {
    this.menuContainer.setVisible(false);
    this.scene.togglePause(false);
    this.isVisible = false;
  }

  public toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  private showConfirmReturn() {
    // wyczyść wszystko
    this.menuContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło okna
    const bg = this.scene.add
      .rectangle(cx, cy, 500, 200, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setScrollFactor(0);

    // pytanie
    const question = this.scene.add
      .text(
        cx,
        cy - 50,
        "Niezapisany postęp zostanie utracony.\nNa pewno wrócić do menu głównego?",
        {
          fontSize: "18px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // „Tak” – powrót do głównego menu
    const yesBtn = this.scene.add
      .text(cx - 110, cy + 40, "Tak", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.scene.destroyGame();
      });

    // „Zapisz grę” – otwórz zapis
    const saveBtn = this.scene.add
      .text(cx, cy + 40, "Zapisz grę", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.SaveSlotMenu.show();
      });

    // „Nie” – wróć do menu pauzy
    const noBtn = this.scene.add
      .text(cx + 110, cy + 40, "Nie", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.show();
      });

    this.menuContainer.add([bg, question, yesBtn, saveBtn, noBtn]);
  }

  public destroy() {
    this.SaveSlotMenu.destroy();
    this.menuContainer.destroy();
  }
}
