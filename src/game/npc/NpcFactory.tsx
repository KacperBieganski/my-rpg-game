import { NpcBase } from "./NpcBase";
import { GoblinTorch } from "./npcs/GoblinTorch";
import { GoblinTNT } from "./npcs/GoblinTNT";
import { GoblinBarrel } from "./npcs/GoblinBarrel";
import { DefaultGameSettings } from "../GameSettings";
import Phaser from "phaser";
import type { PlayerBase } from "../player/PlayerBase";
import { Pawn } from "./npcs/Pawn";

export class NpcFactory {
  static createNPC(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    type: string,
    player: PlayerBase,
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ): NpcBase {
    if (!terrainLayers || terrainLayers.length === 0) {
      console.error("Invalid terrain layers passed to NPC factory");
      terrainLayers = []; // Fallback to empty array
    }

    const npcType = this.mapNameToType(name);
    const config = this.getConfigForType(npcType);

    const npc = this.createByType(
      scene,
      x,
      y,
      npcType,
      player,
      config,
      terrainLayers
    );

    if (type === "Static") {
      npc.setStatic(true);
    }

    return npc;
  }

  private static mapNameToType(name: string): string {
    if (name.includes("Torch")) return "GoblinTorch";
    if (name.includes("TNT")) return "GoblinTNT";
    if (name.includes("Barrel")) return "GoblinBarrel";
    if (name.includes("Pawn")) return "Pawn";
    return "GoblinTorch";
  }

  private static getConfigForType(type: string) {
    switch (type) {
      case "GoblinTorch":
        return DefaultGameSettings.npc.GoblinTorch;
      case "GoblinTNT":
        return DefaultGameSettings.npc.GoblinTNT;
      case "GoblinBarrel":
        return DefaultGameSettings.npc.GoblinBarrel;
      case "Pawn":
        return DefaultGameSettings.npc.Pawn;
      default:
        throw new Error(`No config found for NPC type: ${type}`);
    }
  }

  private static createByType(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    player: PlayerBase,
    config: any,
    terrainLayers: Phaser.Tilemaps.TilemapLayer[]
  ): NpcBase {
    switch (type) {
      case "GoblinTorch":
        return new GoblinTorch(scene, x, y, player, config, terrainLayers);
      case "GoblinTNT":
        return new GoblinTNT(scene, x, y, player, config, terrainLayers);
      case "GoblinBarrel":
        return new GoblinBarrel(scene, x, y, player, config, terrainLayers);
      case "Pawn":
        return new Pawn(scene, x, y, player, config, terrainLayers);
      default:
        throw new Error(`Unknown NPC type: ${type}`);
    }
  }
}
