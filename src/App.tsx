import { useState } from "react";
import GameScreen from "./components/GameScreen";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameStart = () => {
    setGameStarted(true);
  };

  return (
    <div className="app-container">
      {gameStarted ? (
        <GameScreen />
      ) : (
        <div className="start-screen">
          <h1>Moje RPG</h1>
          <button onClick={handleGameStart}>Rozpocznij grę</button>
        </div>
      )}
    </div>
  );
}

export default App;
