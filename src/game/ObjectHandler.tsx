import Phaser from "phaser";
import { PlayerFactory } from "./player/PlayerFactory";
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
    x: number | undefined,
    y: number | undefined,
    characterClass: "warrior" | "archer" | "lancer"
  ): PlayerBase {
    // Użyj współrzędnych z zapisu, jeśli są dostępne
    if (x !== undefined && y !== undefined) {
      return PlayerFactory.createPlayer(
        this.scene,
        x,
        y,
        characterClass
      ) as PlayerBase;
    }

    // W przeciwnym razie użyj SpawnPoint
    if (this.spawnPoint) {
      const spawnX = (this.spawnPoint.x || 0) + 30;
      const spawnY = (this.spawnPoint.y || 0) + 10;

      return PlayerFactory.createPlayer(
        this.scene,
        spawnX,
        spawnY,
        characterClass
      ) as PlayerBase;
    }

    // Jeśli nie ma ani zapisanych współrzędnych, ani SpawnPoint, użyj domyślnych wartości
    console.warn(
      "Brak zapisanych współrzędnych i SpawnPoint, używam domyślnych wartości (100, 100)"
    );
    return PlayerFactory.createPlayer(
      this.scene,
      100,
      100,
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
