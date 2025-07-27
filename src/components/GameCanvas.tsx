import { useEffect, useRef } from "react";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Tutaj wczytujesz zasoby gry (grafiki, dźwięki)
    this.load.image("player", "/src/assets/player.png"); // Przykładowy zasób
    // Pamiętaj, że ścieżki do zasobów w Vite będą względne do katalogu `public`
    // lub `src/assets` jeśli używasz loaderów Vite.
  }

  create() {
    //this.add.text(100, 100, "Witaj w grze RPG!", { fill: "#0f0" });
    this.player = this.physics.add.image(400, 300, "player");
    this.player.setCollideWorldBounds(true);

    // Przykładowe sterowanie
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    // Logika gry, ruch gracza, walka itp.
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

const GameCanvas = () => {
  const gameContainerRef = useRef(null); // Ref do elementu DOM, w którym będzie gra

  useEffect(() => {
    if (gameContainerRef.current) {
      const config = {
        type: Phaser.AUTO, // Phaser sam wybierze WebGL lub Canvas
        width: 800,
        height: 600,
        parent: gameContainerRef.current, // Tutaj wskazuje na element DOM
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 }, // Brak grawitacji dla gry 2D RPG
            debug: false, // Ustaw na true do debugowania fizyki
          },
        },
        scene: [MainScene], // Twoje sceny gry
      };

      const game = new Phaser.Game(config);

      // Opcjonalnie: Zwróć funkcję czyszczącą, aby zniszczyć instancję gry Phaser
      // gdy komponent Reacta zostanie odmontowany
      return () => {
        game.destroy(true);
      };
    }
  }, []); // Pusta tablica zależności oznacza, że useEffect uruchomi się tylko raz po zamontowaniu

  return <div id="game-container" ref={gameContainerRef} />;
};

export default GameCanvas;
