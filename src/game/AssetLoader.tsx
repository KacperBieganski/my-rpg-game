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
    scene.load.tilemapTiledJSON("level1", "/my-rpg-game/assets/startMap.json");

    // Kategorie zasobów
    this.loadAssets(scene, this.gameImages, "image");
    this.loadAssets(scene, this.playerSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.enemySpriteSheets, "spritesheet");
    this.loadAssets(scene, this.environmentImages, "image");
    this.loadAssets(scene, this.buildingImages, "image");
    this.loadAssets(scene, this.buildingSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.otherImages, "image");
    this.loadAssets(scene, this.treeSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.bushSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.rockSpriteSheets, "spritesheet");
    this.loadAssets(scene, this.rockImages, "image");

    this.loadAssets(scene, this.GameAudios, "audio");
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
          scene.load.spritesheet(ss.key, `/my-rpg-game${ss.path}`, {
            frameWidth: ss.frameWidth,
            frameHeight: ss.frameHeight,
          });
          break;
        case "image":
          const img = asset as ImageConfig;
          scene.load.image(img.key, `/my-rpg-game${img.path}`);
          break;
        case "audio":
          const aud = asset as AudioConfig;
          scene.load.audio(aud.key, `/my-rpg-game${aud.path}`);
          break;
      }
    }
  }

  // --- Definicje zasobów ---

  private static gameImages: ImageConfig[] = [
    { key: "save_icon", path: "/assets/save_icon.png" },
    { key: "background1", path: "/assets/UI/Background1.svg" },
  ];

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

  private static GameAudios: AudioConfig[] = [
    { key: "medieval-main-1", path: "/assets/soundTracks/medieval-main-1.ogg" },
    {
      key: "medieval-ambient-1",
      path: "/assets/soundTracks/medieval-ambient-1.ogg",
    },
    {
      key: "medieval-ambient-2",
      path: "/assets/soundTracks/medieval-ambient-2.ogg",
    },
    {
      key: "medieval-ambient-3",
      path: "/assets/soundTracks/medieval-ambient-3.ogg",
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
    { key: "deathScene", path: "/assets/sounds/death-scene.ogg" },
    { key: "deathPlayer", path: "/assets/sounds/death-player.ogg" },
  ];

  private static enemySpriteSheets: SpriteSheetConfig[] = [
    // Dead
    {
      key: "Dead1",
      path: "/assets/Units/Dead/Dead1.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Dead2",
      path: "/assets/Units/Dead/Dead2.png",
      frameWidth: 128,
      frameHeight: 128,
    },

    // Red GoblinTorch
    {
      key: "Red_goblinTorch_idle",
      path: "/assets/Units/Red Units/Goblin/GoblinTorch/Goblin_Torch_Idle.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTorch_run",
      path: "/assets/Units/Red Units/Goblin/GoblinTorch/Goblin_Torche_Run.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTorch_right_attack",
      path: "/assets/Units/Red Units/Goblin/GoblinTorch/Goblin_Torche_Right_Attack.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTorch_down_attack",
      path: "/assets/Units/Red Units/Goblin/GoblinTorch/Goblin_Torche_Down_Attack.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTorch_up_attack",
      path: "/assets/Units/Red Units/Goblin/GoblinTorch/Goblin_Torche_Up_Attack.png",
      frameWidth: 192,
      frameHeight: 192,
    },

    // Red GoblinTNT
    {
      key: "Red_goblinTNT_idle",
      path: "/assets/Units/Red Units/Goblin/GoblinTNT/Goblin_TNT_Idle.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTNT_run",
      path: "/assets/Units/Red Units/Goblin/GoblinTNT/Goblin_TNT_Run.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Red_goblinTNT_attack",
      path: "/assets/Units/Red Units/Goblin/GoblinTNT/Goblin_TNT_Attack.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Dynamite",
      path: "/assets/Units/Red Units/Goblin/GoblinTNT/Dynamite.png",
      frameWidth: 64,
      frameHeight: 64,
    },
    {
      key: "Explosions",
      path: "/assets/Effects/Explosions.png",
      frameWidth: 192,
      frameHeight: 192,
    },

    // Red GoblinBarrel
    {
      key: "Red_goblinBarrel_Idle",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_Idle.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Red_goblinBarrel_Run",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_Run.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Red_goblinBarrel_Hide",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_Hide.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Red_goblinBarrel_Show",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_Show.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Red_goblinBarrel_ShowStatic",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_ShowStatic.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "Red_goblinBarrel_Explode",
      path: "/assets/Units/Red Units/Goblin/GoblinBarrel/Goblin_Barrel_Explode.png",
      frameWidth: 128,
      frameHeight: 128,
    },
  ];

  private static enemyAudios: AudioConfig[] = [
    { key: "deathGoblin1", path: "/assets/sounds/death-goblin1.ogg" },
    { key: "deathGoblin2", path: "/assets/sounds/death-goblin2.ogg" },
    { key: "torchHit1", path: "/assets/sounds/hit-torch-1.ogg" },
    { key: "torchSwing1", path: "/assets/sounds/swing-torch-1.ogg" },
    { key: "torchSwing2", path: "/assets/sounds/swing-torch-2.ogg" },
    { key: "torchSwing3", path: "/assets/sounds/swing-torch-3.ogg" },
    { key: "explosion", path: "/assets/sounds/explosion-1.ogg" },
    { key: "throw", path: "/assets/sounds/throw.ogg" },
    { key: "openBox", path: "/assets/sounds/open-box.ogg" },
    { key: "closeBox", path: "/assets/sounds/open-box.ogg" },
  ];

  private static environmentImages: ImageConfig[] = [
    { key: "Red_pixel", path: "/assets/red_pixel.png" },
    { key: "Arrow", path: "/assets/Units/Blue Units/Archer/Arrow.png" },
    { key: "Tilemap", path: "/assets/Terrain/Tilemap.png" },
    { key: "Tilemap_color1", path: "/assets/Terrain/Tilemap_color1.png" },
    { key: "Tilemap_color2", path: "/assets/Terrain/Tilemap_color2.png" },
    { key: "Tilemap_color3", path: "/assets/Terrain/Tilemap_color3.png" },
    { key: "Collisions", path: "/assets/Collisions.png" },
    {
      key: "Water_Elevation",
      path: "/assets/Terrain/Water_Elevation.png",
    },
    {
      key: "Water_Background_color",
      path: "/assets/Terrain/Water Background color.png",
    },
  ];

  private static buildingImages: ImageConfig[] = [
    { key: "RedTower3", path: "/assets/Buildings/Red_Buildings/RedTower3.png" },
    {
      key: "RedCastle1",
      path: "/assets/Buildings/Red_Buildings/RedCastle1.png",
    },
    { key: "RedHouse1", path: "/assets/Buildings/Red_Buildings/RedHouse1.png" },
    { key: "RedHouse2", path: "/assets/Buildings/Red_Buildings/RedHouse2.png" },
    { key: "RedHouse3", path: "/assets/Buildings/Red_Buildings/RedHouse3.png" },
    {
      key: "RedCottage1",
      path: "/assets/Buildings/Red_Buildings/RedCottage1.png",
    },
  ];

  private static buildingSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "RedTower1",
      path: "/assets/Buildings/Red_Buildings/RedTower1_Sprite.png",
      frameWidth: 256,
      frameHeight: 170,
    },
  ];

  private static otherImages: ImageConfig[] = [
    { key: "Signpost1", path: "/assets/Decorations/Other/Signpost1.png" },
    { key: "RedBarrel", path: "/assets/Decorations/Other/RedBarrel.png" },
    { key: "Signpost2", path: "/assets/Decorations/Other/Signpost2.png" },
    { key: "Bone1", path: "/assets/Decorations/Other/Bone1.png" },
    { key: "Bone2", path: "/assets/Decorations/Other/Bone2.png" },
    { key: "Mine1", path: "/assets/Decorations/Other/Mine1.png" },
    { key: "Mine2", path: "/assets/Decorations/Other/Mine2.png" },
    { key: "Mine3", path: "/assets/Decorations/Other/Mine3.png" },
    { key: "Mushroom1", path: "/assets/Decorations/Other/Mushroom1.png" },
    { key: "Mushroom2", path: "/assets/Decorations/Other/Mushroom2.png" },
    { key: "Mushroom3", path: "/assets/Decorations/Other/Mushroom3.png" },
    { key: "Pumpkin1", path: "/assets/Decorations/Other/Pumpkin1.png" },
    { key: "Pumpkin2", path: "/assets/Decorations/Other/Pumpkin2.png" },
    { key: "Scarecrow", path: "/assets/Decorations/Other/Scarecrow.png" },
    { key: "Trunk", path: "/assets/Decorations/Other/Trunk.png" },
    { key: "Skull", path: "/assets/Decorations/Other/Skull.png" },
    { key: "Ruins1", path: "/assets/Buildings/Ruins/Ruins1.png" },
    { key: "Ruins2", path: "/assets/Buildings/Ruins/Ruins2.png" },
    { key: "Ruins3", path: "/assets/Buildings/Ruins/Ruins3.png" },
    { key: "Ruins4", path: "/assets/Buildings/Ruins/Ruins4.png" },
    { key: "Ruins5", path: "/assets/Buildings/Ruins/Ruins5.png" },
  ];

  private static treeSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "Tree1",
      path: "/assets/Decorations/Trees/Tree1_Sprite.png",
      frameWidth: 192,
      frameHeight: 192,
    },
    {
      key: "Tree2",
      path: "/assets/Decorations/Trees/Tree2_Sprite.png",
      frameWidth: 192,
      frameHeight: 256,
    },
    {
      key: "Tree3",
      path: "/assets/Decorations/Trees/Tree3_Sprite.png",
      frameWidth: 192,
      frameHeight: 147,
    },
    {
      key: "Tree4",
      path: "/assets/Decorations/Trees/Tree4_Sprite.png",
      frameWidth: 192,
      frameHeight: 147,
    },
  ];

  private static bushSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "Bushe1",
      path: "/assets/Decorations/Bushes/Bushe1_Sprite.png",
      frameWidth: 128,
      frameHeight: 80,
    },
    {
      key: "Bushe2",
      path: "/assets/Decorations/Bushes/Bushe2_Sprite.png",
      frameWidth: 128,
      frameHeight: 76,
    },
    {
      key: "Bushe3",
      path: "/assets/Decorations/Bushes/Bushe3_Sprite.png",
      frameWidth: 128,
      frameHeight: 84,
    },
    {
      key: "Bushe4",
      path: "/assets/Decorations/Bushes/Bushe4_Sprite.png",
      frameWidth: 128,
      frameHeight: 80,
    },
  ];

  private static rockSpriteSheets: SpriteSheetConfig[] = [
    {
      key: "RockWater1",
      path: "/assets/Decorations/Rocks/RockWater1_Sprite.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "RockWater2",
      path: "/assets/Decorations/Rocks/RockWater2_Sprite.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "RockWater3",
      path: "/assets/Decorations/Rocks/RockWater3_Sprite.png",
      frameWidth: 128,
      frameHeight: 128,
    },
    {
      key: "RockWater4",
      path: "/assets/Decorations/Rocks/RockWater4_Sprite.png",
      frameWidth: 128,
      frameHeight: 128,
    },
  ];
  private static rockImages: ImageConfig[] = [
    { key: "Rock1", path: "/assets/Decorations/Rocks/Rock1.png" },
    { key: "Rock2", path: "/assets/Decorations/Rocks/Rock2.png" },
    { key: "Rock3", path: "/assets/Decorations/Rocks/Rock3.png" },
    { key: "Rock4", path: "/assets/Decorations/Rocks/Rock4.png" },
  ];
}
