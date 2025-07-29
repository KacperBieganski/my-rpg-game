import React, { useState } from "react";
import GameCanvas from "./GameCanvas";
import GameMenuModal from "./GameMenuModal";

type Props = {
  onBack: () => void;
};

const GameScreen: React.FC<Props> = ({ onBack }) => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="game-and-ui-wrapper">
      <GameCanvas />
      <div className="game-ui">
        <p className="ui-item">HP: {playerHealth}</p>
        <p className="ui-item">LVL: {playerLevel}</p>
        <button
          className="ui-item menu-button"
          onClick={() => setShowMenu(true)}
        >
          Menu
        </button>
      </div>

      {showMenu && (
        <GameMenuModal onClose={() => setShowMenu(false)} onMainMenu={onBack} />
      )}
    </div>
  );
};

export default GameScreen;
