import React from "react";

type Props = {
  onClose: () => void;
};

const OptionsModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="options-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Opcje</h2>
        <div className="options-content">
          <div className="option-item">
            <label>Dźwięk:</label>
            <input type="range" min="0" max="100" />
          </div>
          <div className="option-item">
            <label>Muzyka:</label>
            <input type="range" min="0" max="100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsModal;
