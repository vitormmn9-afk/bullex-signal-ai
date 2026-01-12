/**
 * Sistema de som avançado para notificações
 */

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext não disponível');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Erro ao tocar som:', e);
    }
  }

  /**
   * Som para novo sinal gerado
   */
  playSignalGenerated() {
    this.playTone(523.25, 0.15, 0.2); // C5
  }

  /**
   * Som para alerta de entrada (2 bips)
   */
  playEntryAlert() {
    this.playTone(880, 0.4, 0.3); // A5
    setTimeout(() => this.playTone(1046.5, 0.25, 0.3), 200); // C6
  }

  /**
   * Som para vitória
   */
  playWin() {
    this.playTone(523.25, 0.1, 0.25); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 0.25), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 0.25), 200); // G5
  }

  /**
   * Som para perda
   */
  playLoss() {
    this.playTone(392, 0.3, 0.2); // G4 (tom mais grave)
  }

  /**
   * Som para erro
   */
  playError() {
    this.playTone(220, 0.4, 0.15); // A3 (tom grave)
  }
}

export const soundSystem = new SoundSystem();
