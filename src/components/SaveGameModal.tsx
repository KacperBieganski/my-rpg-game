import React from "react";

type Props = {
  onClose: () => void;
};

const SaveGameModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="save-game-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Wybierz miejsce zapisu</h2>
        <div className="save-slots">
          <div className="save-slot"></div>
        </div>
      </div>
    </div>
  );
};

export default SaveGameModal;
