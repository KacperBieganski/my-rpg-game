import Phaser from "phaser";
import { NpcBase } from "./NpcBase";
import { PlayerBase } from "../player/PlayerBase";
import { NpcFactory } from "./NpcFactory";
import { GoblinTNT } from "./npcs/GoblinTNT";
import { GoblinBarrel } from "./npcs/GoblinBarrel";

interface SpawnData {
  x: number;
  y: number;
  name: string;
  type: string;
}

export class NpcManager {
  private npcs: NpcBase[] = [];
  private terrainLayers!: Phaser.Tilemaps.TilemapLayer[];
  private scene: Phaser.Scene;
  private player: PlayerBase;
  private npcGroup: Phaser.GameObjects.Group;
  private spawnObjects: Phaser.Types.Tilemaps.TiledObject[];
  private spawnRange: number = 500;
  private despawnRange: number = 600;
  private activeNpcs: Map<string, NpcBase> = new Map();
  private spawnData: Map<string, SpawnData> = new Map();
  private killedNpcs: Set<string> = new Set();

  constructor(
    scene: Phaser.Scene,
    player: PlayerBase,
    spawnObjects: Phaser.Types.Tilemaps.TiledObject[],
    terrainLayers: Phaser.Tilemaps.TilemapLayer[],
    spawnRange?: number
  ) {
    this.scene = scene;
    this.player = player;
    this.spawnObjects = spawnObjects;
    this.terrainLayers = terrainLayers;
    this.npcGroup = this.scene.add.group();
    if (spawnRange) {
      this.spawnRange = spawnRange;
      this.despawnRange = spawnRange + 200; // DespawnRange zawsze większy o 100
    }

    this.initializeSpawnData();
  }

  private initializeSpawnData() {
    this.spawnObjects.forEach((spawnObj) => {
      if (!spawnObj.name || !spawnObj.type) return;

      const spawnId = this.getSpawnId(spawnObj);
      this.spawnData.set(spawnId, {
        x: spawnObj.x! + 30,
        y: spawnObj.y! + 10,
        name: spawnObj.name,
        type: spawnObj.type,
      });
    });
  }

  private getSpawnId(spawnObj: Phaser.Types.Tilemaps.TiledObject): string {
    return `${spawnObj.name}_${spawnObj.x}_${spawnObj.y}`;
  }

  private spawnNPC(spawnId: string) {
    if (this.killedNpcs.has(spawnId)) return;

    const spawnData = this.spawnData.get(spawnId);
    if (!spawnData) return;

    try {
      const npc = NpcFactory.createNPC(
        this.scene,
        spawnData.x,
        spawnData.y,
        spawnData.name,
        spawnData.type,
        this.player,
        this.terrainLayers
      );

      npc.sprite.setData("spawnId", spawnId);

      // nasłuchiwanie na zdarzenie śmierci NPC
      npc.onDeath = () => {
        const spawnId = npc.sprite.getData("spawnId");
        if (spawnId) {
          this.killedNpcs.add(spawnId);
          this.despawnNPC(spawnId);
        }
      };

      this.npcs.push(npc);
      this.npcGroup.add(npc.sprite);
      npc.sprite.setData("sortY", npc.sprite.y);
      this.activeNpcs.set(spawnId, npc);

      if (!npc.isStatic) {
        this.scene.physics.add.collider(npc.sprite, this.npcGroup);
      }
    } catch (error) {
      console.error(`Failed to create NPC: ${spawnData.name}`, error);
    }
  }

  private despawnNPC(spawnId: string) {
    const npc = this.activeNpcs.get(spawnId);
    if (!npc) return;

    if (npc.isDead && !npc.deathAnimationStarted) {
      if (npc.healthSystem) npc.healthSystem.destroy();

      this.npcs = this.npcs.filter((n) => n !== npc);
      this.npcGroup.remove(npc.sprite, true);

      if (npc instanceof GoblinTNT) {
        npc.getDynamites().clear(true, true);
        npc.getExplosions().clear(true, true);
      }

      if (npc instanceof GoblinBarrel) {
        npc.getExplosions().clear(true, true);
      }

      this.activeNpcs.delete(spawnId);
    }
  }

  updateNPCsVisibility() {
    const playerX = this.player.sprite.x;
    const playerY = this.player.sprite.y;

    // Sprawdź które NPC powinny być aktywne
    this.spawnData.forEach((spawnData, spawnId) => {
      if (this.killedNpcs.has(spawnId)) return;

      const distance = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        spawnData.x,
        spawnData.y
      );

      const isActive = this.activeNpcs.has(spawnId);

      if (distance <= this.spawnRange && !isActive) {
        // Gracz jest w zasięgu - spawn NPC
        this.spawnNPC(spawnId);
      } else if (distance > this.despawnRange && isActive) {
        // Gracz jest poza zasięgiem - despawn NPC
        this.despawnNPC(spawnId);
      }
    });
  }

  update() {
    this.updateNPCsVisibility();

    // Aktualizuj tylko aktywne NPC
    this.npcs = this.npcs.filter((npc) => {
      if (npc.health <= 0) {
        if (!npc.isDead) {
          npc.startDeathAnimation();
          this.npcGroup.remove(npc.sprite);
        }
        return false;
      }

      npc.update();
      npc.sprite.setData("sortY", npc.sprite.y);

      if (npc.isDead) {
        return true;
      }

      if (npc.isStatic) {
        npc.sprite.setDepth(5000);
      }

      if (npc instanceof GoblinTNT) {
        npc
          .getDynamites()
          .getChildren()
          .forEach((dynamite: Phaser.GameObjects.GameObject) => {
            if (dynamite.active) {
              dynamite.setData(
                "sortY",
                (dynamite as Phaser.Physics.Arcade.Sprite).y
              );
            }
          });
        npc
          .getExplosions()
          .getChildren()
          .forEach((explosion: Phaser.GameObjects.GameObject) => {
            if (explosion.active) {
              explosion.setData(
                "sortY",
                (explosion as Phaser.Physics.Arcade.Sprite).y
              );
            }
          });
      }

      if (npc instanceof GoblinBarrel) {
        npc
          .getExplosions()
          .getChildren()
          .forEach((explosion: Phaser.GameObjects.GameObject) => {
            if (explosion.active) {
              explosion.setData(
                "sortY",
                (explosion as Phaser.Physics.Arcade.Sprite).y
              );
            }
          });
      }

      return true;
    });
  }

  getGroup(): Phaser.GameObjects.Group {
    return this.npcGroup;
  }

  getNPCs(): NpcBase[] {
    return [...this.npcs];
  }

  destroy() {
    this.npcs.forEach((npc) => {
      if (npc.health > 0) {
        npc.startDeathAnimation();
      }
    });
    this.npcGroup.clear(true, true);
    this.npcs = [];
    this.activeNpcs.clear();
    this.spawnData.clear();
    this.killedNpcs.clear();
  }
}
