import { WarriorPlayer } from "./WarriorPlayer";
import { ArcherPlayer } from "./ArcherPlayer";
import { LancerPlayer } from "./LancerPlayer";
import Phaser from "phaser";

export class PlayerFactory {
  static createPlayer(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterClass: "warrior" | "archer" | "lancer"
  ) {
    switch (characterClass) {
      case "warrior":
        return new WarriorPlayer(scene, x, y, characterClass);
      case "archer":
        return new ArcherPlayer(scene, x, y, characterClass);
      case "lancer":
        return new LancerPlayer(scene, x, y, characterClass);
      default:
        throw new Error(`Unknown character class: ${characterClass}`);
    }
  }
}
