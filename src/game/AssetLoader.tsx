import Phaser from "phaser";

export class AssetLoader {
  static preload(scene: Phaser.Scene): void {
    // Ładowanie gracza (niebieski wojownik)
    this.loadPlayerAssets(scene);

    // Ładowanie przeciwników (czerwony wojownik)
    this.loadEnemyAssets(scene);

    // Ładowanie mapy
    scene.load.tilemapTiledJSON("level1", "../assets/map1.json");

    // Ładowanie środowiska
    this.loadEnvironmentAssets(scene);

    // Ładowanie budynków
    this.loadBuildingAssets(scene);

    // Ładowanie drzew
    this.loadTreeAssets(scene);

    // Ładowanie krzaków
    this.loadBusheAssets(scene);

    // Ładowanie kamieni
    this.loadRockAssets(scene);
  }

  private static loadPlayerAssets(scene: Phaser.Scene): void {
    // Warrior
    scene.load.spritesheet(
      "Blue_warrior_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Idle.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Blue_warrior_run",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Run.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Blue_warrior_attack1",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack1.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Blue_warrior_attack2",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack2.png",
      { frameWidth: 192, frameHeight: 192 }
    );

    // Archer
    scene.load.spritesheet(
      "Blue_archer_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Idle.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Blue_archer_run",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Run.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Blue_archer_shoot",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Shoot.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.image(
      "arrow",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Arrow.png"
    );

    // Lancer
    scene.load.spritesheet(
      "Blue_lancer_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_Idle.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_run",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_Run.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_down_attack",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_Down_Attack.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_downright_attack",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_DownRight_Attack.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_right_attack",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_Right_Attack.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_up_attack",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_Up_Attack.png",
      { frameWidth: 320, frameHeight: 320 }
    );
    scene.load.spritesheet(
      "Blue_lancer_upright_attack",
      "/assets/Tiny Swords (Free Pack)/Units/Blue Units/Lancer/Lancer_UpRight_Attack.png",
      { frameWidth: 320, frameHeight: 320 }
    );
  }

  private static loadEnemyAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet(
      "Red_warrior_idle",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Idle.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Red_warrior_run",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Run.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Red_warrior_attack1",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Attack1.png",
      { frameWidth: 192, frameHeight: 192 }
    );
    scene.load.spritesheet(
      "Red_warrior_attack2",
      "/assets/Tiny Swords (Free Pack)/Units/Red Units/Warrior/Warrior_Attack2.png",
      { frameWidth: 192, frameHeight: 192 }
    );
  }

  private static loadEnvironmentAssets(scene: Phaser.Scene): void {
    scene.load.image(
      "landscapes2",
      "/assets/Tiny Swords (Free Pack)/Terrain/Tilemap_color2.png"
    );
    scene.load.image(
      "water",
      "/assets/Tiny Swords (Free Pack)/Terrain/Water Background color.png"
    );
  }

  private static loadBuildingAssets(scene: Phaser.Scene): void {
    scene.load.image(
      "RedTower",
      "/assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/Tower.png"
    );
    scene.load.image(
      "RedCastle",
      "/assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/Castle.png"
    );
    scene.load.image(
      "RedHouse2",
      "/assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/House2.png"
    );
    scene.load.image(
      "RedHouse3",
      "/assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/House3.png"
    );
    scene.load.image(
      "RedHouse1",
      "/assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/House1.png"
    );
  }

  private static loadTreeAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet(
      "Tree1",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree1.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Tree2",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree2.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Tree3",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree3.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Tree4",
      "/assets/Tiny Swords (Free Pack)/Decorations/Trees/Tree4.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  }

  private static loadBusheAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet(
      "Bushe1",
      "/assets/Tiny Swords (Free Pack)/Decorations/Bushes/Bushe1.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Bushe2",
      "/assets/Tiny Swords (Free Pack)/Decorations/Bushes/Bushe2.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Bushe3",
      "/assets/Tiny Swords (Free Pack)/Decorations/Bushes/Bushe3.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Bushe4",
      "/assets/Tiny Swords (Free Pack)/Decorations/Bushes/Bushe4.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  }

  private static loadRockAssets(scene: Phaser.Scene): void {
    scene.load.spritesheet(
      "Rock1",
      "/assets/Tiny Swords (Free Pack)/Decorations/Rocks/Rock1.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Rock2",
      "/assets/Tiny Swords (Free Pack)/Decorations/Rocks/Rock2.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Rock3",
      "/assets/Tiny Swords (Free Pack)/Decorations/Rocks/Rock3.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    scene.load.spritesheet(
      "Rock4",
      "/assets/Tiny Swords (Free Pack)/Decorations/Rocks/Rock4.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  }
}
