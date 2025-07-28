import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.spritesheet(
      "warrior_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Idle.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "warrior_run",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Run.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );

    this.load.tilemapTiledJSON("level1", "../assets/map1.json");

    this.load.image(
      "landscapes2",
      "/assets/Tiny Swords (Free Pack)/Terrain/Tilemap_color2.png"
    );
    this.load.image(
      "water",
      "/assets/Tiny Swords (Free Pack)/Terrain/Water Background color.png"
    );
    this.load.image(
      "Tower",
      "/assets/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Tower.png"
    );
    this.load.image(
      "House2",
      "/assets/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House2.png"
    );
    this.load.image(
      "House3",
      "/assets/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House3.png"
    );
    this.load.image(
      "House1",
      "/assets/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House1.png"
    );
    this.load.image(
      "trees#1",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree1.png"
    );
    this.load.image(
      "trees#2",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree2.png"
    );
    this.load.image(
      "trees#3",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree3.png"
    );
  }

  create() {
    const map = this.make.tilemap({ key: "level1" });

    // Tilesety — NAZWY MUSZĄ zgadzać się z tym, co masz w .tsx
    const landscapes = map.addTilesetImage("landscapes2", "landscapes2");
    const water = map.addTilesetImage("water", "water");
    const trees1 = map.addTilesetImage("trees#1", "trees#1");
    const trees2 = map.addTilesetImage("trees#2", "trees#2");
    const trees3 = map.addTilesetImage("trees#3", "trees#3");
    const tower = map.addTilesetImage("Tower", "Tower");
    const house1 = map.addTilesetImage("House1", "House1");
    const house2 = map.addTilesetImage("House2", "House2");
    const house3 = map.addTilesetImage("House3", "House3");

    if (
      !landscapes ||
      !water ||
      !trees1 ||
      !trees2 ||
      !trees3 ||
      !tower ||
      !house1 ||
      !house2 ||
      !house3
    ) {
      throw new Error(
        "Brakuje któregoś z tilesetów – sprawdź nazwy w .tsx i .png!"
      );
    }

    // Tworzenie warstw (kolejność zależy od tego, co ma być na wierzchu)
    const blocked = map.createLayer("blocked", [], 0, 0);
    const waterLayer = map.createLayer("water", [water], 0, 0);
    const ground = map.createLayer("ground", [landscapes], 0, 0);
    const ground2 = map.createLayer(
      "ground#2",
      [landscapes, trees1, trees2, trees3, tower, house1, house2, house3],
      0,
      0
    );

    // Kamera i granice świata
    const width = map.widthInPixels;
    const height = map.heightInPixels;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    // Tworzenie gracza
    this.player = this.physics.add.sprite(
      width / 2,
      height / 2,
      "warrior_idle"
    );
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.7);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 60);
    body.setOffset(74, 70);

    const elevated1 = map.createLayer("elevated#1", [landscapes], 0, 0);
    const elevated2 = map.createLayer("elevated#2", [landscapes], 0, 0);
    const decorations = map.createLayer(
      "decorations",
      [trees1, trees2, trees3, tower, house1, house2, house3],
      0,
      0
    );
    const decorations2 = map.createLayer(
      "decorations#2",
      [trees1, trees2, trees3, tower, house1, house2, house3],
      0,
      0
    );

    if (
      !elevated1 ||
      !waterLayer ||
      !decorations ||
      !decorations2 ||
      !blocked
    ) {
      throw new Error("Nie znaleziono warstwy w mapie.");
    }

    // Przykład: kolizje na elevated#1
    blocked.setCollisionByExclusion([-1]);
    elevated1.setCollisionByExclusion([-1]);

    // Animacje
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("warrior_idle", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("warrior_run", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Kolizje
    this.physics.add.collider(this.player, elevated1); // zmień warstwę jeśli chcesz inne kolizje
    this.physics.add.collider(this.player, blocked);

    // Kamera śledzi gracza
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Sterowanie
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    const speed = 200;
    let vx = 0,
      vy = 0;

    if (this.cursors.left.isDown) vx -= 1;
    if (this.cursors.right.isDown) vx += 1;
    if (this.cursors.up.isDown) vy -= 1;
    if (this.cursors.down.isDown) vy += 1;

    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx = (vx / length) * speed;
      vy = (vy / length) * speed;
      this.player.anims.play("run", true);

      // Obracanie postaci w lewo/prawo
      if (vx < 0) this.player.flipX = true;
      else if (vx > 0) this.player.flipX = false;
    } else {
      this.player.anims.play("idle", true);
    }

    this.player.setVelocity(vx, vy);
  }
}
