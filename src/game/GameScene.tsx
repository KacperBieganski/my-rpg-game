import Phaser from "phaser";
import { Player } from "./Player";
import { loadMap } from "./MapLoader";
import { AssetLoader } from "./AssetLoader";
import { createPlayerAnimations } from "./Animations";
import { NPCManager } from "./NPCManager";

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcManager!: NPCManager;
  private characterClass: "warrior" | "archer" = "warrior";

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { characterClass: "warrior" | "archer" }) {
    if (data && data.characterClass) {
      this.characterClass = data.characterClass;
    }
  }

  preload() {
    AssetLoader.preload(this);
  }

  create() {
    const { map, spawns, elevated1, blocked } = loadMap(this);

    // Animacje
    createPlayerAnimations(this);

    // Player
    this.player = new Player(
      this,
      map.widthInPixels / 2,
      map.heightInPixels / 2,
      this.characterClass
    );

    // Kolizje
    this.physics.add.collider(this.player.sprite, elevated1);
    this.physics.add.collider(this.player.sprite, blocked);

    // Kamera
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.npcManager = new NPCManager(this, spawns, this.player);
    this.npcManager.spawnNPCs(10);
    this.physics.add.collider(this.npcManager.getGroup(), elevated1);
    this.physics.add.collider(this.npcManager.getGroup(), blocked);
  }

  update() {
    this.player.update();
    this.npcManager.update();
  }
}
