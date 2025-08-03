import React from "react";
import GameCanvas from "./GameCanvas";

const GameScreen: React.FC = () => {
  return (
    <div className="game-and-ui-wrapper">
      <GameCanvas />
    </div>
  );
};

export default GameScreen;
