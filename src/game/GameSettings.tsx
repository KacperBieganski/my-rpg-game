export const DefaultGameSettings = {
  player: {
    position: { x: 700, y: 3200 },
    level: 1,
    experience: 0,

    stamina: {
      maxStamina: 100,
      staminaRegenRate: 10,
      staminaRegenDelay: 2000,
      attackCost: 5,
      blockCost: 5,
    },

    criticalHit: {
      baseChance: 0.1,
      chancePerLevel: 0.01,
      damageMultiplier: 1.5,
    },

    warrior: {
      health: 200,
      maxHealth: 200,
      regenRate: 5,
      regenDelay: 5000,
      speed: 200,
      attackDamage: 20,
      attackRange: 100,
      attackRate: 500,
    },
    archer: {
      health: 70,
      maxHealth: 70,
      regenRate: 5,
      regenDelay: 5000,
      speed: 200,
      attackDamage: 20,
      attackRange: 400,
      attackRate: 800,
    },
    lancer: {
      health: 100,
      maxHealth: 100,
      regenRate: 5,
      regenDelay: 5000,
      speed: 200,
      attackDamage: 15,
      attackRange: 150,
      attackRate: 600,
    },
  },
  npc: {
    health: 100,
    maxHealth: 100,
    speed: 100,
    damage: 10,
    detectionRange: 200,
    attackRange: 50,
    attackRate: 1000,
    knockbackForce: 5,
    expGain: 20,
  },
};
