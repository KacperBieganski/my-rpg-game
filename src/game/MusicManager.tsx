import Phaser from "phaser";

export class MusicManager {
  private static instance: MusicManager;
  private musicVolume: number;
  private activeTracks: Phaser.Sound.BaseSound[] = [];

  private constructor() {
    const savedVolume = localStorage.getItem("musicVolume");
    this.musicVolume = savedVolume ? parseFloat(savedVolume) : 0.6;
  }

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public play(
    scene: Phaser.Scene,
    key: string,
    loop: boolean = true
  ): Phaser.Sound.BaseSound {
    let track = scene.sound.get(key);
    if (!track) {
      track = scene.sound.add(key, { volume: this.musicVolume, loop });
    } else {
      (track as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
    }
    track.play();
    this.activeTracks.push(track);
    return track;
  }

  public playPlaylist(scene: Phaser.Scene, keys: string[]) {
    this.stopAll(); // zatrzymujemy starą muzykę
    let index = 0;

    const playNext = () => {
      const key = keys[index];
      let track = scene.sound.add(key, {
        volume: this.musicVolume,
        loop: false,
      });
      this.activeTracks = [track];

      track.once("complete", () => {
        index = (index + 1) % keys.length; // przejście do następnego utworu
        playNext();
      });

      track.play();
    };

    playNext();
  }

  public stopAll() {
    this.activeTracks.forEach((track) => track.stop());
    this.activeTracks = [];
  }

  public setVolume(volume: number) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 3);
    this.activeTracks.forEach((track) => {
      (track as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
    });
    localStorage.setItem("musicVolume", this.musicVolume.toString());
  }

  public getVolume() {
    return this.musicVolume;
  }
}
