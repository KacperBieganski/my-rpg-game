import GameScene from "../../GameScene";
import Navbar from "./Navbar";
import GameMenu from "./GameMenu";
import StatsMenu from "./StatsMenu";
import InventoryMenu from "./InventoryMenu";
import type { PlayerBase } from "../../player/PlayerBase";
import { GameState } from "../../GameState";

type TabName = "menu" | "stats" | "inventory";

export default class InGameMenu {
  private scene: GameScene;
  private player: PlayerBase;
  private activeTab: TabName;
  private navbar!: Navbar;
  private gameMenu!: GameMenu;
  private statsMenu!: StatsMenu;
  private inventoryMenu!: InventoryMenu;
  private isVisible = false;

  constructor(scene: GameScene, initialTab: TabName, player: PlayerBase) {
    this.scene = scene;
    this.player = player;
    this.activeTab = initialTab;

    this.navbar = new Navbar(scene, {
      onMenu: () => {
        this.show("menu");
      },
      onStats: () => {
        this.show("stats");
      },
      onInventory: () => {
        this.show("inventory");
      },
    });

    this.gameMenu = new GameMenu(scene, () => this.hide());
    this.statsMenu = new StatsMenu(scene, this.player);
    this.inventoryMenu = new InventoryMenu(scene, this.player);

    this.hide();
  }

  public show(tab?: TabName) {
    if (tab) this.activeTab = tab;

    this.navbar.show(this.activeTab);

    if (this.isVisible) {
      this.gameMenu.hide();
      this.statsMenu.hide();
      this.inventoryMenu.hide();

      if (this.activeTab === "menu") {
        this.gameMenu.show();
      } else if (this.activeTab === "stats") {
        this.statsMenu.show();
      } else if (this.activeTab === "inventory") {
        this.inventoryMenu.show();
      }
      return;
    }

    if (this.activeTab === "menu") {
      this.gameMenu.show();
    } else if (this.activeTab === "stats") {
      this.statsMenu.show();
    } else if (this.activeTab === "inventory") {
      this.inventoryMenu.show();
    }

    this.isVisible = true;
    this.scene.currentState = GameState.IN_PAUSE_MENU;
    this.scene.togglePause(true);
  }

  public hide() {
    if (!this.isVisible) return;

    this.navbar.hide();
    this.gameMenu.hide();
    this.statsMenu.hide();
    this.inventoryMenu.hide();

    this.scene.togglePause(false);
    this.isVisible = false;
    this.scene.currentState = GameState.IN_GAME;
  }

  public toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  public destroy() {
    try {
      this.scene.togglePause(false);
      this.gameMenu.destroy();
      this.statsMenu.destroy();
      this.navbar.destroy?.();
    } catch (e) {}
  }
}
