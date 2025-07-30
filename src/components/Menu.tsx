import React from "react";

type Props = {
  onSelect: (view: "game" | "load" | "options") => void;
  onNewGame: () => void;
};

const Menu: React.FC<Props> = ({ onSelect, onNewGame }) => {
  return (
    <div className="menu-container">
      <h1>Moje RPG</h1>
      <div className="menu-buttons">
        <button onClick={onNewGame}>Nowa gra</button>
        <button onClick={() => onSelect("load")}>Wczytaj grę</button>
        <button onClick={() => onSelect("options")}>Opcje</button>
      </div>
    </div>
  );
};

export default Menu;
