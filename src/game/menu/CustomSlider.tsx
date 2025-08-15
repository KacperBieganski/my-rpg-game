export class CustomSlider {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private minValue: number;
  private maxValue: number;
  private currentValue: number;

  private sliderBg!: Phaser.GameObjects.Rectangle;
  private sliderFill!: Phaser.GameObjects.Rectangle;
  private sliderHandle!: Phaser.GameObjects.Rectangle;
  private valueText?: Phaser.GameObjects.Text;

  private onChange: (value: number) => void;
  private fillColor: number;
  private bgColor: number;
  private handleColor: number;
  private showValue: boolean;
  private depth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 200,
    height: number = 10,
    minValue: number = 0,
    maxValue: number = 1,
    initialValue: number = 0.5,
    onChange: (value: number) => void,
    options: {
      fillColor?: number;
      bgColor?: number;
      handleColor?: number;
      showValue?: boolean;
      depth?: number;
    } = {}
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.currentValue = initialValue;
    this.onChange = onChange;

    // Domyślne kolory
    this.fillColor = options.fillColor || 0xaaaa77;
    this.bgColor = options.bgColor || 0x555555;
    this.handleColor = options.handleColor || 0xffffff;
    this.showValue = options.showValue || false;
    this.depth = options.depth || 0;

    this.createSlider();
  }

  private createSlider() {
    // Tło suwaka
    this.sliderBg = this.scene.add
      .rectangle(this.x, this.y, this.width, this.height, this.bgColor)
      .setOrigin(0.5)
      .setDepth(this.depth);

    // Wypełnienie suwaka
    const fillWidth = this.calculateFillWidth(this.currentValue);
    this.sliderFill = this.scene.add
      .rectangle(
        this.x - this.width / 2,
        this.y,
        fillWidth,
        this.height,
        this.fillColor
      )
      .setOrigin(0, 0.5)
      .setDepth(this.depth);

    // Przycisk suwaka
    const handleX = this.x - this.width / 2 + fillWidth;
    this.sliderHandle = this.scene.add
      .rectangle(handleX, this.y, 20, this.height * 2, this.handleColor)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ draggable: true, useHandCursor: true })
      .setDepth(this.depth + 1);

    // Tekst wartości (opcjonalny)
    if (this.showValue) {
      this.valueText = this.scene.add
        .text(this.x, this.y + 25, this.getValueText(this.currentValue), {
          fontSize: "16px",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(this.depth);
    }

    // Obsługa przeciągania
    this.scene.input.setDraggable(this.sliderHandle);
    this.sliderHandle.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number) => {
        this.handleDrag(dragX);
      }
    );

    // Obsługa kliknięcia na pasek (przeskoczenie do klikniętej pozycji)
    this.sliderBg
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.handleDrag(pointer.x);
      });
  }

  private handleDrag(dragX: number) {
    // Ogranicz pozycję do zakresu suwaka
    const minX = this.x - this.width / 2;
    const maxX = this.x + this.width / 2;
    const newX = Phaser.Math.Clamp(dragX, minX, maxX);

    // Aktualizuj pozycję przycisku
    this.sliderHandle.x = newX;

    // Aktualizuj wypełnienie
    const fillWidth = newX - minX;
    this.sliderFill.width = fillWidth;

    // Oblicz wartość
    this.currentValue =
      this.minValue +
      ((newX - minX) / this.width) * (this.maxValue - this.minValue);

    // Wywołaj callback
    this.onChange(this.currentValue);

    // Aktualizuj tekst wartości jeśli istnieje
    if (this.valueText) {
      this.valueText.setText(this.getValueText(this.currentValue));
    }
  }

  private calculateFillWidth(value: number): number {
    const normalizedValue =
      (value - this.minValue) / (this.maxValue - this.minValue);
    return normalizedValue * this.width;
  }

  private getValueText(value: number): string {
    // Formatowanie wartości - możesz dostosować do swoich potrzeb
    if (this.maxValue <= 1) {
      return `${Math.round(value * 100)}%`;
    } else {
      return Math.round(value).toString();
    }
  }

  public setValue(value: number) {
    this.currentValue = Phaser.Math.Clamp(value, this.minValue, this.maxValue);
    const fillWidth = this.calculateFillWidth(this.currentValue);
    this.sliderHandle.x = this.x - this.width / 2 + fillWidth;
    this.sliderFill.width = fillWidth;

    if (this.valueText) {
      this.valueText.setText(this.getValueText(this.currentValue));
    }
  }

  public getValue(): number {
    return this.currentValue;
  }

  public destroy() {
    this.sliderBg.destroy();
    this.sliderFill.destroy();
    this.sliderHandle.destroy();
    if (this.valueText) {
      this.valueText.destroy();
    }
  }

  public getGameObjects(): Phaser.GameObjects.GameObject[] {
    const objects = [this.sliderBg, this.sliderFill, this.sliderHandle];

    // if (this.valueText) {
    //   objects.push(this.valueText);
    // }

    return objects;
  }
}
