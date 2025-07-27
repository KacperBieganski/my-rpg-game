import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import "./App.css";

function App() {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);

  return (
    <div className="app-container">
      <div className="game-and-ui-wrapper">
        <GameCanvas />
        <div className="game-ui">
          <p className="ui-item">Życie: {playerHealth}</p>
          <p className="ui-item">Poziom: {playerLevel}</p>
          <button
            className="ui-item"
            onClick={() => alert("Otwórz ekwipunek!")}
          >
            Ekwipunek
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
