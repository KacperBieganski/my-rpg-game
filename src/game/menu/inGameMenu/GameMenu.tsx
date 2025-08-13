import Phaser from "phaser";
import GameScene from "../../GameScene";
import saveSlotInGameMenu from "./saveSlotInGameMenu";
import optionsInGameMenu from "./optionsInGameMenu";

export default class GameMenu {
  private scene: GameScene;
  private menuContainer!: Phaser.GameObjects.Container;
  private exitConfirmContainer!: Phaser.GameObjects.Container;
  public saveSlotInGameMenu!: saveSlotInGameMenu;
  public optionsInGameMenu!: optionsInGameMenu;
  private onResume?: () => void;

  constructor(scene: GameScene, onResume?: () => void) {
    this.scene = scene;
    this.onResume = onResume;
    this.createContainer();
    this.hide();
    this.saveSlotInGameMenu = new saveSlotInGameMenu(scene);
    this.optionsInGameMenu = new optionsInGameMenu(scene);
  }

  private createContainer() {
    this.menuContainer = this.scene.add
      .container(0, 0)
      .setDepth(20000)
      .setScrollFactor(0);

    this.exitConfirmContainer = this.scene.add
      .container(169, 0)
      .setDepth(20000)
      .setScrollFactor(0)
      .setVisible(false);
  }

  private buildMainMenu(centerX: number, centerY: number) {
    const bg = this.scene.add
      .rectangle(centerX, centerY + 38, 1024, 500, 0x000000)
      .setStrokeStyle(2, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setScrollFactor(0);

    const resumeBtn = this.scene.add
      .text(centerX - 350, centerY - 100, "Wznów grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })

      .on("pointerdown", () => {
        if (this.onResume) {
          this.onResume();
        } else {
          this.scene.events.emit("toggleGameMenu");
        }
      });

    const saveBtn = this.scene.add
      .text(centerX - 345, centerY - 50, "Zapisz grę", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.saveSlotInGameMenu.show();
        this.optionsInGameMenu.hide();
        this.hideExitConfirmContainer();
      });

    const optionBtn = this.scene.add
      .text(centerX - 375, centerY, "Opcje", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.optionsInGameMenu.show();
        this.saveSlotInGameMenu.hide();
        this.hideExitConfirmContainer();
      });

    const mainMenuBtn = this.scene.add
      .text(centerX - 338, centerY + 50, "Menu główne", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.saveSlotInGameMenu.hide();
        this.optionsInGameMenu.hide();
        this.showExitConfirmContainer();
      });

    this.menuContainer.add([bg, resumeBtn, saveBtn, optionBtn, mainMenuBtn]);
  }

  public show() {
    if (!this.menuContainer) return;
    this.menuContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.buildMainMenu(cx, cy);
    this.menuContainer.setVisible(true);
  }

  public hide() {
    if (this.menuContainer) this.menuContainer.setVisible(false);
    if (this.exitConfirmContainer) this.exitConfirmContainer.setVisible(false);
    if (this.saveSlotInGameMenu) this.saveSlotInGameMenu.hide();
    if (this.optionsInGameMenu) this.optionsInGameMenu.hide();
  }

  private showConfirmReturn() {
    this.exitConfirmContainer.removeAll(true);

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // tło okna
    const bg = this.scene.add
      .rectangle(cx, cy + 38, 683, 500)
      //.setStrokeStyle(2, 0xffffff)
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
      .text(cx - 80, cy + 40, "Tak", { fontSize: "18px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.hide();
        this.scene.destroyGame();
      });

    // „Zapisz grę” – otwórz zapis
    const saveBtn = this.scene.add
      .text(cx + 50, cy + 40, "Zapisz grę", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.saveSlotInGameMenu.show();
        this.optionsInGameMenu.hide();
        this.hideExitConfirmContainer();
      });

    this.exitConfirmContainer.add([bg, question, yesBtn, saveBtn]);
  }

  public showExitConfirmContainer() {
    if (!this.exitConfirmContainer) return;
    this.showConfirmReturn();
    this.exitConfirmContainer.setVisible(true);
  }

  public hideExitConfirmContainer() {
    if (this.exitConfirmContainer) {
      this.exitConfirmContainer.setVisible(false);
    }
  }

  public destroy() {
    this.saveSlotInGameMenu.destroy();
    this.optionsInGameMenu.destroy();
    this.menuContainer.destroy();
    this.exitConfirmContainer.destroy();
  }
}
