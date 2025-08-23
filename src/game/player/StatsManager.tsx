export class StatsManager {
  // Podstawowe statystyki
  public maxHealth: number;
  public health: number;
  public maxStamina: number;
  public currentStamina: number;
  public attackDamage: number;
  public speed: number;

  // Statystyki regeneracji
  public regenRate: number;
  public regenDelay: number;
  public staminaRegenRate: number;
  public staminaRegenDelay: number;

  // Statystyki krytyczne
  public critChance: number;
  public critDamageMultiplier: number;

  // Pozostałe statystyki
  public level: number;
  public experience: number;
  public nextLevelExp: number;
  public levelPoints: number;
  public gold: number;

  constructor(initialStats: Partial<StatsManager> = {}) {
    // Ustaw domyślne wartości lub te z initialStats
    this.maxHealth = initialStats.maxHealth ?? 100;
    this.health = initialStats.health ?? this.maxHealth;
    this.maxStamina = initialStats.maxStamina ?? 100;
    this.currentStamina = initialStats.currentStamina ?? this.maxStamina;
    this.attackDamage = initialStats.attackDamage ?? 10;
    this.speed = initialStats.speed ?? 200;
    this.regenRate = initialStats.regenRate ?? 5;
    this.regenDelay = initialStats.regenDelay ?? 5000;
    this.staminaRegenRate = initialStats.staminaRegenRate ?? 10;
    this.staminaRegenDelay = initialStats.staminaRegenDelay ?? 2000;
    this.critChance = initialStats.critChance ?? 0.1;
    this.critDamageMultiplier = initialStats.critDamageMultiplier ?? 1.5;
    this.level = initialStats.level ?? 1;
    this.experience = initialStats.experience ?? 0;
    this.nextLevelExp = initialStats.nextLevelExp ?? 100;
    this.levelPoints = initialStats.levelPoints ?? 0;
    this.gold = initialStats.gold ?? 0;
  }

  // Metody do modyfikacji statystyk
  public addHealth(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public reduceHealth(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public addStamina(amount: number): void {
    this.currentStamina = Math.min(
      this.maxStamina,
      this.currentStamina + amount
    );
  }

  public reduceStamina(amount: number): boolean {
    if (this.currentStamina < amount) return false;
    this.currentStamina -= amount;
    return true;
  }

  public addExperience(amount: number): void {
    this.experience += amount;
  }

  // Metoda do serializacji (do zapisu)
  public serialize(): any {
    return {
      maxHealth: this.maxHealth,
      health: this.health,
      maxStamina: this.maxStamina,
      currentStamina: this.currentStamina,
      attackDamage: this.attackDamage,
      speed: this.speed,
      regenRate: this.regenRate,
      regenDelay: this.regenDelay,
      staminaRegenRate: this.staminaRegenRate,
      staminaRegenDelay: this.staminaRegenDelay,
      critChance: this.critChance,
      critDamageMultiplier: this.critDamageMultiplier,
      level: this.level,
      experience: this.experience,
      nextLevelExp: this.nextLevelExp,
      levelPoints: this.levelPoints,
      gold: this.gold,
    };
  }

  // Metoda do deserializacji (do wczytania)
  public deserialize(data: any): void {
    Object.assign(this, data);
  }
}
