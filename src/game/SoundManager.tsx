import Phaser from "phaser";

export class SoundManager {
  private static instance: SoundManager;
  private soundsVolume: number;
  private activeSounds: Phaser.Sound.BaseSound[] = [];

  private constructor() {
    const savedVolume = localStorage.getItem("soundsVolume");
    this.soundsVolume = savedVolume ? parseFloat(savedVolume) : 0.6;
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(
    scene: Phaser.Scene,
    key: string,
    config?: Phaser.Types.Sound.SoundConfig
  ): Phaser.Sound.BaseSound {
    const sound = scene.sound.add(key, {
      ...config,
      volume: (config?.volume || 1) * this.soundsVolume,
    });
    sound.play();
    this.activeSounds.push(sound);
    sound.once("complete", () => {
      this.activeSounds = this.activeSounds.filter((s) => s !== sound);
    });
    return sound;
  }

  public playInstance(
    sound: Phaser.Sound.BaseSound,
    config?: Phaser.Types.Sound.SoundConfig
  ): void {
    const webAudioSound = sound as Phaser.Sound.WebAudioSound;
    webAudioSound.setVolume((config?.volume || 1) * this.soundsVolume);
    if (config?.detune) {
      webAudioSound.setDetune(config.detune);
    }
    if (config?.rate) {
      webAudioSound.setRate(config.rate);
    }
    if (!sound.isPlaying && !sound.isPaused) {
      sound.play(config);
    }
    this.activeSounds.push(sound);
    sound.once("complete", () => {
      this.activeSounds = this.activeSounds.filter((s) => s !== sound);
    });
  }

  public setVolume(volume: number) {
    this.soundsVolume = Phaser.Math.Clamp(volume, 0, 3);
    this.activeSounds.forEach((sound) => {
      (sound as Phaser.Sound.WebAudioSound).setVolume(this.soundsVolume);
    });
    localStorage.setItem("soundsVolume", this.soundsVolume.toString());
  }

  public getVolume(): number {
    return this.soundsVolume;
  }
}
