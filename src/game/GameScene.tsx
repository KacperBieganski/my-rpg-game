import Phaser from "phaser";
import { LoadingScreen } from "../components/LoadingScreen";
import { loadMap } from "./MapLoader";
import { AssetLoader } from "./AssetLoader";
import { GameState } from "./GameState";
import { createPlayerAnimations, createObjectsAnimations } from "./Animations";
import { NpcManager } from "./npc/NpcManager";
import { DefaultGameSettings } from "../game/GameSettings";
import { PlayerFactory } from "./player/PlayerFactory";
import { UIComponent } from "./UI/UIComponent";
import MainMenu from "./menu/mainMenu/MainMenu";
import ClassSelection from "./menu/mainMenu/ClassSelection";
import InGameMenu from "./menu/inGameMenu/InGameMenu";
import StatsMenu from "./menu/inGameMenu/StatsMenu";
import { type SaveData } from "../game/SaveManager";
import { MusicManager } from "./MusicManager";

type GameInitData = {
  x: number;
  y: number;
  characterClass: "warrior" | "archer" | "lancer";
  health?: number;
  maxHealth?: number;
  regenRate?: number;
  level?: number;
  experience?: number;
  levelPoints?: number;
  currentStamina?: number;
  maxStamina?: number;
  staminaRegenRate?: number;
  critChance?: number;
  critDamageMultiplier?: number;
  attackDamage?: number;
  speed?: number;
};

export default class GameScene extends Phaser.Scene {
  public currentState: GameState = GameState.MAIN_MENU;
  public player!: import("./player/PlayerBase").PlayerBase;

  public npcManager!: NpcManager;
  public characterClass: "warrior" | "archer" | "lancer" = "warrior";
  public ui!: UIComponent;
  public inGameMenu!: InGameMenu;
  public statsMenu!: StatsMenu;
  public isPaused: boolean = false;
  private depthSortedGroup: Phaser.GameObjects.Group | null = null;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    new LoadingScreen(this);

    AssetLoader.preload(this);
    MainMenu.preload(this);
    ClassSelection.preload(this);
  }

  create() {
    this.physics.world.drawDebug = true;
    this.physics.world.debugGraphic.clear();

    this.setupEventListeners();
    new MainMenu(this);
  }

  private setupEventListeners() {
    this.input.keyboard?.off("keydown-ESC");
    this.events.off("toggleGameMenu");

    this.input.keyboard?.on("keydown-ESC", () => {
      this.events.emit("toggleGameMenu");
    });

    this.events.on("toggleGameMenu", () => {
      if (this.currentState === GameState.IN_GAME) {
        this.openPauseMenu("GS");
      } else if (this.currentState === GameState.IN_PAUSE_MENU) {
        this.closePauseMenu();
      }
    });
  }

  public startNewGame(characterClass: "warrior" | "archer" | "lancer") {
    MusicManager.getInstance().playPlaylist(this, [
      "medieval-ambient-1",
      "medieval-ambient-2",
      "medieval-ambient-3",
    ]);

    const { x, y } = DefaultGameSettings.player.position;
    this.initGame({ x, y, characterClass });
  }

  public loadGame(data: SaveData) {
    MusicManager.getInstance().playPlaylist(this, [
      "medieval-ambient-1",
      "medieval-ambient-2",
      "medieval-ambient-3",
    ]);
    this.initGame({
      x: data.x,
      y: data.y,
      characterClass: data.characterClass,
      health: data.health,
      maxHealth: data.maxHealth,
      regenRate: data.regenRate,
      level: data.level,
      experience: data.experience,
      levelPoints: data.levelPoints,
      currentStamina: data.currentStamina,
      maxStamina: data.maxStamina,
      staminaRegenRate: data.staminaRegenRate,
      critChance: data.critChance,
      critDamageMultiplier: data.critDamageMultiplier,
      attackDamage: data.attackDamage,
      speed: data.speed,
    });
  }

  private initGame(opts: GameInitData) {
    this.children.removeAll();

    new LoadingScreen(this);

    this.characterClass = opts.characterClass;
    this.isPaused = false;

    this.depthSortedGroup = this.add.group();

    // 1. load map + kolizje
    createObjectsAnimations(this);
    const { map, collisions, spritesToSort, spawnObjects } = loadMap(this);
    (this as any).collisions = collisions;

    // 2. stwórz gracza
    createPlayerAnimations(this);
    this.player = PlayerFactory.createPlayer(
      this,
      opts.x,
      opts.y,
      opts.characterClass
    );
    this.depthSortedGroup.add(this.player.sprite);
    this.player.sprite.setData("sortY", this.player.sprite.y);

    spritesToSort.forEach((sprite) => {
      this.depthSortedGroup?.add(sprite);
    });

    // 3. ustaw staty, jeśli są w opts
    if (opts.health != null) this.player.health = opts.health;
    if (opts.maxHealth != null) {
      (this.player as any).levelManager["maxHealth"] = opts.maxHealth;
    }
    if (opts.regenRate != null) this.player.stats.regenRate = opts.regenRate;
    if (opts.level != null) {
      (this.player as any).levelManager["level"] = opts.level;
      // Oblicz nextLevelExp na podstawie poziomu
      let nextExp = 100;
      for (let i = 1; i < opts.level; i++) {
        nextExp = Math.floor(nextExp * 1.2);
      }
      (this.player as any).levelManager["nextLevelExp"] = nextExp;
    }
    if (opts.experience != null) {
      (this.player as any).levelManager["experience"] = opts.experience;
    }
    if (opts.currentStamina != null)
      this.player.currentStamina = opts.currentStamina;
    if (opts.levelPoints != null) this.player.levelPoints = opts.levelPoints;
    if (opts.maxStamina != null) this.player.maxStamina = opts.maxStamina;
    if (opts.staminaRegenRate != null)
      this.player.stats.staminaRegenRate = opts.staminaRegenRate;
    if (opts.critChance != null) this.player.critChance = opts.critChance;
    if (opts.critDamageMultiplier != null)
      this.player.critDamageMultiplier = opts.critDamageMultiplier;
    if (opts.attackDamage != null)
      this.player.stats.attackDamage = opts.attackDamage;
    if (opts.speed != null) this.player.stats.speed = opts.speed;

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
    // Przekazujemy obiekty spawnu do NPCManager
    this.npcManager = new NpcManager(this, this.player, spawnObjects);
    this.npcManager.spawnNPCs();
    this.physics.add.collider(this.npcManager.getGroup(), collisions);
    this.events.on("npcKilled", (exp: number) =>
      this.player.addExperience(exp)
    );

    // 6. UI
    this.ui = new UIComponent(this, this.player);

    this.currentState = GameState.IN_GAME;
  }

  public openPauseMenu(name: string) {
    const tab = name === "GS" ? "menu" : "stats";

    if (!this.inGameMenu) {
      this.inGameMenu = new InGameMenu(this, tab, this.player);
    } else {
      this.inGameMenu.show(tab);
    }
  }

  private closePauseMenu() {
    if (this.inGameMenu) {
      this.inGameMenu.hide();
    }
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

  update() {
    if (this.isPaused) return;

    // Aktualizacja depth sorting dla wszystkich obiektów
    const updateDepth = (obj: Phaser.GameObjects.GameObject) => {
      if (!obj || !obj.active) return;

      const sprite = obj as Phaser.GameObjects.Sprite;
      if (sprite && sprite.setDepth && typeof sprite.y === "number") {
        const sortY = sprite.getData("sortY") ?? sprite.y;
        sprite.setDepth(sortY);
      }
    };

    // Aktualizacja gracza
    if (this.player?.sprite?.active) {
      this.player.sprite.setData("sortY", this.player.sprite.y);
      updateDepth(this.player.sprite);
    }

    // Aktualizacja NPC
    if (this.npcManager?.getGroup()) {
      const npcGroup = this.npcManager.getGroup();
      if (npcGroup) {
        npcGroup.getChildren().forEach(updateDepth);
      }
    }

    // Aktualizacja innych obiektów
    if (this.depthSortedGroup) {
      this.depthSortedGroup.getChildren().forEach(updateDepth);
    }

    // Standardowe update'y
    if (this.player && this.player.sprite.active) {
      this.player.update();
    }
    this.player?.update();
    this.npcManager?.update();
  }

  public getDepthSortedGroup(): Phaser.GameObjects.Group {
    return this.depthSortedGroup!;
  }

  destroyGame() {
    // Clean up all game objects and references
    if (this.inGameMenu) {
      this.inGameMenu.destroy();
      this.inGameMenu = undefined as any;
    }

    if (this.ui) {
      this.ui.destroy();
      this.ui = undefined as any;
    }

    if (this.npcManager) {
      this.npcManager.destroy();
      this.npcManager = undefined as any;
    }

    if (this.player) {
      this.player.destroy();
      this.player = undefined as any;
    }

    if (this.depthSortedGroup) {
      this.depthSortedGroup.destroy();
      this.depthSortedGroup = null;
    }

    // Clear all physics objects
    this.physics.world.shutdown();

    // Remove all event listeners
    this.events.off("toggleGameMenu");
    this.input.keyboard?.off("keydown-ESC");
    this.events.off("npcKilled");

    // Restart the scene
    this.scene.restart();
  }
}
