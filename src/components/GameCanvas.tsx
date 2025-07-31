import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/GameScene";

type Props = {
  characterClass: "warrior" | "archer" | "lancer";
};

const GameCanvas: React.FC<Props> = ({ characterClass }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

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

    const game = new Phaser.Game(config);
    game.scene.start("GameScene", { characterClass });

    return () => {
      game.destroy(true);
    };
  }, [characterClass]);

  return <div id="game-container" ref={container} />;
};

export default GameCanvas;
