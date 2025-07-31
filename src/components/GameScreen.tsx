import React, { useState } from "react";
import GameCanvas from "./GameCanvas";
import GameMenuModal from "./GameMenuModal";

type Props = {
  onBack: () => void;
  characterClass: "warrior" | "archer" | "lancer";
};

const GameScreen: React.FC<Props> = ({ onBack, characterClass }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="game-and-ui-wrapper">
      <GameCanvas characterClass={characterClass} />
      <div className="game-ui">
        <p className="ui-item">HP: 100</p>
        <p className="ui-item">LVL: 1</p>
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
