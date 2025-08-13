import Phaser from "phaser";
import GameScene from "../../GameScene";

type NavbarCallbacks = {
  onMenu: () => void;
  onStats: () => void;
};

export default class Navbar {
  private scene: GameScene;
  private callbacks: NavbarCallbacks;
  private background!: Phaser.GameObjects.Rectangle;
  private backgroundImage!: Phaser.GameObjects.TileSprite;
  private menuButton!: Phaser.GameObjects.Text;
  private statsButton!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Triangle;
  private currentSelection: "menu" | "stats" = "menu";

  constructor(scene: GameScene, callbacks: NavbarCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.hide();
  }

  public show(selectedTab: "menu" | "stats" = "menu") {
    this.hide();
    this.currentSelection = selectedTab;

    const cam = this.scene.cameras.main;
    const cx = cam.centerX;
    const cy = cam.centerY - 250;

    this.backgroundImage = this.scene.add
      .tileSprite(cx, cy, 1024, 75, "background1")
      .setOrigin(0.5)
      .setDepth(29999)
      .setScrollFactor(0)
      .setTileScale(2, 2);

    this.background = this.scene.add
      .rectangle(cx, cy, 1024, 75, 0x000000, 0.5)
      .setStrokeStyle(5, 0xaaaa77, 1)
      .setOrigin(0.5)
      .setDepth(29999)
      .setScrollFactor(0);

    this.menuButton = this.scene.add
      .text(cx - 70, cy, "Menu", {
        fontSize: "24px",
        color: this.currentSelection === "menu" ? "#ffff00" : "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(30000)
      .setScrollFactor(0)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.callbacks.onMenu();
      });

    this.statsButton = this.scene.add
      .text(cx + 30, cy, "Postać", {
        fontSize: "24px",
        color: this.currentSelection === "stats" ? "#ffff00" : "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(30000)
      .setScrollFactor(0)
      .setInteractive({
        useHandCursor: true,
      })
      .on("pointerdown", () => {
        this.callbacks.onStats();
      });

    // Dodanie trójkątnej strzałki
    const arrowY = cy + 20;
    const arrowX =
      this.currentSelection === "menu"
        ? cx - 70 + this.menuButton.width / 2
        : cx + 30 + this.statsButton.width / 2;

    this.arrow = this.scene.add
      .triangle(arrowX, arrowY, 0, 0, 10, 0, 5, 10, 0xffff00)
      .setDepth(30000)
      .setScrollFactor(0);
  }

  public updateSelection(selectedTab: "menu" | "stats") {
    if (this.currentSelection !== selectedTab) {
      this.currentSelection = selectedTab;
      this.show(selectedTab); // Przerysuj navbar z nowym wyborem
    }
  }

  public hide() {
    if (this.menuButton) this.menuButton.destroy();
    if (this.statsButton) this.statsButton.destroy();
    if (this.background) this.background.destroy();
    if (this.backgroundImage) this.backgroundImage.destroy();
    if (this.arrow) this.arrow.destroy();
  }

  public destroy() {
    this.hide();
  }
}
