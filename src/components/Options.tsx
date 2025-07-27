import React from "react";

type Props = { onBack: () => void };

const Options: React.FC<Props> = ({ onBack }) => (
  <div className="menu-container">
    <h2>Opcje</h2>
    {/* tu będą ustawienia audio itp. */}
    <button onClick={onBack}>Powrót</button>
  </div>
);

export default Options;
