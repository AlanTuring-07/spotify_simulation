import { Track, Artist } from '../hooks/useSpotifyData';
import { globalAudio } from '../utils/audio';

export type HUDData = { track: Track; artist: Artist } | null;

class HUDStore {
  private target: HUDData = null;
  private listeners = new Set<(val: HUDData) => void>();

  setTarget(val: HUDData) {
     // Prevent redundant re-triggers
     if (this.target?.track.id === val?.track.id) return;
     
     this.target = val;
     
     // Notify HUD UI
     this.listeners.forEach(l => l(val));

     // Route Spatial Audio
     // Filter out placeholder fake-url cases (from local Demo Mode if user has no premium)
     if (val && val.track.preview_url && val.track.preview_url !== "fake-url") {
        globalAudio.play(val.track.preview_url, val.track.id);
     } else if (!val) {
        globalAudio.stopPlayback();
     }
  }

  subscribe(listener: (val: HUDData) => void) {
      this.listeners.add(listener);
      listener(this.target); // Hydrate listener immediately
      return () => this.listeners.delete(listener);
  }

  get() { 
      return this.target; 
  }
}

export const hudStore = new HUDStore();
