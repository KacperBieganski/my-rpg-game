export const GameState = {
  MAIN_MENU: "MAIN_MENU",
  IN_GAME: "IN_GAME",
  IN_PAUSE_MENU: "IN_PAUSE_MENU",
  IN_DIALOGUE: "IN_DIALOGUE",
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];
