import Phaser from "phaser";

export function loadMap(scene: Phaser.Scene) {
  const map = scene.make.tilemap({ key: "level1" });

  // Ładowanie tilesetów
  const tilesets = {
    overworld: map.addTilesetImage("Overworld", "Overworld"),
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

  const spawns = createLayer("Spawns", []);
  const collisions = createLayer("Collisions", [tilesets.collisions!]);
  const decorations = createLayer("Decorations", [tilesets.overworld!]);
  const terrain_2 = createLayer("Terrain_2", [tilesets.tilemapColor3!]);
  const terrain_1 = createLayer("Terrain_1", [tilesets.tilemapColor2!]);
  const terrain_0 = createLayer("Terrain_0", [tilesets.tilemapColor1!]);
  const water = createLayer("Water", [tilesets.water!]);

  if (
    !spawns ||
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
  if (scene.physics.world.debugGraphic) {
    scene.physics.world.debugGraphic.clear();
    collisions.forEachTile((tile) => {
      if (tile.index !== -1) {
        const graphics = scene.add.graphics();
        graphics.lineStyle(1, 0xff0000, 0.8);
        graphics.strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
        graphics.setDepth(1000);
      }
    });
  }

  // Ładowanie obiektów z warstwy Objects
  const objectsLayer = map.getObjectLayer("Objects");
  if (objectsLayer) {
    objectsLayer.objects.forEach((obj) => {
      // Tworzenie obiektów na podstawie gid
      if (obj.gid) {
        const sprite = scene.add.sprite(obj.x!, obj.y!, getTextureKey(obj.gid));
        sprite.setOrigin(0, 1); // Ustawienie punktu zakotwiczenia na dół obiektu

        // Dodawanie animacji dla drzew
        if (isTree(obj.gid)) {
          const treeType = getTreeType(obj.gid);
          sprite.play(`${treeType}_anim`);
        }

        // Dodawanie animacji dla krzaków
        else if (isBush(obj.gid)) {
          const bushType = getBushType(obj.gid);
          sprite.play(`${bushType}_anim`);
        }

        // Ustawienie głębokości w zależności od pozycji Y
        sprite.setDepth(obj.y!);
      }
    });
  }

  // Ustawienie głębokości warstw
  water.setDepth(0);
  terrain_0.setDepth(1);
  terrain_1.setDepth(2);
  terrain_2.setDepth(3);
  decorations.setDepth(4);
  // Obiekty będą miały depth ustawione dynamicznie na podstawie Y

  return { map, spawns, collisions };
}

// Funkcje pomocnicze
function getTextureKey(gid: number): string {
  // Mapowanie GID na klucze tekstur
  const objectMap: Record<number, string> = {
    1931: "Bushe1",
    1932: "Bushe2",
    1933: "Bushe3",
    1934: "Bushe4",
    1935: "RedCastle",
    1936: "RedHouse1",
    1937: "RedHouse2",
    1938: "RedHouse3",
    1939: "RedTower",
    1940: "Rock1",
    1941: "Rock2",
    1942: "Rock3",
    1943: "Rock4",
    1944: "Tree1",
    1945: "Tree2",
    1946: "Tree3",
    1947: "Tree4",
  };

  return objectMap[gid] || "unknown";
}

function isTree(gid: number): boolean {
  return gid >= 1944 && gid <= 1947;
}

function isBush(gid: number): boolean {
  return gid >= 1931 && gid <= 1934;
}

function getTreeType(gid: number): string {
  return `tree${gid - 1943}`;
}

function getBushType(gid: number): string {
  return `bushe${gid - 1930}`;
}
