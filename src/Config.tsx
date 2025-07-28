export const PlayerConfig = {
  // Podstawowe statystyki
  HEALTH: 100,
  SPEED: 200,
  ATTACK_DAMAGE: 20,
  ATTACK_RANGE: 80,
  ATTACK_COOLDOWN: 500, // ms

  // Regeneracja
  REGEN_RATE: 5, // HP na sekundę
  REGEN_DELAY: 5000, // ms przed rozpoczęciem regeneracji

  // Wymiary i kolizje
  SCALE: 0.7,
  BODY_WIDTH: 50,
  BODY_HEIGHT: 60,
  BODY_OFFSET_X: 74,
  BODY_OFFSET_Y: 70,

  // Pasek zdrowia
  HEALTH_BAR_WIDTH: 50,
  HEALTH_BAR_HEIGHT: 4,
  HEALTH_BAR_OFFSET_Y: -50,

  // Animacje
  ANIMATIONS: {
    IDLE: "player_idle",
    RUN: "player_run",
    ATTACK1: "player_attack1",
    ATTACK2: "player_attack2",
  },

  // Efekty wizualne
  DAMAGE_TINT: 0xff0000,
  REGEN_TINT: 0x00ff00,
  TINT_DURATION: 200, // ms
};
