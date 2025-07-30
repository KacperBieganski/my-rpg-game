import { WarriorPlayer } from "./WarriorPlayer";
import { ArcherPlayer } from "./ArcherPlayer";
import Phaser from "phaser";

export class PlayerFactory {
  static createPlayer(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterClass: "warrior" | "archer"
  ) {
    switch (characterClass) {
      case "warrior":
        return new WarriorPlayer(scene, x, y);
      case "archer":
        return new ArcherPlayer(scene, x, y);
      default:
        throw new Error(`Unknown character class: ${characterClass}`);
    }
  }
}
