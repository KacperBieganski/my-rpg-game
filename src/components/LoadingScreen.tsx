import Phaser from "phaser";

export class LoadingScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private progressBarFill: Phaser.GameObjects.Rectangle | null = null;
  private loadingText: Phaser.GameObjects.Text | null = null;
  private isLoading: boolean = false;
  private isCreated: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.scene.load.off("progress", this.updateProgress, this);
    this.scene.load.off("complete", this.hideLoadingScreen, this);
    this.scene.load.off("loaderror", this.hideLoadingScreen, this);

    this.scene.load.on("progress", this.updateProgress, this);
    this.scene.load.on("complete", this.hideLoadingScreen, this);
    this.scene.load.on("loaderror", this.hideLoadingScreen, this);
  }

  private createLoadingScreen() {
    if (this.isCreated) return;
    this.isCreated = true;

    const { width, height } = this.scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Czarny ekran
    const background = this.scene.add
      .rectangle(centerX, centerY, width, height, 0x000000)
      .setScrollFactor(0)
      .setDepth(10000);

    // Tekst ładowania
    this.loadingText = this.scene.add
      .text(centerX, centerY - 30, "Ładowanie... 0%", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10001);

    // Tło paska postępu
    const progressBarBg = this.scene.add
      .rectangle(centerX, centerY + 30, width * 0.6, 20, 0x333333)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(10001);

    // Wypełnienie paska postępu
    this.progressBarFill = this.scene.add
      .rectangle(centerX - width * 0.3, centerY + 30, 0, 20, 0x4caf50)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(10002);

    this.container = this.scene.add
      .container(0, 0, [
        background,
        this.loadingText,
        progressBarBg,
        this.progressBarFill,
      ])
      .setScrollFactor(0)
      .setDepth(10000);

    this.isLoading = true;
  }

  private updateProgress = (value: number) => {
    if (!this.isLoading || !this.container) {
      this.createLoadingScreen();
    }

    if (this.progressBarFill) {
      const fillWidth = this.scene.cameras.main.width * 0.6 * value;
      this.progressBarFill.setSize(fillWidth, 20);
    }

    if (this.loadingText) {
      this.loadingText.setText(`Ładowanie... ${Math.round(value * 100)}%`);
    }
  };

  private hideLoadingScreen = () => {
    if (!this.isLoading || !this.container) return;

    // Animowane zniknięcie
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.cleanUp();
      },
    });

    this.isLoading = false;
  };

  private cleanUp() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.progressBarFill = null;
    this.loadingText = null;
    this.isCreated = false;
  }

  public destroy() {
    this.scene.load.off("progress", this.updateProgress, this);
    this.scene.load.off("complete", this.hideLoadingScreen, this);
    this.scene.load.off("loaderror", this.hideLoadingScreen, this);
    this.cleanUp();
  }
}
