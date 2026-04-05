export class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private fadingAudio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private fadeInterval: any = null;
  private stopInterval: any = null;

  play(url: string, trackId: string) {
    if (this.currentTrackId === trackId) return; 
    
    // Smooth crossfade / stop before playing new track
    this.stopPlayback(() => {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0;
        
        // Browsers block autoplay unless unlocked. 'Start Engine' click handles this.
        audio.play().catch(e => console.warn("Audio play blocked", e));
        
        this.currentAudio = audio;
        this.currentTrackId = trackId;
        
        // 300ms Fade-in (10 steps of 30ms)
        let vol = 0;
        this.fadeInterval = setInterval(() => {
           vol = Math.min(1, vol + 0.1);
           if (this.currentAudio) this.currentAudio.volume = vol;
           if (vol >= 1) clearInterval(this.fadeInterval);
        }, 30);
    });
  }

  stopPlayback(callback?: () => void) {
     if (this.fadeInterval) clearInterval(this.fadeInterval);
     if (this.stopInterval) clearInterval(this.stopInterval);

     // CRITICAL BUG FIX: Hard clear any currently orphaned fading audio 
     // so it doesn't play forever if this function is aggressively re-triggered
     if (this.fadingAudio) {
         this.fadingAudio.pause();
         this.fadingAudio.src = "";
         this.fadingAudio = null;
     }

     if (!this.currentAudio) {
         if (callback) callback();
         return;
     }
     
     const audioRef = this.currentAudio;
     this.fadingAudio = audioRef; // Track it!
     this.currentAudio = null;
     this.currentTrackId = null;
     
     // 300ms Fade-out (10 steps of 30ms)
     let vol = audioRef.volume;
     this.stopInterval = setInterval(() => {
         vol = Math.max(0, vol - 0.1);
         audioRef.volume = vol;
         if (vol <= 0) {
            clearInterval(this.stopInterval);
            audioRef.pause();
            audioRef.src = ""; // Clear memory buffers
            if (this.fadingAudio === audioRef) this.fadingAudio = null;
            if (callback) callback();
         }
     }, 30);
  }
}

// Global audio engine singleton ensures only ONE track preview plays at a time
export const globalAudio = new AudioManager();
