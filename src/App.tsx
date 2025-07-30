import { useState } from "react";
import Menu from "./components/Menu";
import GameScreen from "./components/GameScreen";
import LoadGame from "./components/LoadGame";
import Options from "./components/Options";
import ClassSelectionModal from "./components/ClassSelectionModal";
import "./App.css";

export type View = "menu" | "game" | "load" | "options";

function App() {
  const [view, setView] = useState<View>("menu");
  const [characterClass, setCharacterClass] = useState<"warrior" | "archer">(
    "warrior"
  );
  const [showClassModal, setShowClassModal] = useState(false);

  const handleNewGame = () => {
    setShowClassModal(true);
  };

  const handleClassSelect = (cls: "warrior" | "archer") => {
    setCharacterClass(cls);
    setShowClassModal(false);
    setView("game");
  };

  const renderView = () => {
    switch (view) {
      case "menu":
        return <Menu onNewGame={handleNewGame} onSelect={setView} />;
      case "game":
        return (
          <GameScreen
            characterClass={characterClass}
            onBack={() => setView("menu")}
          />
        );
      case "load":
        return <LoadGame onBack={() => setView("menu")} />;
      case "options":
        return <Options onBack={() => setView("menu")} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderView()}
      {showClassModal && (
        <ClassSelectionModal
          onSelect={handleClassSelect}
          onClose={() => setShowClassModal(false)}
        />
      )}
    </div>
  );
}

export default App;
