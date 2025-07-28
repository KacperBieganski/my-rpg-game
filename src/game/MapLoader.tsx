import Phaser from "phaser";

export function loadMap(scene: Phaser.Scene) {
  const map = scene.make.tilemap({ key: "level1" });

  const tilesets = {
    landscapes: map.addTilesetImage("landscapes2", "landscapes2"),
    water: map.addTilesetImage("water", "water"),
    trees1: map.addTilesetImage("trees#1", "trees#1"),
    trees2: map.addTilesetImage("trees#2", "trees#2"),
    trees3: map.addTilesetImage("trees#3", "trees#3"),
    tower: map.addTilesetImage("Tower", "Tower"),
    house1: map.addTilesetImage("House1", "House1"),
    house2: map.addTilesetImage("House2", "House2"),
    house3: map.addTilesetImage("House3", "House3"),
  };

  const layer = (name: string, tiles: Phaser.Tilemaps.Tileset[]) =>
    map.createLayer(name, tiles, 0, 0);

  const water = layer("water", [tilesets.water!]);
  const spawns = layer("spawns", []);
  const blocked = layer("blocked", []);
  const ground = layer("ground", [tilesets.landscapes!]);
  const ground2 = layer("ground#2", [
    tilesets.landscapes!,
    tilesets.trees1!,
    tilesets.trees2!,
    tilesets.trees3!,
    tilesets.tower!,
    tilesets.house1!,
    tilesets.house2!,
    tilesets.house3!,
  ]);
  const elevated1 = layer("elevated#1", [tilesets.landscapes!]);
  const elevated2 = layer("elevated#2", [tilesets.landscapes!]);
  const decorations = layer("decorations", [
    tilesets.trees1!,
    tilesets.trees2!,
    tilesets.trees3!,
    tilesets.tower!,
    tilesets.house1!,
    tilesets.house2!,
    tilesets.house3!,
  ]);
  const decorations2 = layer("decorations#2", [
    tilesets.trees1!,
    tilesets.trees2!,
    tilesets.trees3!,
    tilesets.tower!,
    tilesets.house1!,
    tilesets.house2!,
    tilesets.house3!,
  ]);

  if (
    !elevated1 ||
    !water ||
    !spawns ||
    !decorations ||
    !decorations2 ||
    !blocked
  ) {
    throw new Error("Nie znaleziono warstwy w mapie.");
  }

  blocked.setCollisionByExclusion([-1]);
  elevated1.setCollisionByExclusion([-1]);

  return { map, spawns, elevated1, blocked };
}
