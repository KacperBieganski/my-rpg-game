import Phaser from "phaser";

export interface TooltipConfig {
  title: string;
  description: string;
  titleColor?: string;
  backgroundColor?: number;
  backgroundAlpha?: number;
  strokeColor?: number;
  fontFamily?: string;
  titleFontSize?: string;
  descriptionFontSize?: string;
}

export class Tooltip {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(30000)
      .setScrollFactor(0)
      .setVisible(false);
  }

  show(config: TooltipConfig, x: number, y: number) {
    this.hide();
    this.visible = true;

    const {
      title,
      description,
      titleColor = "#ffffff",
      backgroundColor = 0x000000,
      backgroundAlpha = 1,
      strokeColor = 0xaaaa77,
      fontFamily = "Kereru",
      titleFontSize = "18px",
      descriptionFontSize = "14px",
    } = config;

    const descriptionLines = description.split("\n");

    // Tworzymy tymczasowe teksty do pomiaru
    const nameText = this.scene.add.text(0, 0, title, {
      fontFamily: fontFamily + "Bold",
      fontSize: titleFontSize,
    });

    let maxWidth = nameText.width;
    const lineHeight = 20;

    // Zmierz każdą linię opisu
    descriptionLines.forEach((line: string) => {
      if (line.trim()) {
        const lineText = this.scene.add.text(0, 0, line, {
          fontFamily,
          fontSize: descriptionFontSize,
        });
        maxWidth = Math.max(maxWidth, lineText.width);
        lineText.destroy();
      }
    });

    // Oblicz całkowitą wysokość
    const nameHeight = 30;
    const nonEmptyLines = descriptionLines.filter((line: string) =>
      line.trim()
    );
    const descriptionHeight = nonEmptyLines.length * lineHeight;
    const padding = 20;
    const tooltipHeight = nameHeight + descriptionHeight + padding;

    const tooltipWidth = Math.max(maxWidth + 30, 150);

    // Zniszcz tymczasowe teksty
    nameText.destroy();

    const tooltipBg = this.scene.add
      .rectangle(
        0,
        0,
        tooltipWidth,
        tooltipHeight,
        backgroundColor,
        backgroundAlpha
      )
      .setStrokeStyle(2, strokeColor, 1)
      .setOrigin(0, 0);

    // Tytuł
    const titleText = this.scene.add
      .text(15, 15, title, {
        fontFamily: fontFamily + "Bold",
        fontSize: titleFontSize,
        color: titleColor,
      })
      .setOrigin(0, 0);

    this.container.add([tooltipBg, titleText]);

    // Opis
    let descriptionY = 40;
    descriptionLines.forEach((line: string) => {
      if (line.trim()) {
        const descriptionLine = this.scene.add
          .text(15, descriptionY, line, {
            fontFamily,
            fontSize: descriptionFontSize,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2,
          })
          .setOrigin(0, 0);

        this.container.add(descriptionLine);
        descriptionY += lineHeight;
      }
    });

    this.updatePosition(x, y);
    this.container.setVisible(true);
  }

  hide() {
    this.visible = false;
    this.container.setVisible(false);
    this.container.removeAll(true);
  }

  updatePosition(pointerX: number, pointerY: number) {
    if (!this.visible || this.container.list.length === 0) return;

    const tooltipBg = this.container.list[0] as Phaser.GameObjects.Rectangle;
    const tooltipWidth = tooltipBg.width;
    const tooltipHeight = tooltipBg.height;

    const { width: screenWidth, height: screenHeight } =
      this.scene.cameras.main;

    let tooltipX = pointerX + 10;
    let tooltipY = pointerY + 10;

    if (tooltipX + tooltipWidth > screenWidth) {
      tooltipX = pointerX - tooltipWidth - 10;
    }

    if (tooltipY + tooltipHeight > screenHeight) {
      tooltipY = pointerY - tooltipHeight - 10;
    }

    if (tooltipX < 0) {
      tooltipX = 10;
    }

    if (tooltipY < 0) {
      tooltipY = 10;
    }

    this.container.setPosition(tooltipX, tooltipY);
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy() {
    this.container.destroy();
  }
}
