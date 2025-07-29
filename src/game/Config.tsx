import type { GameSave } from "./GameState";

export const DefaultPlayerSettings: GameSave = {
  player: {
    x: 400,
    y: 300,
    health: 100,
    level: 1,
  },
};
