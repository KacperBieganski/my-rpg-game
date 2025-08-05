import Phaser from "phaser";

type SpriteSheetConfig = {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
};

type ImageConfig = {
  key: string;
  path: string;
};

type AudioConfig = {
  key: string;
  path: string;
};

export class AssetLoader {
  static preload(scene: Phaser.Scene): void {
    // Tilemap
    scene.load.tilemapTiledJSON("level1", "../assets/startMap.json");

    // Kategorie zasobów
    this.loadAssets(scene, this.playerSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.enemySpriteSheets, "spritesheet");
    this.loadAssets(scene, this.environmentImages, "image");
    this.loadAssets(scene, this.buildingImages, "image");
    this.loadAssets(scene, this.treeSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.bushSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.rockImages, "image");

    this.loadAssets(scene, this.playerAudios, "audio");
    this.loadAssets(scene, this.enemyAudios, "audio");
  }

  private static loadAssets(
    scene: Phaser.Scene,
    list: SpriteSheetConfig[] | ImageConfig[] | AudioConfig[],
    type: "spritesheet" | "image" | "audio"
  ) {
    for (const asset of list) {
      switch (type) {
        case "spritesheet":
          const ss = asset as SpriteSheetConfig;
          scene.load.spritesheet(ss.key, ss.path, {
            frameWidth: ss.frameWidth,
            frameHeight: ss.frameHeight,
          });
          break;
        case "image":
          const img = asset as ImageConfig;
          scene.load.image(img.key, img.path);
          break;
        case "audio":
          const aud = asset as AudioConfig;
          scene.load.audio(aud.key, aud.path);
          break;
      }
    }
  }

  // --- Definicje zasobów ---

  private static playerSpriteSheets: SpriteSheetConfig[] = [
    // Warrior
    {
      key: "Blue_warrior_idle",
      path: "/assets/Units/Blue Units/Warrior/Warrior_Idle.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_warrior_run",
      path: "/assets/Units/Blue Units/Warrior/Warrior_Run.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_warrior_attack1",
      path: "/assets/Units/Blue Units/Warrior/Warrior_Attack1.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_warrior_attack2",
      path: "/assets/Units/Blue Units/Warrior/Warrior_Attack2.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_warrior_guard",
      path: "/assets/Units/Blue Units/Warrior/Warrior_Guard.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    // Archer
    {
      key: "Blue_archer_idle",
      path: "/assets/Units/Blue Units/Archer/Archer_Idle.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_archer_run",
      path: "/assets/Units/Blue Units/Archer/Archer_Run.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Blue_archer_shoot",
      path: "/assets/Units/Blue Units/Archer/Archer_Shoot.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    // Lancer
    {
      key: "Blue_lancer_idle",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Idle.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_run",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Run.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_down_attack",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Down_Attack.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_downright_attack",
      path: "/assets/Units/Blue Units/Lancer/Lancer_DownRight_Attack.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_right_attack",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Right_Attack.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_up_attack",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Up_Attack.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_upright_attack",
      path: "/assets/Units/Blue Units/Lancer/Lancer_UpRight_Attack.png",
      frameWidth: 320,
      frameHeight: 320,
    },

    {
      key: "Blue_lancer_down_defence",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Down_Defence.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_downright_defence",
      path: "/assets/Units/Blue Units/Lancer/Lancer_DownRight_Defence.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_right_defence",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Right_Defence.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_up_defence",
      path: "/assets/Units/Blue Units/Lancer/Lancer_Up_Defence.png",
      frameWidth: 320,
      frameHeight: 320,
    },
    {
      key: "Blue_lancer_upright_defence",
      path: "/assets/Units/Blue Units/Lancer/Lancer_UpRight_Defence.png",
      frameWidth: 320,
      frameHeight: 320,
    },
  ];

  private static playerAudios: AudioConfig[] = [
    { key: "runningGrass", path: "/assets/sounds/running-in-grass.ogg" },
    { key: "lvlUp", path: "/assets/sounds/lvl-up.ogg" },
    { key: "swordHit1", path: "/assets/sounds/hit-sword-1.ogg" },
    { key: "swordHit2", path: "/assets/sounds/hit-sword-2.ogg" },
    { key: "swordSwing1", path: "/assets/sounds/swing-sword-1.ogg" },
    { key: "shieldBlock", path: "/assets/sounds/block-shield.ogg" },
    { key: "bowShoot", path: "/assets/sounds/shoot-bow.ogg" },
    { key: "bowHit", path: "/assets/sounds/hit-bow.ogg" },
    { key: "spearThrust1", path: "/assets/sounds/thrust-spear-1.ogg" },
    { key: "spearThrust2", path: "/assets/sounds/thrust-spear-2.ogg" },
    { key: "spearThrust3", path: "/assets/sounds/thrust-spear-3.ogg" },
    { key: "spearHit", path: "/assets/sounds/hit-spear.ogg" },
    { key: "spearBlock", path: "/assets/sounds/block-spear.ogg" },
  ];

  private static enemySpriteSheets: SpriteSheetConfig[] = [
    {
      key: "Red_warrior_idle",
      path: "/assets/Units/Red Units/Warrior/Warrior_Idle.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_warrior_run",
      path: "/assets/Units/Red Units/Warrior/Warrior_Run.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_warrior_attack1",
      path: "/assets/Units/Red Units/Warrior/Warrior_Attack1.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_warrior_attack2",
      path: "/assets/Units/Red Units/Warrior/Warrior_Attack2.png",
      frameWidth: 192,
      frameHeight: 192,
    },
  ];

  private static enemyAudios: AudioConfig[] = [
    { key: "deathEnemy", path: "/assets/sounds/death-enemy.ogg" },
  ];

  private static environmentImages: ImageConfig[] = [
    { key: "Overworld", path: "/assets/Overworld.png" },
    { key: "red_pixel", path: "/assets/red_pixel.png" },
    { key: "arrow", path: "/assets/Units/Blue Units/Archer/Arrow.png" },
    { key: "Tilemap_color1", path: "/assets/Terrain/Tilemap_color1.png" },
    { key: "Tilemap_color2", path: "/assets/Terrain/Tilemap_color2.png" },
    { key: "Tilemap_color3", path: "/assets/Terrain/Tilemap_color3.png" },
    { key: "Collisions", path: "/assets/Collisions.png" },
    {
      key: "Water_Background_color",
      path: "/assets/Terrain/Water Background color.png",
    },
  ];

  private static buildingImages: ImageConfig[] = [
    { key: "RedTower", path: "/assets/Buildings/Red Buildings/RedTower.png" },
    {
      key: "RedCastle",
      path: "/assets/Buildings/Red Buildings/RedCastle.png",
    },
    { key: "RedHouse1", path: "/assets/Buildings/Red Buildings/RedHouse1.png" },
    { key: "RedHouse2", path: "/assets/Buildings/Red Buildings/RedHouse2.png" },
    { key: "RedHouse3", path: "/assets/Buildings/Red Buildings/RedHouse3.png" },
  ];

  private static treeSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "Tree1",
      path: "/assets/Decorations/Trees/Tree1.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Tree2",
      path: "/assets/Decorations/Trees/Tree2.png",
      frameWidth: 192,
      frameHeight: 256,
    },
    {
      key: "Tree3",
      path: "/assets/Decorations/Trees/Tree3.png",
      frameWidth: 192,
      frameHeight: 147,
    },
    {
      key: "Tree4",
      path: "/assets/Decorations/Trees/Tree4.png",
      frameWidth: 192,
      frameHeight: 147,
    },
  ];

  private static bushSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "Bushe1",
      path: "/assets/Decorations/Bushes/Bushe1.png",
      frameWidth: 128,
      frameHeight: 80,
    },
    {
      key: "Bushe2",
      path: "/assets/Decorations/Bushes/Bushe2.png",
      frameWidth: 128,
      frameHeight: 76,
    },
    {
      key: "Bushe3",
      path: "/assets/Decorations/Bushes/Bushe3.png",
      frameWidth: 128,
      frameHeight: 84,
    },
    {
      key: "Bushe4",
      path: "/assets/Decorations/Bushes/Bushe4.png",
      frameWidth: 128,
      frameHeight: 80,
    },
  ];

  private static rockImages: ImageConfig[] = [
    { key: "Rock1", path: "/assets/Decorations/Rocks/Rock1.png" },
    { key: "Rock2", path: "/assets/Decorations/Rocks/Rock2.png" },
    { key: "Rock3", path: "/assets/Decorations/Rocks/Rock3.png" },
    { key: "Rock4", path: "/assets/Decorations/Rocks/Rock4.png" },
  ];
}
