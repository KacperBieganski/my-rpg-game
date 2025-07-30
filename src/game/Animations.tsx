import Phaser from "phaser";

export function createPlayerAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: "player_warrior_idle",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_idle", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_warrior_run",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_run", {
      start: 0,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_warrior_attack1",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_attack1", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "player_warrior_attack2",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_attack2", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "player_archer_idle",
    frames: scene.anims.generateFrameNumbers("Blue_archer_idle", {
      start: 0,
      end: 5,
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_archer_run",
    frames: scene.anims.generateFrameNumbers("Blue_archer_run", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_archer_shoot",
    frames: scene.anims.generateFrameNumbers("Blue_archer_shoot", {
      start: 0,
      end: 7,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "Red_NPC_idle",
    frames: scene.anims.generateFrameNumbers("Red_warrior_idle", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "Red_NPC_run",
    frames: scene.anims.generateFrameNumbers("Red_warrior_run", {
      start: 0,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "Red_NPC_attack1",
    frames: scene.anims.generateFrameNumbers("Red_warrior_attack1", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "Red_NPC_attack2",
    frames: scene.anims.generateFrameNumbers("Red_warrior_attack2", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });
}
