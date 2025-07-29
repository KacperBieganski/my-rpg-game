export type GameSave = {
  player: {
    x: number;
    y: number;
    health: number;
    level: number;
  };
};

class GameState {
  static current: GameSave = {
    player: {
      x: 400,
      y: 300,
      health: 100,
      level: 1,
    },
  };

  static saveToSlot(slotId: number) {
    const saves = JSON.parse(localStorage.getItem("gameSaves") || "[]");
    saves[slotId] = {
      id: slotId,
      date: new Date().toLocaleString(),
      data: GameState.current,
    };
    localStorage.setItem("gameSaves", JSON.stringify(saves));
  }

  static loadFromSlot(slotId: number): boolean {
    const saves = JSON.parse(localStorage.getItem("gameSaves") || "[]");
    if (!saves[slotId] || !saves[slotId].data) return false;
    GameState.current = saves[slotId].data;
    return true;
  }

  static clearSlot(slotId: number) {
    const saves = JSON.parse(localStorage.getItem("gameSaves") || "[]");
    saves[slotId] = null;
    localStorage.setItem("gameSaves", JSON.stringify(saves));
  }

  static resetToDefault(defaults: GameSave) {
    GameState.current = { ...defaults };
  }
}

export default GameState;
