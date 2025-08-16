import Phaser from "phaser";
import { PlayerFactory } from "./player/PlayerFactory";
import { DefaultGameSettings } from "../game/GameSettings";
import type { PlayerBase } from "./player/PlayerBase";

export class ObjectHandler {
  private scene: Phaser.Scene;
  private spawnPoint: Phaser.Types.Tilemaps.TiledObject | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public handleObjects(objects: Phaser.Types.Tilemaps.TiledObject[]) {
    this.spawnPoint = objects.find((obj) => obj.name === "SpawnPoint") || null;
  }

  public createPlayer(
    characterClass: "warrior" | "archer" | "lancer"
  ): PlayerBase {
    let x = DefaultGameSettings.player.position.x;
    let y = DefaultGameSettings.player.position.y;

    if (this.spawnPoint) {
      x = this.spawnPoint.x || x;
      y = this.spawnPoint.y || y;

      x += 30;
      y += 10;
    } else {
      console.warn(
        "Nie znaleziono SpawnPoint, używam domyślnych współrzędnych"
      );
    }

    return PlayerFactory.createPlayer(
      this.scene,
      x,
      y,
      characterClass
    ) as PlayerBase;
  }

  // Przykładowa metoda do obsługi innych obiektów interactive
  //   private handleInteractiveObject(obj: Phaser.Types.Tilemaps.TiledObject) {
  //     switch (obj.name) {
  //       case "Chest":
  //         // Obsługa skrzyń
  //         break;
  //       case "Door":
  //         // Obsługa drzwi
  //         break;
  //       // Dodaj inne przypadki według potrzeb
  //     }
  //   }
}
