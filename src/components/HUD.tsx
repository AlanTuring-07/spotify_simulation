import React, { useEffect, useState } from 'react';
import { hudStore, HUDData } from '../store/hudStore';
import { Music2 } from 'lucide-react';

export const HUD: React.FC = () => {
    const [target, setTarget] = useState<HUDData>(null);

    useEffect(() => {
        const unsubscribe = hudStore.subscribe(setTarget);
        return () => { unsubscribe(); };
    }, []);

    if (!target) return null;

    const { track, artist } = target;

    return (
       <div className="absolute bottom-10 right-10 z-50 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl flex items-center space-x-6 min-w-[320px]">
               {/* Visual Audio Equalizer */}
               <div className="flex space-x-1.5 items-end h-12">
                   {[1,2,3,4,5].map((bar) => (
                       <div 
                         key={bar} 
                         className="w-2 bg-spotify-green rounded-full flex-shrink-0" 
                         style={{ 
                             animation: `bounce ${0.5 + Math.random()}s infinite alternate`,
                             height: '10%'
                         }} 
                       />
                   ))}
               </div>
               
               <div>
                  <h3 className="text-white font-extrabold text-xl truncate max-w-[200px]">{track.name}</h3>
                  <p className="text-gray-400 font-medium text-sm truncate max-w-[200px]">{artist.name}</p>
                  <div className="flex space-x-3 mt-2">
                     <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white">{Math.round(track.tempo)} BPM</span>
                     {track.preview_url && track.preview_url !== "fake-url" ? (
                        <span className="text-xs font-mono bg-spotify-green/20 px-2 py-1 rounded text-spotify-green flex items-center">
                            <Music2 className="w-3 h-3 mr-1" /> AUDIO LOCK
                        </span>
                     ) : (
                        <span className="text-xs font-mono bg-red-500/20 px-2 py-1 rounded text-red-500">NO AUDIO LINK</span>
                     )}
                  </div>
               </div>
           </div>
           
           <style>
             {`
               @keyframes bounce {
                 from { height: 10%; }
                 to { height: 100%; }
               }
             `}
           </style>
       </div>
    );
};
