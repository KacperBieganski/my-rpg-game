import Phaser from "phaser";

export function loadMap(scene: Phaser.Scene) {
  const spritesToSort: Phaser.GameObjects.Sprite[] = [];
  const spawnObjects: Phaser.Types.Tilemaps.TiledObject[] = [];
  //const debugGraphics: Phaser.GameObjects.Graphics[] = [];
  const map = scene.make.tilemap({ key: "level1" });

  // Ładowanie tilesetów
  const tilesets = {
    tilemap: map.addTilesetImage("Tilemap", "Tilemap"),
    tilemapColor1: map.addTilesetImage("Tilemap_color1", "Tilemap_color1"),
    tilemapColor2: map.addTilesetImage("Tilemap_color2", "Tilemap_color2"),
    tilemapColor3: map.addTilesetImage("Tilemap_color3", "Tilemap_color3"),
    collisions: map.addTilesetImage("Collisions", "Collisions"),
    water: map.addTilesetImage(
      "Water_Background_color",
      "Water_Background_color"
    ),
  };

  // Tworzenie warstw
  const createLayer = (name: string, tiles: Phaser.Tilemaps.Tileset[]) =>
    map.createLayer(name, tiles, 0, 0);

  const collisions = createLayer("Collisions", [tilesets.collisions!]);
  const decorations = createLayer("Decorations", [tilesets.tilemap!]);
  const terrain_2 = createLayer("Terrain_2", [tilesets.tilemapColor3!]);
  const terrain_1 = createLayer("Terrain_1", [tilesets.tilemapColor2!]);
  const terrain_0 = createLayer("Terrain_0", [tilesets.tilemapColor1!]);
  const water = createLayer("Water", [tilesets.water!]);

  if (
    !collisions ||
    !decorations ||
    !terrain_0 ||
    !terrain_1 ||
    !terrain_2 ||
    !water
  ) {
    throw new Error("Nie znaleziono warstwy w mapie.");
  }

  // Kolizje
  collisions.setCollisionByExclusion([-1]);

  // Debugowanie kolizji
  // if (scene.physics.world.debugGraphic) {
  //   scene.physics.world.debugGraphic.clear();
  //   collisions.forEachTile((tile) => {
  //     if (tile.index !== -1) {
  //       const graphics = scene.add.graphics();
  //       graphics.lineStyle(1, 0xff0000, 0.8);
  //       graphics.strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
  //       graphics.setDepth(1000);
  //     }
  //   });
  // }

  // Ładowanie obiektów z warstwy Objects
  const objectsLayer = map.getObjectLayer("Objects");
  if (objectsLayer) {
    objectsLayer.objects.forEach((obj) => {
      const name =
        obj.properties?.find((p: { name: string }) => p.name === "Name")
          ?.value || obj.name;

      if (!name) return;

      const textureKey = getTextureKey(name);
      const sprite = scene.add.sprite(obj.x!, obj.y!, textureKey);
      sprite.setOrigin(0, 1); // Ustawienie punktu zakotwiczenia na dół obiektu
      sprite.setData("sortY", obj.y! - 40);
      spritesToSort.push(sprite);

      // Dodawanie obramowania
      // const bounds = sprite.getBounds();
      // const outline = scene.add.graphics();
      // outline.lineStyle(2, 0x00ff00, 0.8);
      // outline.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      // outline.setDepth(sprite.depth + 1);
      // debugGraphics.push(outline);

      // Sprawdzenie właściwości flip i odwrócenie sprite'a jeśli potrzebne
      const flipProperty = obj.properties?.find(
        (p: { name: string }) => p.name === "flip"
      );
      if (flipProperty && flipProperty.value === true) {
        sprite.setFlipX(true);
      }

      // Dodawanie animacji na podstawie nazwy
      if (isTree(name)) {
        sprite.play(`${name.toLowerCase()}_anim`);
      } else if (isBush(name)) {
        sprite.play(`${name.toLowerCase()}_anim`);
      } else if (isTower(name)) {
        sprite.play(`redTower1_anim`);
      }

      // Ustawienie głębokości w zależności od pozycji Y
      sprite.setDepth(obj.y!);
    });
  }

  // Ustawienie głębokości warstw
  water.setDepth(0);
  terrain_0.setDepth(1);
  terrain_1.setDepth(2);
  terrain_2.setDepth(3);
  decorations.setDepth(4);
  // Obiekty będą miały depth ustawione dynamicznie na podstawie Y

  const spawnLayer = map.getObjectLayer("Spawns");
  if (spawnLayer) {
    spawnObjects.push(...spawnLayer.objects);
  }

  return { map, collisions, spritesToSort, spawnObjects };
}

// Funkcje pomocnicze
function getTextureKey(name: string): string {
  // Mapowanie nazw na klucze tekstur
  return name;
}

function isTree(name: string): boolean {
  return name.startsWith("Tree");
}

function isBush(name: string): boolean {
  return name.startsWith("Bushe");
}

function isTower(name: string): boolean {
  return name.startsWith("RedTower");
}
