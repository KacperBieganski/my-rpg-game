import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/GameScene";

const GameCanvas: React.FC = () => {
  const gameInstance = useRef<Phaser.Game | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || gameInstance.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 25 * 32,
      height: 18 * 32,
      parent: container.current,
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [GameScene],
    };

    gameInstance.current = new Phaser.Game(config);

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);

  return <div id="game-container" ref={container} />;
};

export default GameCanvas;
