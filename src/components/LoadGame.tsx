const LoadGame = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="menu-container">
      <h2>Wczytaj Grę</h2>
      <div className="menu-buttons">
        <button></button>
        <button onClick={onBack}>Powrót</button>
      </div>
    </div>
  );
};

export default LoadGame;
