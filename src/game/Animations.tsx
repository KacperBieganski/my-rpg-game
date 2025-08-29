import Phaser from "phaser";

type AnimationConfig = {
  key: string;
  sprite: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
};

export function createPlayerAnimations(scene: Phaser.Scene) {
  const animations: AnimationConfig[] = [
    // Dead
    {
      key: "dead_anim1",
      sprite: "Dead1",
      start: 0,
      end: 6,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "dead_anim2",
      sprite: "Dead2",
      start: 0,
      end: 6,
      frameRate: 12,
      repeat: 0,
    },

    // Warrior
    {
      key: "player_warrior_idle",
      sprite: "Blue_warrior_idle",
      start: 0,
      end: 7,
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "player_warrior_run",
      sprite: "Blue_warrior_run",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_warrior_attack1",
      sprite: "Blue_warrior_attack1",
      start: 0,
      end: 3,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "player_warrior_attack2",
      sprite: "Blue_warrior_attack2",
      start: 0,
      end: 3,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "player_warrior_guard",
      sprite: "Blue_warrior_guard",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },

    // Archer
    {
      key: "player_archer_idle",
      sprite: "Blue_archer_idle",
      start: 0,
      end: 5,
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "player_archer_run",
      sprite: "Blue_archer_run",
      start: 0,
      end: 3,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_archer_shoot",
      sprite: "Blue_archer_shoot",
      start: 0,
      end: 7,
      frameRate: 25,
      repeat: 0,
    },

    // Lancer idle/run
    {
      key: "player_lancer_idle",
      sprite: "Blue_lancer_idle",
      start: 0,
      end: 11,
      frameRate: 15,
      repeat: -1,
    },
    {
      key: "player_lancer_run",
      sprite: "Blue_lancer_run",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },

    // Lancer attacks
    {
      key: "player_lancer_down_attack",
      sprite: "Blue_lancer_down_attack",
      start: 0,
      end: 2,
      frameRate: 13,
      repeat: 0,
    },
    {
      key: "player_lancer_downright_attack",
      sprite: "Blue_lancer_downright_attack",
      start: 0,
      end: 2,
      frameRate: 13,
      repeat: 0,
    },
    {
      key: "player_lancer_right_attack",
      sprite: "Blue_lancer_right_attack",
      start: 0,
      end: 2,
      frameRate: 13,
      repeat: 0,
    },
    {
      key: "player_lancer_up_attack",
      sprite: "Blue_lancer_up_attack",
      start: 0,
      end: 2,
      frameRate: 13,
      repeat: 0,
    },
    {
      key: "player_lancer_upright_attack",
      sprite: "Blue_lancer_upright_attack",
      start: 0,
      end: 2,
      frameRate: 13,
      repeat: 0,
    },

    // Lancer defences
    {
      key: "player_lancer_down_defence",
      sprite: "Blue_lancer_down_defence",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_lancer_downright_defence",
      sprite: "Blue_lancer_downright_defence",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_lancer_right_defence",
      sprite: "Blue_lancer_right_defence",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_lancer_up_defence",
      sprite: "Blue_lancer_up_defence",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "player_lancer_upright_defence",
      sprite: "Blue_lancer_upright_defence",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },

    // Red GoblinTorch
    {
      key: "Red_goblinTorch_idle",
      sprite: "Red_goblinTorch_idle",
      start: 0,
      end: 6,
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "Red_goblinTorch_run",
      sprite: "Red_goblinTorch_run",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Red_goblinTorch_right_attack",
      sprite: "Red_goblinTorch_right_attack",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "Red_goblinTorch_down_attack",
      sprite: "Red_goblinTorch_down_attack",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "Red_goblinTorch_up_attack",
      sprite: "Red_goblinTorch_up_attack",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: 0,
    },

    // Red GoblinTNT
    {
      key: "Red_goblinTNT_idle",
      sprite: "Red_goblinTNT_idle",
      start: 0,
      end: 5,
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "Red_goblinTNT_run",
      sprite: "Red_goblinTNT_run",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Red_goblinTNT_attack",
      sprite: "Red_goblinTNT_attack",
      start: 0,
      end: 6,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "Dynamite",
      sprite: "Dynamite",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "Explosions",
      sprite: "Explosions",
      start: 0,
      end: 8,
      frameRate: 12,
      repeat: 0,
    },

    // Red GoblinBarrel
    {
      key: "Red_goblinBarrel_Hide",
      sprite: "Red_goblinBarrel_Hide",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "Red_goblinBarrel_Run",
      sprite: "Red_goblinBarrel_Run",
      start: 0,
      end: 2,
      frameRate: 12,
      repeat: -1,
    },
    {
      key: "Red_goblinBarrel_Show",
      sprite: "Red_goblinBarrel_Show",
      start: 0,
      end: 5,
      frameRate: 12,
      repeat: 0,
    },
    {
      key: "Red_goblinBarrel_Explode",
      sprite: "Red_goblinBarrel_Explode",
      start: 0,
      end: 2,
      frameRate: 8,
      repeat: 0,
    },

    // Red Pawn
    {
      key: "Red_Pawn_Idle",
      sprite: "Red_Pawn_Idle",
      start: 0,
      end: 5,
      frameRate: 8,
      repeat: -1,
    },
    {
      key: "Red_Pawn_Run",
      sprite: "Red_Pawn_Run",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Red_Pawn_Axe",
      sprite: "Red_Pawn_Axe",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: 0,
    },
    {
      key: "Red_Pawn_Hammer",
      sprite: "Red_Pawn_Hammer",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: 0,
    },
    {
      key: "Red_Pawn_Panic1",
      sprite: "Red_Pawn_Panic1",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Red_Pawn_Panic2",
      sprite: "Red_Pawn_Panic2",
      start: 0,
      end: 5,
      frameRate: 10,
      repeat: -1,
    },

    // Snake
    {
      key: "Snake_Idle",
      sprite: "Snake_Idle",
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Snake_Run",
      sprite: "Snake_Run",
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Snake_Attack",
      sprite: "Snake_Attack",
      start: 0,
      end: 7,
      frameRate: 15,
      repeat: 0,
    },

    // Bear
    {
      key: "Bear_Idle",
      sprite: "Bear_Idle",
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Bear_Run",
      sprite: "Bear_Run",
      start: 0,
      end: 4,
      frameRate: 10,
      repeat: -1,
    },
    {
      key: "Bear_Attack",
      sprite: "Bear_Attack",
      start: 0,
      end: 10,
      frameRate: 15,
      repeat: 0,
    },

    // Items
    {
      key: "LootBag_Spawn",
      sprite: "LootBag_Spawn",
      start: 0,
      end: 6,
      frameRate: 10,
      repeat: 0,
    },
  ];

  for (const anim of animations) {
    if (!scene.anims.exists(anim.key)) {
      scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers(anim.sprite, {
          start: anim.start,
          end: anim.end,
        }),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }
  }
}

export function createObjectsAnimations(scene: Phaser.Scene) {
  for (let i = 1; i <= 4; i++) {
    const treeKey = `tree${i}_anim`;
    const bushKey = `bushe${i}_anim`;
    const rockKey = `rockwater${i}_anim`;

    if (!scene.anims.exists(treeKey)) {
      scene.anims.create({
        key: treeKey,
        frames: scene.anims.generateFrameNumbers(`Tree${i}`, {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(bushKey)) {
      scene.anims.create({
        key: bushKey,
        frames: scene.anims.generateFrameNumbers(`Bushe${i}`, {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(rockKey)) {
      scene.anims.create({
        key: rockKey,
        frames: scene.anims.generateFrameNumbers(`RockWater${i}`, {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
  if (!scene.anims.exists("redTower1_anim")) {
    scene.anims.create({
      key: "redTower1_anim",
      frames: scene.anims.generateFrameNumbers(`RedTower1`, {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
