export type StarTarget = { name: string; popularity: number; color: string } | null;

class TargetingStore {
  private target: StarTarget = null;
  private listeners = new Set<(val: StarTarget) => void>();

  // Bridging high-frequency loop to React safely
  setTarget(val: StarTarget) {
     // Performance optimization: prevent unnecessary UI re-rendering
     if (this.target?.name === val?.name) return; 
     
     this.target = val;
     this.listeners.forEach(l => l(val));
  }

  subscribe(listener: (val: StarTarget) => void) {
      this.listeners.add(listener);
      listener(this.target); 
      return () => this.listeners.delete(listener);
  }

  get() { return this.target; }
}

export const targetingStore = new TargetingStore();
