import Phaser from "phaser";
import { generateClusteredMap } from "../components/generateClusteredMap";
import type {
  PolygonDef,
  NaturalConfig,
} from "../components/generateClusteredMap";

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  private worldW = 1280;
  private worldH = 1280;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("player", "/src/assets/player.png");
  }

  create() {
    // 1) Świat i kamera
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

    // 2) tło
    const bg = this.add.graphics();
    bg.fillStyle(0xdddddd, 1);
    bg.fillRect(0, 0, this.worldW, this.worldH);

    // 3) konfiguracja kamieni i jezior
    const configs: NaturalConfig[] = [
      {
        type: 1,
        count: 40,
        minRadius: 16,
        maxRadius: 64,
        points: 8,
        irregularity: 0.5,
      },
      {
        type: 2,
        count: 8,
        minRadius: 64,
        maxRadius: 160,
        points: 12,
        irregularity: 0.3,
      },
    ];

    // 4) generujemy kształty
    const shapes: PolygonDef[] = generateClusteredMap(
      this.worldW,
      this.worldH,
      configs
    );

    // 5) rysowanie i kolizje
    this.obstacles = this.physics.add.staticGroup();
    const g = this.add.graphics();

    for (const s of shapes) {
      // dobór koloru
      const color = s.type === 1 ? 0x666666 : 0x3366cc;
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        g.lineTo(s.points[i].x, s.points[i].y);
      }
      g.closePath();
      g.fillPath();

      // prostokątne ciało kolizji (przybliżenie)
      const { x0, y0, x1, y1 } = s.bbox;
      const rect = this.add
        .rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0)
        .setOrigin(0.5)
        .setVisible(false);
      this.obstacles.add(rect, true);
    }

    // 6) gracz
    this.player = this.physics.add
      .sprite(this.worldW / 2, this.worldH / 2, "player")
      .setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.obstacles);

    // 7) kamera śledzi
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 8) sterowanie
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    const speed = 200;
    let vx = 0,
      vy = 0;
    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;
    this.player.setVelocity(vx, vy);
  }
}
