import Phaser from "phaser";
import { Player } from "./Player";
import { loadMap } from "./MapLoader";
import { createPlayerAnimations } from "./Animations";
import { NPCManager } from "./NPCManager";

interface TileAnimationFrame {
  tileid: number;
  duration: number;
}

interface TileData {
  animation?: TileAnimationFrame[];
  // Możesz dodać inne właściwości kafelka jeśli są potrzebne
}

interface TilesetData {
  tileData: Record<number, TileData>;
  firstgid: number;
  // Inne właściwości tilesetu
}

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcManager!: NPCManager;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.spritesheet(
      "Blue_warrior_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Idle.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Blue_warrior_run",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Run.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Blue_warrior_attack1",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack1.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Blue_warrior_attack2",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack2.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );

    this.load.spritesheet(
      "Red_warrior_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Idle.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Red_warrior_run",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Run.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Red_warrior_attack1",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Attack1.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet(
      "Red_warrior_attack2",
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
    this.load.spritesheet(
      "trees#1",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree1.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "trees#2",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree2.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "trees#3",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree3.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  }

  create() {
    const { map, spawns, elevated1, blocked } = loadMap(this);

    // Animacje
    createPlayerAnimations(this);
    this.initTileAnimations(map);

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

    this.npcManager = new NPCManager(this, spawns, this.player);
    this.npcManager.spawnNPCs(10);
    this.physics.add.collider(this.npcManager.getGroup(), elevated1);
    this.physics.add.collider(this.npcManager.getGroup(), blocked);
  }

  private animatedTiles: {
    tile: Phaser.Tilemaps.Tile;
    frames: { index: number; duration: number }[];
    currentFrame: number;
    elapsed: number;
  }[] = [];

  private initTileAnimations(map: Phaser.Tilemaps.Tilemap) {
    const tilesetNames = ["trees#1", "trees#2", "trees#3"];

    tilesetNames.forEach((tilesetName) => {
      const tileset = map.getTileset(tilesetName) as Phaser.Tilemaps.Tileset &
        TilesetData;

      if (tileset?.tileData) {
        Object.entries(tileset.tileData).forEach(([tileIdStr, tileData]) => {
          const tileId = parseInt(tileIdStr);

          if (tileData?.animation) {
            const frames = tileData.animation.map((frame) => ({
              index: frame.tileid + tileset.firstgid,
              duration: frame.duration,
            }));

            // Find all tiles using this animation
            map.layers.forEach((layer) => {
              if (layer.tilemapLayer) {
                layer.tilemapLayer.forEachTile((tile) => {
                  if (tile.index === tileId + tileset.firstgid) {
                    this.animatedTiles.push({
                      tile,
                      frames,
                      currentFrame: 0,
                      elapsed: 0,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  update() {
    this.player.update();
    this.npcManager.update();

    const delta = this.game.loop.delta;
    let needsRedraw = false;

    this.animatedTiles.forEach((animatedTile) => {
      animatedTile.elapsed += delta;

      if (
        animatedTile.elapsed >=
        animatedTile.frames[animatedTile.currentFrame].duration
      ) {
        animatedTile.elapsed = 0;
        animatedTile.currentFrame =
          (animatedTile.currentFrame + 1) % animatedTile.frames.length;
        animatedTile.tile.index =
          animatedTile.frames[animatedTile.currentFrame].index;
        needsRedraw = true;
      }
    });

    // Force redraw if any tiles changed
    if (needsRedraw) {
      this.events.emit("tileanimationupdate");
    }
  }
}
