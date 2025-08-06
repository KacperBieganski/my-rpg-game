import Phaser from "phaser";
import { NpcBase } from "./NpcBase";
import { PlayerBase } from "../player/PlayerBase";
import { NpcFactory } from "./NpcFactory";
import { GoblinTNT } from "./GoblinTNT";

export class NpcManager {
  private npcs: NpcBase[] = [];
  private scene: Phaser.Scene;
  private player: PlayerBase;
  private npcGroup: Phaser.GameObjects.Group;
  private spawnObjects: Phaser.Types.Tilemaps.TiledObject[];

  constructor(
    scene: Phaser.Scene,
    player: PlayerBase,
    spawnObjects: Phaser.Types.Tilemaps.TiledObject[]
  ) {
    this.scene = scene;
    this.player = player;
    this.spawnObjects = spawnObjects;
    this.npcGroup = this.scene.add.group();
  }

  spawnNPCs() {
    this.spawnObjects.forEach((spawnObj) => {
      // Pomijaj obiekty bez nazwy
      if (!spawnObj.name || !spawnObj.type) return;

      const spawnX = spawnObj.x!;
      const spawnY = spawnObj.y!;

      try {
        // Tworzymy NPC na podstawie nazwy obiektu i typu
        const npc = NpcFactory.createNPC(
          this.scene,
          spawnX,
          spawnY,
          spawnObj.name,
          spawnObj.type,
          this.player.sprite
        );

        this.npcs.push(npc);
        this.npcGroup.add(npc.sprite);
        npc.sprite.setData("sortY", npc.sprite.y);
      } catch (error) {
        console.error(`Failed to create NPC: ${spawnObj.name}`, error);
      }
    });
  }

  update() {
    this.npcs = this.npcs.filter((npc) => {
      if (npc.health <= 0) {
        this.npcGroup.remove(npc.sprite, true, true);
        npc.destroy();
        return false;
      }
      npc.update();
      npc.sprite.setData("sortY", npc.sprite.y);

      // If NPC has projectiles (like GoblinTNT), update their depth too
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

      return true;
    });
  }

  getGroup(): Phaser.GameObjects.Group {
    return this.npcGroup;
  }

  getNPCs(): NpcBase[] {
    return [...this.npcs]; // Return copy of array
  }

  destroy() {
    this.npcs.forEach((npc) => npc.destroy());
    this.npcGroup.clear(true, true);
    this.npcs = [];
  }
}
