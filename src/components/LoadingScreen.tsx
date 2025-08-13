import Phaser from "phaser";

export class LoadingScreen {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private progressBarFill!: Phaser.GameObjects.Rectangle;
  private loadingText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create() {
    const { width, height } = this.scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Czarny ekran
    const background = this.scene.add
      .rectangle(centerX, centerY, width, height, 0x000000)
      .setDepth(1000);

    // Tekst ładowania
    this.loadingText = this.scene.add
      .text(centerX, centerY - 30, "Ładowanie...", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(1001);

    // Tło paska postępu
    const progressBarBg = this.scene.add
      .rectangle(centerX, centerY + 30, width * 0.6, 20, 0x333333)
      .setOrigin(0.5, 0.5)
      .setDepth(1001);

    // Wypełnienie paska postępu
    this.progressBarFill = this.scene.add
      .rectangle(centerX - width * 0.3, centerY + 30, 0, 20, 0x4caf50)
      .setOrigin(0, 0.5)
      .setDepth(1002);

    this.container = this.scene.add
      .container(0, 0, [
        background,
        this.loadingText,
        progressBarBg,
        this.progressBarFill,
      ])
      .setDepth(1000);

    // Rejestracja eventów ładowania
    this.scene.load.on("progress", this.updateProgressBar, this);
    this.scene.load.on("complete", this.complete, this);
  }

  private updateProgressBar(value: number) {
    const fillWidth = this.scene.cameras.main.width * 0.6 * value;
    this.progressBarFill.setSize(fillWidth, 20);

    // Aktualizacja tekstu z procentami
    this.loadingText.setText(`Ładowanie... ${Math.round(value * 100)}%`);
  }

  private complete() {
    // Oczyszczenie eventów
    this.scene.load.off("progress", this.updateProgressBar, this);
    this.scene.load.off("complete", this.complete, this);

    // Animowane zniknięcie ekranu ładowania
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.container.destroy();
      },
    });
  }

  public destroy() {
    this.container.destroy();
  }
}
