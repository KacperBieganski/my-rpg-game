import Phaser from "phaser";
import { NPC } from "./NPC";
import { PlayerBase } from "./player/PlayerBase";

export class NPCManager {
  private npcs: NPC[] = [];
  private scene: Phaser.Scene;
  private spawnsLayer: Phaser.Tilemaps.TilemapLayer;
  private player: PlayerBase;

  constructor(
    scene: Phaser.Scene,
    spawnsLayer: Phaser.Tilemaps.TilemapLayer,
    player: PlayerBase
  ) {
    this.scene = scene;
    this.spawnsLayer = spawnsLayer;
    this.player = player;
  }

  spawnNPCs(count: number = 10) {
    const walkableTiles: { x: number; y: number }[] = [];

    for (let y = 0; y < this.spawnsLayer.layer.height; y++) {
      for (let x = 0; x < this.spawnsLayer.layer.width; x++) {
        const tile = this.spawnsLayer.getTileAt(x, y);
        if (tile && tile.index !== -1) {
          walkableTiles.push({ x, y });
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const randomTile =
        walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
      const worldX = this.spawnsLayer.tileToWorldX(randomTile.x) + 16;
      const worldY = this.spawnsLayer.tileToWorldY(randomTile.y) + 16;

      const npc = new NPC(this.scene, worldX, worldY, this.player.sprite);
      this.npcs.push(npc);
    }
  }

  update() {
    this.npcs = this.npcs.filter((npc) => {
      if (npc.health <= 0) return false;
      npc.update();
      return true;
    });
  }

  getGroup(): Phaser.GameObjects.Group {
    const group = this.scene.add.group();
    this.npcs.forEach((npc) => group.add(npc.sprite));
    return group;
  }

  getNPCs(): NPC[] {
    return this.npcs;
  }

  destroy() {
    this.npcs.forEach((npc) => npc.sprite.destroy());
    this.npcs = [];
  }
}
