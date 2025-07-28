import Phaser from "phaser";
import { Player } from "./Player";
import { loadMap } from "./MapLoader";
import { createPlayerAnimations } from "./animations";
import { NPCManager } from "./NPCManager";

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcManager!: NPCManager;

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
    this.load.spritesheet(
      "warrior_attack1",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Attack1.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "warrior_attack2",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Attack2.png",
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
    const { map, spawns, elevated1, blocked } = loadMap(this);

    // Animacje
    createPlayerAnimations(this);

    // Player
    this.player = new Player(
      this,
      map.widthInPixels / 2,
      map.heightInPixels / 2
    );

    // Kolizje
    this.physics.add.collider(this.player.sprite, elevated1);
    this.physics.add.collider(this.player.sprite, blocked);

    // Kamera
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.npcManager = new NPCManager(this, spawns);
    this.npcManager.spawnNPCs(10);
    this.physics.add.collider(this.npcManager.getGroup(), elevated1);
    this.physics.add.collider(this.npcManager.getGroup(), blocked);
  }

  update() {
    this.player.update();
    this.npcManager.update();
  }
}
