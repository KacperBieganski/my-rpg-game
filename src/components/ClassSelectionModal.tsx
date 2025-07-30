import React from "react";

type Props = {
  onSelect: (characterClass: "warrior" | "archer") => void;
  onClose: () => void;
};

const ClassSelectionModal: React.FC<Props> = ({ onSelect, onClose }) => {
  // Style dla wyświetlenia pierwszej ramki sprite sheetu
  const warriorSpriteStyle = {
    width: "192px",
    height: "192px",
    backgroundImage:
      "url('/assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Idle.png')",
    backgroundPosition: "0 10", // Pierwsza ramka
    imageRendering: "pixelated" as const,
  };

  const archerSpriteStyle = {
    width: "192px",
    height: "192px",
    backgroundImage:
      "url('/assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Idle.png')",
    backgroundPosition: "0 0", // Pierwsza ramka
    imageRendering: "pixelated" as const,
  };

  return (
    <div className="modal-overlay">
      <div className="class-selection-modal">
        <h2>Wybierz klasę postaci</h2>
        <div className="class-options">
          <div className="class-option">
            <div className="character-sprite" style={warriorSpriteStyle} />
            <button onClick={() => onSelect("warrior")}>Rycerz</button>
            <div className="class-description">
              Silny wojownik walczący wręcz
            </div>
          </div>

          <div className="class-option">
            <div className="character-sprite" style={archerSpriteStyle} />
            <button onClick={() => onSelect("archer")}>Łucznik</button>
            <div className="class-description">
              Zwinny strzelec atakujący z dystansu
            </div>
          </div>
        </div>
        <button className="cancel-button" onClick={onClose}>
          Anuluj
        </button>
      </div>
    </div>
  );
};

export default ClassSelectionModal;
