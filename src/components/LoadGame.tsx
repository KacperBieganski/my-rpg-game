import GameState from "../game/GameState";

const LoadGame = ({ onBack }: { onBack: () => void }) => {
  const saves = JSON.parse(localStorage.getItem("gameSaves") || "[]");

  const loadSlot = (slotId: number) => {
    const success = GameState.loadFromSlot(slotId);
    if (success) {
      // otworz gre z wczytanym stanem
    }
  };

  return (
    <div className="menu-container">
      <h2>Wczytaj Grę</h2>
      <div className="menu-buttons">
        {saves.map((slot: any, index: number) => (
          <button key={index} onClick={() => loadSlot(index)}>
            {slot
              ? `Zapis ${index + 1}: ${slot.date}`
              : `Puste miejsce ${index + 1}`}
          </button>
        ))}
        <button onClick={onBack}>Powrót</button>
      </div>
    </div>
  );
};

export default LoadGame;
