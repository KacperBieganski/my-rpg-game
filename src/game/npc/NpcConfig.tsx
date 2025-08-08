export interface NpcConfig {
  health: number;
  maxHealth: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  damage: number;
  attackRate: number;
  expGain: number;
  distanceFromPlayer: number;
  shouldMaintainDistance?: boolean;
}
