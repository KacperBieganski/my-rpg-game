import Phaser from "phaser";

export function loadMap(scene: Phaser.Scene) {
  const map = scene.make.tilemap({ key: "level1" });

  const tilesets = {
    landscapes: map.addTilesetImage("landscapes2", "landscapes2"),
    water: map.addTilesetImage("water", "water"),
    tree1: map.addTilesetImage("Tree1", "Tree1", 32, 32, 0, 0),
    tree2: map.addTilesetImage("Tree2", "Tree2", 32, 32, 0, 0),
    tree3: map.addTilesetImage("Tree3", "Tree3", 32, 32, 0, 0),
    tree4: map.addTilesetImage("Tree4", "Tree4", 32, 32, 0, 0),
    redTower: map.addTilesetImage("RedTower", "RedTower"),
    redcastle: map.addTilesetImage("RedCastle", "RedCastle"),
    redHouse1: map.addTilesetImage("RedHouse1", "RedHouse1"),
    redHouse2: map.addTilesetImage("RedHouse2", "RedHouse2"),
    redHouse3: map.addTilesetImage("RedHouse3", "RedHouse3"),
  };

  const layer = (name: string, tiles: Phaser.Tilemaps.Tileset[]) =>
    map.createLayer(name, tiles, 0, 0);

  const water = layer("water", [tilesets.water!]);
  const spawns = layer("spawns", []);
  const blocked = layer("blocked", []);
  const ground = layer("ground", [tilesets.landscapes!]);
  const groundBack = layer("ground_back", [tilesets.landscapes!]);
  const elevated1 = layer("elevated_1", [tilesets.landscapes!]);
  const elevated2 = layer("elevated_2", [tilesets.landscapes!]);
  const decorationsFront = layer("decorations_front", [
    tilesets.redTower!,
    tilesets.redcastle!,
    tilesets.redHouse1!,
    tilesets.redHouse2!,
    tilesets.redHouse3!,
    tilesets.tree1!,
    tilesets.tree2!,
    tilesets.tree3!,
    tilesets.tree4!,
  ]);
  const decorationsBack = layer("decorations_back", [
    tilesets.redTower!,
    tilesets.redcastle!,
    tilesets.redHouse1!,
    tilesets.redHouse2!,
    tilesets.redHouse3!,
    tilesets.tree1!,
    tilesets.tree2!,
    tilesets.tree3!,
    tilesets.tree4!,
  ]);

  if (
    !elevated1 ||
    !water ||
    !spawns ||
    !ground ||
    !groundBack ||
    !elevated2 ||
    !decorationsFront ||
    !decorationsBack ||
    !blocked
  ) {
    throw new Error("Nie znaleziono warstwy w mapie.");
  }

  // Ustaw kolizje
  blocked.setCollisionByExclusion([-1]);
  elevated1.setCollisionByExclusion([-1]);

  // Ustaw głębokości warstw
  water.setDepth(0);
  ground.setDepth(1);
  groundBack.setDepth(2);
  decorationsBack.setDepth(3);
  // NPC depth 4
  // Gracz depth 5
  elevated1.setDepth(6);
  elevated2.setDepth(7);
  decorationsFront.setDepth(8);

  return { map, spawns, elevated1, blocked };
}
