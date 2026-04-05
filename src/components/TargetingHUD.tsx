import React, { useEffect, useState } from 'react';
import { targetingStore, StarTarget } from '../store/targetingStore';
import { Crosshair } from 'lucide-react';

export const TargetingHUD: React.FC = () => {
    const [target, setTarget] = useState<StarTarget>(null);

    useEffect(() => {
        const unsubscribe = targetingStore.subscribe(setTarget);
        return () => { unsubscribe(); };
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[60]">
            
            {/* Center Minimalist Crosshair */}
            <div className="relative flex items-center justify-center">
                <Crosshair 
                   className={`w-6 h-6 transition-all duration-300 drop-shadow-md ${target ? 'text-red-500 scale-125 opacity-80' : 'text-white/40 scale-100 opacity-30'}`} 
                />
                
                {/* HUD Data Panel (Offsets to the right of crosshair) */}
                <div className={`absolute left-12 top-0 transition-all duration-300 transform ${target ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    {target && (
                        <div className="bg-[#050510]/60 backdrop-blur-md border-l-2 border-red-500 pl-4 py-2 pr-8 shadow-2xl overflow-hidden relative">
                            <p className="text-red-500 text-[10px] font-bold font-mono tracking-widest mb-1 animate-pulse">TARGET LOCKED</p>
                            
                            {/* Terminal Typing Effect Animation */}
                            <h2 className="text-white text-xl font-black uppercase tracking-wider whitespace-nowrap overflow-hidden border-r-2 border-white pr-1"
                                style={{ animation: 'typing 1.5s steps(20, end), blink 0.75s step-end infinite' }}>
                                {target.name}
                            </h2>
                            
                            <p className="text-gray-400 text-[11px] font-mono mt-1 pt-1 border-t border-white/10">CLASS: {target.popularity > 80 ? 'SUPERGIANT' : (target.popularity > 50 ? 'GIANT' : 'DWARF')}</p>
                            <p className="text-gray-400 text-[11px] font-mono">HEAT: {target.popularity}%</p>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                @keyframes typing {
                   from { width: 0 }
                   to { width: 100% }
                }
                @keyframes blink {
                   from, to { border-color: transparent }
                   50% { border-color: white; }
                }
                `}
            </style>
        </div>
    );
};
