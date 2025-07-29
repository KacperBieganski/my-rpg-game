import React, { useState } from "react";
import GameState from "../game/GameState";

type SaveSlot = {
  id: number;
  date: string;
};

type Props = {
  onClose: () => void;
};

const SaveGameModal: React.FC<Props> = ({ onClose }) => {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(() => {
    // Wczytaj zapisy z localStorage
    const saved = localStorage.getItem("gameSaves");
    return saved ? JSON.parse(saved) : Array(4).fill(null);
  });

  const saveGame = (slotId: number) => {
    const player = (window as any)
      .phaserPlayer as import("../game/Player").Player;
    GameState.current.player = player.getSaveData();
    GameState.saveToSlot(slotId);

    const updatedSaves = JSON.parse(localStorage.getItem("gameSaves") || "[]");
    setSaveSlots(updatedSaves);

    onClose();
    alert(`Gra zapisana w slocie ${slotId + 1}`);
  };

  return (
    <div className="modal-overlay">
      <div className="save-game-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Wybierz miejsce zapisu</h2>
        <div className="save-slots">
          {saveSlots.map((slot, index) => (
            <div
              key={index}
              className="save-slot"
              onClick={() => saveGame(index)}
            >
              {slot ? (
                <>
                  <p>Zapis {index + 1}</p>
                  <p>Data: {slot.date}</p>
                </>
              ) : (
                <p>Puste miejsce {index + 1}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaveGameModal;
