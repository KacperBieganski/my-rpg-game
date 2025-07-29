import React from "react";

type Props = {
  onSelect: (view: "new" | "load" | "options" | "menu") => void;
};

const Menu: React.FC<Props> = ({ onSelect }) => (
  <div className="menu-container">
    <h1>Moje RPG</h1>
    <div className="menu-buttons">
      <button onClick={() => onSelect("new")}>Nowa gra</button>
      <button onClick={() => onSelect("load")}>Wczytaj grę</button>
      <button onClick={() => onSelect("options")}>Opcje</button>
    </div>
  </div>
);

export default Menu;
