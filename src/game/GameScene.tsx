import Phaser from "phaser";
import { loadMap } from "./MapLoader";
import { AssetLoader } from "./AssetLoader";
import { createPlayerAnimations } from "./Animations";
import { NPCManager } from "./NPCManager";
import { DefaultGameSettings } from "../game/GameSettings";
import { PlayerFactory } from "./player/PlayerFactory";
import { UIComponent } from "./UIComponent";
import MainMenu from "./menu/MainMenu";
import ClassSelection from "./menu/ClassSelection";
import InGameMenu from "./menu/InGameMenu";

export default class GameScene extends Phaser.Scene {
  public player!: import("./player/PlayerBase").PlayerBase;
  public npcManager!: NPCManager;
  public characterClass: "warrior" | "archer" | "lancer" = "warrior";
  public ui!: UIComponent;
  public inGameMenu!: InGameMenu;
  public isPaused: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    AssetLoader.preload(this);
    MainMenu.preload(this);
    ClassSelection.preload(this);
  }

  create() {
    new MainMenu(this);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.events.on("toggleGameMenu", () => {
      if (!this.inGameMenu) {
        this.inGameMenu = new InGameMenu(this);
      } else {
        this.inGameMenu.toggle();
      }
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      this.events.emit("toggleGameMenu");
    });
  }

  startGame(characterClass: "warrior" | "archer" | "lancer") {
    this.characterClass = characterClass;
    this.isPaused = false;

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
    this.cameras.main.setFollowOffset(0, 0);
    this.cameras.main.setRoundPixels(true);

    this.npcManager = new NPCManager(this, spawns, this.player);
    this.npcManager.spawnNPCs(0);
    this.physics.add.collider(this.npcManager.getGroup(), elevated1);
    this.physics.add.collider(this.npcManager.getGroup(), blocked);

    this.events.on("npcKilled", (exp: number) => {
      this.player.addExperience(exp);
    });

    this.ui = new UIComponent(this, this.player);
  }

  togglePause(state: boolean) {
    this.isPaused = state;
    if (state) {
      this.physics.pause();
      this.anims.pauseAll();
    } else {
      this.physics.resume();
      this.anims.resumeAll();
    }
  }

  destroyGame() {
    this.player?.destroy();
    this.ui?.destroy();
    this.physics.world?.destroy();
    this.children.removeAll();
    this.input.keyboard?.off("keydown-ESC");
    new MainMenu(this);
  }

  update() {
    if (this.isPaused) return;
    this.player?.update();
    this.npcManager?.update();
  }
}
