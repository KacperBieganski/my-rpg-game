import Phaser from "phaser";

export function createPlayerAnimations(scene: Phaser.Scene) {
  // Warrior animations
  if (!scene.anims.exists("player_warrior_idle")) {
    scene.anims.create({
      key: "player_warrior_idle",
      frames: scene.anims.generateFrameNumbers("Blue_warrior_idle", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("player_warrior_run")) {
    scene.anims.create({
      key: "player_warrior_run",
      frames: scene.anims.generateFrameNumbers("Blue_warrior_run", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("player_warrior_attack1")) {
    scene.anims.create({
      key: "player_warrior_attack1",
      frames: scene.anims.generateFrameNumbers("Blue_warrior_attack1", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }

  if (!scene.anims.exists("player_warrior_attack2")) {
    scene.anims.create({
      key: "player_warrior_attack2",
      frames: scene.anims.generateFrameNumbers("Blue_warrior_attack2", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }

  // Archer animations

  if (!scene.anims.exists("player_archer_idle")) {
    scene.anims.create({
      key: "player_archer_idle",
      frames: scene.anims.generateFrameNumbers("Blue_archer_idle", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("player_archer_run")) {
    scene.anims.create({
      key: "player_archer_run",
      frames: scene.anims.generateFrameNumbers("Blue_archer_run", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("player_archer_shoot")) {
    scene.anims.create({
      key: "player_archer_shoot",
      frames: scene.anims.generateFrameNumbers("Blue_archer_shoot", {
        start: 0,
        end: 7,
      }),
      frameRate: 25,
      repeat: 0,
    });
  }

  // Lancer animations
  if (!scene.anims.exists("player_lancer_idle")) {
    scene.anims.create({
      key: "player_lancer_idle",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_idle", {
        start: 0,
        end: 11,
      }),
      frameRate: 15,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("player_lancer_run")) {
    scene.anims.create({
      key: "player_lancer_run",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_run", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
  if (!scene.anims.exists("player_lancer_down_attack")) {
    scene.anims.create({
      key: "player_lancer_down_attack",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_down_attack", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }
  if (!scene.anims.exists("player_lancer_downright_attack")) {
    scene.anims.create({
      key: "player_lancer_downright_attack",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_downright_attack", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }

  if (!scene.anims.exists("player_lancer_right_attack")) {
    scene.anims.create({
      key: "player_lancer_right_attack",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_right_attack", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }

  if (!scene.anims.exists("player_lancer_up_attack")) {
    scene.anims.create({
      key: "player_lancer_up_attack",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_up_attack", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }
  if (!scene.anims.exists("player_lancer_upright_attack")) {
    scene.anims.create({
      key: "player_lancer_upright_attack",
      frames: scene.anims.generateFrameNumbers("Blue_lancer_upright_attack", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }

  //Red NPC animations
  if (!scene.anims.exists("Red_NPC_idle")) {
    scene.anims.create({
      key: "Red_NPC_idle",
      frames: scene.anims.generateFrameNumbers("Red_warrior_idle", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("Red_NPC_run")) {
    scene.anims.create({
      key: "Red_NPC_run",
      frames: scene.anims.generateFrameNumbers("Red_warrior_run", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!scene.anims.exists("Red_NPC_attack1")) {
    scene.anims.create({
      key: "Red_NPC_attack1",
      frames: scene.anims.generateFrameNumbers("Red_warrior_attack1", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }

  if (!scene.anims.exists("Red_NPC_attack2")) {
    scene.anims.create({
      key: "Red_NPC_attack2",
      frames: scene.anims.generateFrameNumbers("Red_warrior_attack2", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }
}

export function createObjectsAnimations(scene: Phaser.Scene) {
  if (!scene.anims.exists("tree1_anim")) {
    for (let i = 1; i <= 4; i++) {
      scene.anims.create({
        key: `tree${i}_anim`,
        frames: scene.anims.generateFrameNumbers(`Tree${i}`, {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  if (!scene.anims.exists("bushe1_anim")) {
    for (let i = 1; i <= 4; i++) {
      scene.anims.create({
        key: `bushe${i}_anim`,
        frames: scene.anims.generateFrameNumbers(`Bushe${i}`, {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
