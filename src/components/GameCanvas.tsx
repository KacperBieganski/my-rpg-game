import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/GameScene";

const GameCanvas: React.FC = () => {
  const gameInstance = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameInstance.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      width: 854,
      height: 480,
      parent: containerRef.current,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
          fps: 60,
          fixedStep: true,
        },
      },
      fps: {
        target: 60,
        forceSetTimeOut: true,
      },
      scene: [GameScene],
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
    };

    gameInstance.current = new Phaser.Game(config);

    return () => {
      gameInstance.current?.destroy(true);
      gameInstance.current = null;
    };
  }, []);

  return <div ref={containerRef} className="game-container" />;
};

export default GameCanvas;
