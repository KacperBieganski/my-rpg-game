import { useState } from "react";
import Menu from "./components/Menu";
import GameScreen from "./components/GameScreen";
import LoadGame from "./components/LoadGame";
import Options from "./components/Options";
import "./App.css";

export type View = "menu" | "new" | "load" | "options";

function App() {
  const [view, setView] = useState<View>("menu");

  const renderView = () => {
    switch (view) {
      case "menu":
        return <Menu onSelect={setView} />;
      case "new":
        return <GameScreen onBack={() => setView("menu")} />;
      case "load":
        return <LoadGame onBack={() => setView("menu")} />;
      case "options":
        return <Options onBack={() => setView("menu")} />;
      default:
        return null;
    }
  };

  return <div className="app-container">{renderView()}</div>;
}

export default App;
