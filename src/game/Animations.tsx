import Phaser from "phaser";

export function createPlayerAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: "player_idle",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_idle", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_run",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_run", {
      start: 0,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "player_attack1",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_attack1", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "player_attack2",
    frames: scene.anims.generateFrameNumbers("Blue_warrior_attack2", {
      start: 0,
      end: 3,
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

export function createDecorationAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: "tree1",
    frames: scene.anims.generateFrameNumbers("tree1", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: "tree2",
    frames: scene.anims.generateFrameNumbers("tree2", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: "tree3",
    frames: scene.anims.generateFrameNumbers("tree3", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: "tree4",
    frames: scene.anims.generateFrameNumbers("tree4", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });
}
