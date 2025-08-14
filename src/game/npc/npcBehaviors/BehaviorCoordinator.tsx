import { NpcBase } from "../NpcBase";
import { IdleBehavior } from "./IdleBehavior";
import { ChaseBehavior } from "./ChaseBehavior";
import { MaintainDistanceBehavior } from "./MaintainDistanceBehavior";

export class BehaviorCoordinator {
  protected npc: NpcBase;
  public idleBehavior: IdleBehavior;
  protected chaseBehavior: ChaseBehavior;
  protected maintainDistanceBehavior: MaintainDistanceBehavior;

  constructor(npc: NpcBase) {
    this.npc = npc;
    this.idleBehavior = new IdleBehavior(npc);
    this.chaseBehavior = new ChaseBehavior(npc);
    this.maintainDistanceBehavior = new MaintainDistanceBehavior(npc);
  }

  public handlePlayerDetection(distanceToPlayer: number) {
    if (!this.npc.isStatic) {
      if (
        this.npc.shouldMaintainDistance &&
        this.npc.distanceFromPlayer !== undefined
      ) {
        this.maintainDistanceBehavior.handleMaintainDistance(distanceToPlayer);
      } else {
        this.chaseBehavior.handleStandardMovement(distanceToPlayer);

        if (
          distanceToPlayer <= this.npc.attackRange &&
          !this.npc.attackCooldown &&
          !this.npc.isAttacking
        ) {
          this.npc.attack();
        }
      }
    } else if (
      distanceToPlayer <= this.npc.attackRange &&
      !this.npc.attackCooldown &&
      !this.npc.isAttacking
    ) {
      this.npc.attack();
    }
  }

  public handleIdleBehavior() {
    this.idleBehavior.handleIdleBehavior();
  }
}
