import React, { useState } from "react";
import GameCanvas from "./GameCanvas";

type Props = {
  onBack: () => void;
};

const GameScreen: React.FC<Props> = ({ onBack }) => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);

  return (
    <div className="game-and-ui-wrapper">
      <GameCanvas />
      <div className="game-ui">
        <p className="ui-item">Życie: {playerHealth}</p>
        <p className="ui-item">Poziom: {playerLevel}</p>
        <button className="ui-item" onClick={() => alert("Otwórz ekwipunek!")}>
          Ekwipunek
        </button>
        <button className="ui-item back-button" onClick={onBack}>
          ← Powrót do menu
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
