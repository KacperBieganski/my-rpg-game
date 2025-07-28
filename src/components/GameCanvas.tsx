import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../scenes/GameScene";

const GameCanvas = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 25 * 32, // 800px
      height: 18 * 32, // 576px
      parent: container.current,
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 0 }, debug: true },
      },
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return <div id="game-container" ref={container} />;
};

export default GameCanvas;
