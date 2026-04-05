import { useState } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyData } from './hooks/useSpotifyData';
import { Cosmos } from './components/Cosmos';
import { Music, Loader2, Rocket } from 'lucide-react';
import * as THREE from 'three';

import { HUD } from './components/HUD';
import { TargetingHUD } from './components/TargetingHUD';

function App() {
  const { isAuthenticated, login, logout, accessToken } = useSpotifyAuth();
  const { data: solarSystems, loading, error } = useSpotifyData(accessToken);
  const [engineStarted, setEngineStarted] = useState(false);

  // Unauthenticated Launch Screen
  if (!isAuthenticated || !accessToken) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1534796636912-3652de0dbda6?q=80&w=2666&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0" />
        
        <div className="z-10 bg-white/10 p-10 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl flex flex-col items-center text-center max-w-md w-full">
          <div className="bg-spotify-green p-4 rounded-full mb-6 relative">
             <div className="absolute inset-0 bg-spotify-green rounded-full blur-xl opacity-50 animate-pulse"></div>
             <Music className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Spotify Universe</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Discover your music taste in a cinematic 3D galaxy. Your top artists are stars, and tracks are planets.
          </p>
          <button
            onClick={login}
            className="group relative px-8 py-4 bg-spotify-green text-white font-bold rounded-full overflow-hidden transition-transform transform hover:scale-105 shadow-[0_0_20px_rgba(29,185,84,0.4)] hover:shadow-[0_0_30px_rgba(29,185,84,0.6)] w-full"
          >
            <span className="relative z-10">Connect to Spotify</span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </button>
        </div>
      </div>
    );
  }

  // Pre-Flight Lobby (Data pipeline mapped, waiting to inject audio context)
  if (solarSystems && !engineStarted) {
     return (
        <div className="h-screen w-screen bg-[#050510] text-white flex flex-col relative items-center justify-center p-8 overflow-y-auto">
            <div className="absolute top-4 left-4 z-50">
              <h1 className="text-xl font-bold tracking-widest text-white/50">THE SPOTIFY SOLAR SYSTEM</h1>
            </div>
            <div className="absolute top-4 right-4 z-50">
               <button onClick={logout} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded-full backdrop-blur-sm border border-white/10 transition-colors">
                  Disconnect
               </button>
            </div>

            <div className="max-w-2xl text-center z-10">
                <Rocket className="w-16 h-16 text-spotify-green mx-auto mb-6 animate-bounce" />
                <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-white mb-4 drop-shadow-lg">
                    Galaxy Mapped.
                </h2>
                <p className="text-gray-400 mb-12 text-xl leading-relaxed max-w-lg mx-auto">
                   We successfully plotted {solarSystems.length} solar systems based on your listening habits. Audio contextualization is ready.
                </p>
                <button
                    onClick={() => {
                        setEngineStarted(true);
                        // Safely unlock ThreeJS AudioContext to satisfy Browser Auto-Play policies
                        if (THREE.AudioContext) {
                            const ctx = THREE.AudioContext.getContext() as unknown as AudioContext;
                            if (ctx && ctx.state === 'suspended') {
                                ctx.resume();
                            }
                        }
                    }}
                    className="group relative px-12 py-5 bg-white text-black font-extrabold text-xl rounded-full overflow-hidden transition-transform transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.8)]"
                >
                    <span className="relative z-10 uppercase tracking-widest">Start Engine</span>
                    <div className="absolute inset-0 bg-spotify-green transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </button>
            </div>
            
            {/* Background design */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
               <div className="w-[800px] h-[800px] rounded-full border border-white/5 absolute"></div>
               <div className="w-[600px] h-[600px] rounded-full border border-white/10 absolute"></div>
               <div className="w-[400px] h-[400px] rounded-full border border-white/20 absolute shadow-[0_0_100px_rgba(29,185,84,0.1)]"></div>
            </div>
        </div>
     );
  }

  // Engine is started! Render the actual 3D Space Cosmos
  if (engineStarted && solarSystems) {
      return (
         <div className="h-screen w-screen relative">
            <div className="absolute top-4 left-4 z-50 pointer-events-none">
              <h1 className="text-xl font-bold tracking-widest text-white/50 drop-shadow-md">THE SPOTIFY SOLAR SYSTEM</h1>
            </div>
            <div className="absolute top-4 right-4 z-50">
               <button onClick={logout} className="px-4 py-2 bg-white/5 hover:bg-red-500/80 text-sm font-medium rounded-full backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto">
                  Abandon Mission
               </button>
            </div>
            
            <Cosmos data={solarSystems} />
            <HUD />
            <TargetingHUD />
         </div>
      );
  }

  // Loading & Error States
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050510]">
       {loading && (
           <div className="flex flex-col items-center space-y-4">
             <Loader2 className="w-12 h-12 text-spotify-green animate-spin" />
             <p className="text-gray-400 font-mono tracking-widest">CALCULATING ORBITAL TRAJECTORIES...</p>
           </div>
       )}
       {error && (
           <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-lg max-w-lg text-center">
             <h2 className="text-xl font-bold mb-2">Data Pipeline Error</h2>
             <p>{error}</p>
             <button onClick={logout} className="mt-4 px-4 py-2 bg-white/10 rounded">Reset</button>
           </div>
       )}
    </div>
  );
}

export default App;
