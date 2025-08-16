import Phaser from "phaser";

interface TileAnimationFrame {
  duration: number;
  tileid: number;
}

interface TileAnimationData {
  animation?: TileAnimationFrame[];
}

export function loadMap(scene: Phaser.Scene) {
  const spritesToSort: Phaser.GameObjects.Sprite[] = [];
  const interactiveObjects: Phaser.Types.Tilemaps.TiledObject[] = [];
  const spawnObjects: Phaser.Types.Tilemaps.TiledObject[] = [];
  const map = scene.make.tilemap({ key: "level1" });
  map.setBaseTileSize(64, 64);

  // Ładowanie tilesetów
  const tilesets = {
    tilemap: map.addTilesetImage("Tilemap", "Tilemap"),
    tilemapColor1: map.addTilesetImage("Tilemap_color1", "Tilemap_color1"),
    tilemapColor2: map.addTilesetImage("Tilemap_color2", "Tilemap_color2"),
    tilemapColor3: map.addTilesetImage("Tilemap_color3", "Tilemap_color3"),
    collisions: map.addTilesetImage("Collisions", "Collisions"),
    waterAnim: map.addTilesetImage("Water_Elevation", "Water_Elevation"),
    water: map.addTilesetImage(
      "Water_Background_color",
      "Water_Background_color"
    ),
  };

  // Tworzenie warstw
  const createLayer = (name: string, tiles: Phaser.Tilemaps.Tileset[]) =>
    map.createLayer(name, tiles, 0, 0);

  const npcCollisions = createLayer("NpcCollisions", [tilesets.collisions!]);
  const collisions = createLayer("Collisions", [tilesets.collisions!]);
  const decorations = createLayer("Decorations", [tilesets.tilemap!]);
  const waterAnim = createLayer("WaterAnim", [tilesets.waterAnim!]);
  const terrain_2 = createLayer("Terrain_2", [
    tilesets.tilemapColor3!,
    tilesets.tilemap!,
  ]);
  const terrain_1 = createLayer("Terrain_1", [
    tilesets.tilemapColor2!,
    tilesets.tilemap!,
  ]);
  const terrain_0 = createLayer("Terrain_0", [
    tilesets.tilemapColor1!,
    tilesets.tilemap!,
  ]);
  const water = createLayer("Water", [tilesets.water!]);

  if (
    !npcCollisions ||
    !collisions ||
    !decorations ||
    !waterAnim ||
    !terrain_0 ||
    !terrain_1 ||
    !terrain_2 ||
    !water
  ) {
    throw new Error("Nie znaleziono warstwy w mapie.");
  }

  // Kolizje
  collisions.setCollisionByExclusion([-1]);
  npcCollisions.setCollisionByExclusion([-1]);

  // Dodanie animacji dla kafelków wody
  const waterTileset = map.getTileset("Water_Elevation");
  if (waterTileset) {
    const tileAnimations = waterTileset.tileData as Record<
      string,
      TileAnimationData
    >;

    Object.keys(tileAnimations).forEach((tileIndex) => {
      const tileId = parseInt(tileIndex);
      const animationData = tileAnimations[tileIndex].animation;

      if (animationData && animationData.length > 0) {
        // Znajdź wszystkie kafelki z tym ID
        waterAnim.forEachTile((tile) => {
          if (tile.index === tileId + waterTileset.firstgid) {
            const frames = animationData;
            const totalDuration = frames.reduce(
              (sum, frame) => sum + frame.duration,
              0
            );

            // Utwórz animację dla tego kafelka
            scene.tweens.addCounter({
              from: 0,
              to: 1,
              duration: totalDuration,
              repeat: -1,
              ease: "Linear",
              onUpdate: (tween) => {
                const progress = tween.getValue();
                const time = progress! * totalDuration;
                let accumulated = 0;
                let currentFrame = frames[0].tileid;

                // Znajdź bieżącą klatkę na podstawie czasu
                for (const frame of frames) {
                  accumulated += frame.duration;
                  if (time <= accumulated) {
                    currentFrame = frame.tileid;
                    break;
                  }
                }

                // Zaktualizuj klatkę kafelka
                tile.index = currentFrame + waterTileset.firstgid;
              },
            });
          }
        });
      }
    });
  }

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

      // Sprawdzenie właściwości flip i odwrócenie sprite'a jeśli potrzebne
      const flipProperty = obj.properties?.find(
        (p: { name: string }) => p.name === "flip"
      );
      if (flipProperty && flipProperty.value === true) {
        sprite.setFlipX(true);
      }

      // Dodawanie animacji na podstawie nazwy
      const handleAnimation = (animKey: string) => {
        if (!scene.anims.exists(animKey)) {
          console.warn(`Animation ${animKey} not found`);
          return;
        }

        const animation = scene.anims.get(animKey);
        const randomOffset = Phaser.Math.FloatBetween(0, 1);
        const startFrame = Math.floor(randomOffset * animation.frames.length);

        sprite.anims.play(
          {
            key: animKey,
            startFrame: startFrame,
            timeScale: 1.0,
          },
          true
        );
      };

      // Add animations based on type
      if (isTree(name)) {
        handleAnimation(`${name.toLowerCase()}_anim`);
      } else if (isBush(name)) {
        handleAnimation(`${name.toLowerCase()}_anim`);
      } else if (isRock(name)) {
        handleAnimation(`${name.toLowerCase()}_anim`);
      } else if (isTower(name)) {
        handleAnimation(`redTower1_anim`);
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
  waterAnim.setDepth(4);
  decorations.setDepth(5);
  // Obiekty będą miały depth ustawione dynamicznie na podstawie Y

  const spawnLayer = map.getObjectLayer("Spawns");
  if (spawnLayer) {
    spawnObjects.push(...spawnLayer.objects);
  }

  const interactiveLayer = map.getObjectLayer("Interactive");
  if (interactiveLayer) {
    interactiveObjects.push(...interactiveLayer.objects);
  }

  return {
    map,
    npcCollisions,
    collisions,
    spritesToSort,
    spawnObjects,
    interactiveObjects,
    terrain_0,
    terrain_1,
    terrain_2,
  };
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

function isRock(name: string): boolean {
  return name.startsWith("RockWater");
}

function isTower(name: string): boolean {
  return name.startsWith("RedTower");
}
