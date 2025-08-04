import Phaser from "phaser";
import { loadMap } from "./MapLoader";
import { AssetLoader } from "./AssetLoader";
import { createPlayerAnimations, createObjectsAnimations } from "./Animations";
import { NPCManager } from "./NPCManager";
import { DefaultGameSettings } from "../game/GameSettings";
import { PlayerFactory } from "./player/PlayerFactory";
import { UIComponent } from "./UIComponent";
import MainMenu from "./menu/MainMenu";
import ClassSelection from "./menu/ClassSelection";
import InGameMenu from "./menu/InGameMenu";
import { type SaveData } from "../game/SaveManager";

type GameInitData = {
  x: number;
  y: number;
  characterClass: "warrior" | "archer" | "lancer";
  health?: number;
  maxHealth?: number;
  level?: number;
  experience?: number;
};

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
    this.physics.world.drawDebug = true;
    this.physics.world.debugGraphic.clear();

    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.setDepth(9999);
    }

    this.inGameMenu = undefined as any;
    this.setupEventListeners();
    new MainMenu(this);
  }

  private setupEventListeners() {
    this.events.off("toggleGameMenu");
    this.input.keyboard?.off("keydown-ESC");

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

  public startNewGame(characterClass: "warrior" | "archer" | "lancer") {
    const { x, y } = DefaultGameSettings.player.position;
    this.initGame({ x, y, characterClass });
  }

  public loadGame(data: SaveData) {
    this.initGame({
      x: data.x,
      y: data.y,
      characterClass: data.characterClass,
      health: data.health,
      maxHealth: data.maxHealth,
      level: data.level,
      experience: data.experience,
    });
  }

  private initGame(opts: GameInitData) {
    this.children.removeAll();

    this.characterClass = opts.characterClass;
    this.isPaused = false;

    // 1. load map + kolizje
    createObjectsAnimations(this);
    const { map, spawns, collisions } = loadMap(this);
    (this as any).collisions = collisions;

    // 2. stwórz gracza
    createPlayerAnimations(this);
    this.player = PlayerFactory.createPlayer(
      this,
      opts.x,
      opts.y,
      opts.characterClass
    );

    // 3. ustaw staty, jeśli są w opts
    if (opts.health != null) this.player.health = opts.health;
    if (opts.maxHealth != null) this.player.maxHealth = opts.maxHealth;
    if (opts.level != null) this.player.level = opts.level;
    if (opts.experience != null) this.player.experience = opts.experience;

    // 4. fizyka i kamera
    this.physics.add.collider(this.player.sprite, collisions);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const cam = this.cameras.main;
    cam
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .startFollow(this.player.sprite, true, 0.1, 0.1)
      .setRoundPixels(true);

    cam.setZoom(1);

    this.physics.world.createDebugGraphic();
    this.physics.world.drawDebug = true;

    // 5. NPC
    this.npcManager = new NPCManager(this, spawns, this.player);
    this.npcManager.spawnNPCs(5);
    this.physics.add.collider(this.npcManager.getGroup(), collisions);
    this.events.on("npcKilled", (exp: number) =>
      this.player.addExperience(exp)
    );

    // 6. UI
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
    this.inGameMenu = undefined as any;
    this.scene.restart();
  }

  update() {
    if (this.isPaused) return;
    if (this.player && this.player.sprite.active) {
      this.player.update();
    }
    this.npcManager?.update();

    if (this.input.keyboard?.addKey("D").isDown) {
      this.physics.world.debugGraphic.clear();
      this.physics.world.drawDebug = !this.physics.world.drawDebug;
    }
  }
}
