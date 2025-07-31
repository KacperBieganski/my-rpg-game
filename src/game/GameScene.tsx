import Phaser from "phaser";
import { loadMap } from "./MapLoader";
import { AssetLoader } from "./AssetLoader";
import { createPlayerAnimations } from "./Animations";
import { NPCManager } from "./NPCManager";
import { DefaultGameSettings } from "../game/GameSettings";
import { PlayerFactory } from "./player/PlayerFactory";
import { UIComponent } from "./UIComponent";

export default class GameScene extends Phaser.Scene {
  private player!: import("./player/PlayerBase").PlayerBase;
  private npcManager!: NPCManager;
  private characterClass: "warrior" | "archer" | "lancer" = "warrior";
  private ui!: UIComponent;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { characterClass: "warrior" | "archer" | "lancer" }) {
    if (data?.characterClass) {
      this.characterClass = data.characterClass;
    }
  }

  preload() {
    AssetLoader.preload(this);
    this.load.image("ui_heart", "assets/ui/heart.png");
    this.load.image("ui_level", "assets/ui/level.png");
    this.load.bitmapFont(
      "medievalFont",
      "assets/fonts/medieval.png",
      "assets/fonts/medieval.fnt"
    );
  }

  create() {
    const { map, spawns, elevated1, blocked } = loadMap(this);

    (this as any).elevated1 = elevated1;
    (this as any).blocked = blocked;

    createPlayerAnimations(this);

    this.player = PlayerFactory.createPlayer(
      this,
      DefaultGameSettings.player.position.x,
      DefaultGameSettings.player.position.y,
      this.characterClass
    );

    this.physics.add.collider(this.player.sprite, elevated1);
    this.physics.add.collider(this.player.sprite, blocked);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.npcManager = new NPCManager(this, spawns, this.player);
    this.npcManager.spawnNPCs(10);
    this.physics.add.collider(this.npcManager.getGroup(), elevated1);
    this.physics.add.collider(this.npcManager.getGroup(), blocked);

    // Inicjalizacja UI
    this.ui = new UIComponent(this, this.player);
  }

  update() {
    this.player.update();
    this.npcManager.update();
  }
}
