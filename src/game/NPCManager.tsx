import Phaser from "phaser";
import { NPC } from "./NPC";
import { PlayerBase } from "./player/PlayerBase";

export class NPCManager {
  private npcs: NPC[] = [];
  private scene: Phaser.Scene;
  private spawnsLayer: Phaser.Tilemaps.TilemapLayer;
  private player: PlayerBase;
  private npcGroup: Phaser.GameObjects.Group;

  constructor(
    scene: Phaser.Scene,
    spawnsLayer: Phaser.Tilemaps.TilemapLayer,
    player: PlayerBase
  ) {
    this.scene = scene;
    this.spawnsLayer = spawnsLayer;
    this.player = player;
    this.npcGroup = this.scene.add.group();
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
      this.npcGroup.add(npc.sprite);
      npc.sprite.setData("sortY", npc.sprite.y); // Dodajemy dane do sortowania
    }
  }

  update() {
    this.npcs = this.npcs.filter((npc) => {
      if (npc.health <= 0) {
        this.npcGroup.remove(npc.sprite, true, true);
        return false;
      }
      npc.update();
      // Aktualizujemy wartość sortY dla każdego NPC
      npc.sprite.setData("sortY", npc.sprite.y);
      return true;
    });
  }

  getGroup(): Phaser.GameObjects.Group {
    return this.npcGroup;
  }

  getNPCs(): NPC[] {
    return this.npcs;
  }

  destroy() {
    this.npcGroup.clear(true, true);
    this.npcs = [];
  }
}
