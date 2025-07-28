import Phaser from "phaser";

export function createPlayerAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: "idle",
    frames: scene.anims.generateFrameNumbers("warrior_idle", {
      start: 0,
      end: 7,
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "run",
    frames: scene.anims.generateFrameNumbers("warrior_run", {
      start: 0,
      end: 5,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "attack1",
    frames: scene.anims.generateFrameNumbers("warrior_attack1", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });

  scene.anims.create({
    key: "attack2",
    frames: scene.anims.generateFrameNumbers("warrior_attack2", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: 0,
  });
}
