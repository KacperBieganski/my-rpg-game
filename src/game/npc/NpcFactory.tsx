import { NpcBase } from "./NpcBase";
import { GoblinTorch } from "./GoblinTorch";
import { GoblinTNT } from "./GoblinTNT";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";

export class NpcFactory {
  static createNPC(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    type: string,
    player: Phaser.Physics.Arcade.Sprite
  ): NpcBase {
    const npcType = this.mapNameToType(name);
    const config = this.getConfigForType(npcType);

    const npc = this.createByType(scene, x, y, npcType, player, config);

    if (type === "Static") {
      npc.setStatic(true);
    }

    return npc;
  }

  private static mapNameToType(name: string): string {
    if (name.includes("Torch")) return "GoblinTorch";
    if (name.includes("TNT")) return "GoblinTNT";
    if (name.includes("Barrel")) return "GoblinBarrel";
    return "GoblinTorch";
  }

  private static getConfigForType(type: string) {
    switch (type) {
      case "GoblinTorch":
        return DefaultGameSettings.npc.GoblinTorch;
      case "GoblinTNT":
        return DefaultGameSettings.npc.GoblinTNT;
      // Dodaj inne typy NPC tutaj
      default:
        throw new Error(`No config found for NPC type: ${type}`);
    }
  }

  private static createByType(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    player: Phaser.Physics.Arcade.Sprite,
    config: any
  ): NpcBase {
    switch (type) {
      case "GoblinTorch":
        return new GoblinTorch(scene, x, y, player, config);
      case "GoblinTNT":
        return new GoblinTNT(scene, x, y, player, config);
      default:
        throw new Error(`Unknown NPC type: ${type}`);
    }
  }
}
