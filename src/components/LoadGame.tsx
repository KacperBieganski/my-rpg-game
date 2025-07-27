import React from "react";

type Props = { onBack: () => void };

const LoadGame: React.FC<Props> = ({ onBack }) => (
  <div className="menu-container">
    <h2>Wczytaj Grę</h2>
    {/* tutaj w przyszłości lista zapisu */}
    <button onClick={onBack}>Powrót</button>
  </div>
);

export default LoadGame;
