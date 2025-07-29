import React, { useState } from "react";
import SaveGameModal from "./SaveGameModal";
import OptionsModal from "./OptionsModal";

type Props = {
  onClose: () => void;
  onMainMenu: () => void;
};

const GameMenuModal: React.FC<Props> = ({ onClose, onMainMenu }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleMainMenu = () => {
    if (
      confirm(
        "Czy na pewno chcesz wrócić do menu głównego? Niezapisany postęp zostanie utracony."
      )
    ) {
      onMainMenu();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="game-menu-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Menu Gry</h2>
        <div className="menu-buttons">
          <button onClick={() => setShowSaveModal(true)}>Zapisz grę</button>
          <button onClick={handleMainMenu}>Menu główne</button>
          <button onClick={() => setShowOptions(true)}>Opcje</button>
        </div>
      </div>

      {showSaveModal && (
        <SaveGameModal onClose={() => setShowSaveModal(false)} />
      )}

      {showOptions && <OptionsModal onClose={() => setShowOptions(false)} />}
    </div>
  );
};

export default GameMenuModal;
