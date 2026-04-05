import { useState, useEffect } from 'react';

export type Track = {
  id: string;
  name: string;
  tempo: number;
  valence: number;
  preview_url: string | null;
};

export type Artist = {
  id: string;
  name: string;
  popularity: number;
  color: string;
};

export type SolarSystem = {
  artist: Artist;
  tracks: Track[];
};

const ARTIST_COLORS = [
  '#ffd700', // Gold
  '#ff003c', // Neon Red
  '#a8d8ff', // Ice Blue
  '#ffb3c6', // Pastel Pink
  '#8a2be2', // Blue Violet
  '#00ff00', // Neon Green
  '#ff00ff', // Magenta
  '#fffb00', // Bright Yellow
  '#00ffff', // Cyan
  '#ff1493'  // Deep Pink
];

const DEMO_SOLAR_SYSTEMS: SolarSystem[] = [
  {
    artist: { id: "1", name: "Daft Punk", popularity: 95, color: '#ffd700' },
    tracks: [
      { id: "dp1", name: "Get Lucky", tempo: 116, valence: 0.8, preview_url: "/songs/daft funk/Get_Lucky_hook.mp3" },
      { id: "dp2", name: "One More Time", tempo: 123, valence: 0.9, preview_url: "/songs/daft funk/One_More_Time_hook.mp3" },
      { id: "dp3", name: "Around the World", tempo: 121, valence: 0.6, preview_url: "/songs/daft funk/Around_the_World_hook.mp3" },
      { id: "dp4", name: "Harder, Better...", tempo: 123, valence: 0.7, preview_url: "/songs/daft funk/Harder_Better_Faster_Stronger_hook.mp3" },
      { id: "dp5", name: "Something About Us", tempo: 100, valence: 0.3, preview_url: "/songs/daft funk/Something_About_Us_hook.mp3" },
      { id: "dp6", name: "Robot Rock", tempo: 111, valence: 0.5, preview_url: "/songs/daft funk/Robot_Rock_hook.mp3" },
      { id: "dp7", name: "Da Funk", tempo: 111, valence: 0.6, preview_url: "/songs/daft funk/Da_Funk_hook.mp3" },
      { id: "dp8", name: "Aerodynamic", tempo: 122, valence: 0.7, preview_url: "/songs/daft funk/Aerodynamic_hook.mp3" },
      { id: "dp9", name: "Instant Crush", tempo: 109, valence: 0.5, preview_url: "/songs/daft funk/Instant_Crush_hook.mp3" },
      { id: "dp10", name: "Lose Yourself to Dance", tempo: 100, valence: 0.8, preview_url: "/songs/daft funk/Lose_Yourself_to_Dance_hook.mp3" }
    ]
  },
  {
    artist: { id: "2", name: "The Weeknd", popularity: 98, color: '#ff003c' },
    tracks: [
      { id: "wk1", name: "Blinding Lights", tempo: 171, valence: 0.3, preview_url: "/songs/the weekend/Blinding_Lights_hook.mp3" },
      { id: "wk2", name: "Starboy", tempo: 186, valence: 0.5, preview_url: "/songs/the weekend/Starboy_hook.mp3" },
      { id: "wk3", name: "Save Your Tears", tempo: 118, valence: 0.6, preview_url: "/songs/the weekend/Save_Your_Tears_hook.mp3" },
      { id: "wk4", name: "The Hills", tempo: 113, valence: 0.1, preview_url: "/songs/the weekend/The_Hills_hook.mp3" },
      { id: "wk5", name: "Die For You", tempo: 133, valence: 0.5, preview_url: "/songs/the weekend/Die_For_You_hook.mp3" },
      { id: "wk6", name: "Can't Feel My Face", tempo: 108, valence: 0.6, preview_url: "/songs/the weekend/Cant_Feel_My_Face_hook.mp3" },
      { id: "wk7", name: "Call Out My Name", tempo: 134, valence: 0.2, preview_url: "/songs/the weekend/Call_Out_My_Name_hook.mp3" },
      { id: "wk8", name: "Heartless", tempo: 170, valence: 0.2, preview_url: "/songs/the weekend/Heartless_hook.mp3" },
      { id: "wk9", name: "I Feel It Coming", tempo: 93, valence: 0.7, preview_url: "/songs/the weekend/I_Feel_It_Coming_hook.mp3" },
      { id: "wk10", name: "Earned It", tempo: 120, valence: 0.3, preview_url: "/songs/the weekend/Earned_It_hook.mp3" }
    ]
  },
  {
    artist: { id: "3", name: "Hans Zimmer", popularity: 88, color: '#a8d8ff' },
    tracks: [
      { id: "hz1", name: "Time", tempo: 60, valence: 0.05, preview_url: "/songs/hans zimmer /Time_hook.mp3" },
      { id: "hz2", name: "Cornfield Chase", tempo: 96, valence: 0.1, preview_url: "/songs/hans zimmer /Cornfield_Chase_hook.mp3" },
      { id: "hz3", name: "S.T.A.Y.", tempo: 50, valence: 0.1, preview_url: "fake-url" },
      { id: "hz4", name: "No Time For Caution", tempo: 120, valence: 0.2, preview_url: "fake-url" },
      { id: "hz5", name: "Day One", tempo: 80, valence: 0.15, preview_url: "fake-url" },
      { id: "hz6", name: "Mountains", tempo: 75, valence: 0.1, preview_url: "fake-url" },
      { id: "hz7", name: "Now We Are Free", tempo: 85, valence: 0.4, preview_url: "fake-url" },
      { id: "hz8", name: "A Dark Knight", tempo: 90, valence: 0.2, preview_url: "fake-url" },
      { id: "hz9", name: "Chevaliers de Sangreal", tempo: 65, valence: 0.3, preview_url: "fake-url" },
      { id: "hz10", name: "Supermarine", tempo: 130, valence: 0.1, preview_url: "fake-url" }
    ]
  },
  {
    artist: { id: "4", name: "Taylor Swift", popularity: 100, color: '#ffb3c6' },
    tracks: [
      { id: "ts1", name: "Cruel Summer", tempo: 170, valence: 0.7, preview_url: "/songs/taylorswift/Cruel_Summer_hook.mp3" },
      { id: "ts2", name: "Anti-Hero", tempo: 97, valence: 0.5, preview_url: "/songs/taylorswift/Anti-Hero_hook.mp3" },
      { id: "ts3", name: "Blank Space", tempo: 96, valence: 0.6, preview_url: "/songs/taylorswift/Blank_Space_hook.mp3" },
      { id: "ts4", name: "Style", tempo: 95, valence: 0.5, preview_url: "/songs/taylorswift/Style_hook.mp3" },
      { id: "ts5", name: "Shake It Off", tempo: 160, valence: 0.9, preview_url: "fake-url" },
      { id: "ts6", name: "Lover", tempo: 68, valence: 0.4, preview_url: "/songs/taylorswift/Lover_hook.mp3" },
      { id: "ts7", name: "Lavender Haze", tempo: 97, valence: 0.3, preview_url: "/songs/taylorswift/Lavender_Haze_hook.mp3" },
      { id: "ts8", name: "Karma", tempo: 90, valence: 0.8, preview_url: "/songs/taylorswift/Karma_hook.mp3" },
      { id: "ts9", name: "August", tempo: 90, valence: 0.4, preview_url: "/songs/taylorswift/August_hook.mp3" },
      { id: "ts10", name: "Love Story", tempo: 119, valence: 0.7, preview_url: "/songs/taylorswift/Love_Story_hook.mp3" }
    ]
  },
  {
    artist: { id: "5", name: "Kendrick Lamar", popularity: 96, color: '#8a2be2' },
    tracks: [
      { id: "kl1", name: "HUMBLE.", tempo: 150, valence: 0.4, preview_url: "/songs/kendrik lamar/Humble_hook.mp3" },
      { id: "kl2", name: "DNA.", tempo: 140, valence: 0.4, preview_url: "/songs/kendrik lamar/DNA_hook.mp3" },
      { id: "kl3", name: "All The Stars", tempo: 97, valence: 0.5, preview_url: "/songs/kendrik lamar/All_The_Stars_hook.mp3" },
      { id: "kl4", name: "Alright", tempo: 110, valence: 0.6, preview_url: "/songs/kendrik lamar/Alright_hook.mp3" },
      { id: "kl5", name: "m.A.A.d city", tempo: 91, valence: 0.2, preview_url: "fake-url" },
      { id: "kl6", name: "Swimming Pools", tempo: 74, valence: 0.3, preview_url: "fake-url" },
      { id: "kl7", name: "Money Trees", tempo: 72, valence: 0.5, preview_url: "fake-url" },
      { id: "kl8", name: "Bitch, Don't Kill My Vibe", tempo: 134, valence: 0.4, preview_url: "fake-url" },
      { id: "kl9", name: "LOYALTY.", tempo: 111, valence: 0.4, preview_url: "fake-url" },
      { id: "kl10", name: "Not Like Us", tempo: 101, valence: 0.8, preview_url: "/songs/kendrik lamar/Not_Like_Us_hook.mp3" }
    ]
  },
  {
    artist: { id: "6", name: "Billie Eilish", popularity: 95, color: '#00ff00' },
    tracks: [
      { id: "be1", name: "bad guy", tempo: 135, valence: 0.6, preview_url: "/songs/billie eilsh/Bad_Guy_hook.mp3" },
      { id: "be2", name: "ocean eyes", tempo: 145, valence: 0.2, preview_url: "/songs/billie eilsh/Ocean_Eyes_hook.mp3" },
      { id: "be3", name: "when the party's over", tempo: 83, valence: 0.1, preview_url: "/songs/billie eilsh/When_The_Partys_Over_hook.mp3" },
      { id: "be4", name: "Happier Than Ever", tempo: 81, valence: 0.3, preview_url: "/songs/billie eilsh/Happier_Than_Ever_hook.mp3" },
      { id: "be5", name: "everything i wanted", tempo: 120, valence: 0.2, preview_url: "/songs/billie eilsh/Everything_I_Wanted_hook.mp3" },
      { id: "be6", name: "bury a friend", tempo: 120, valence: 0.2, preview_url: "fake-url" },
      { id: "be7", name: "lovely", tempo: 115, valence: 0.1, preview_url: "/songs/billie eilsh/Lovely_hook.mp3" },
      { id: "be8", name: "Therefore I Am", tempo: 94, valence: 0.7, preview_url: "/songs/billie eilsh/Therefore_I_Am_hook.mp3" },
      { id: "be9", name: "What Was I Made For?", tempo: 78, valence: 0.1, preview_url: "/songs/billie eilsh/What_Was_I_Made_For_hook.mp3" },
      { id: "be10", name: "LUNCH", tempo: 125, valence: 0.8, preview_url: "/songs/billie eilsh/Lunch_hook.mp3" }
    ]
  },
  {
    artist: { id: "7", name: "Queen", popularity: 90, color: '#ff00ff' },
    tracks: [
      { id: "q1", name: "Bohemian Rhapsody", tempo: 71, valence: 0.2, preview_url: "/songs/queen/Bohemian_Rhapsody_hook.mp3" },
      { id: "q2", name: "Don't Stop Me Now", tempo: 156, valence: 0.7, preview_url: "/songs/queen/Dont_Stop_Me_Now_hook.mp3" },
      { id: "q3", name: "Another One Bites The Dust", tempo: 110, valence: 0.8, preview_url: "/songs/queen/Another_One_Bites_The_Dust_hook.mp3" },
      { id: "q4", name: "Under Pressure", tempo: 114, valence: 0.5, preview_url: "/songs/queen/Under_Pressure_hook.mp3" },
      { id: "q5", name: "We Will Rock You", tempo: 81, valence: 0.5, preview_url: "/songs/queen/We_Will_Rock_You_hook.mp3" },
      { id: "q6", name: "We Are The Champions", tempo: 64, valence: 0.3, preview_url: "/songs/queen/We_Are_The_Champions_hook.mp3" },
      { id: "q7", name: "Somebody To Love", tempo: 110, valence: 0.4, preview_url: "/songs/queen/Somebody_To_Love_hook.mp3" },
      { id: "q8", name: "Killer Queen", tempo: 117, valence: 0.6, preview_url: "/songs/queen/Killer_Queen_hook.mp3" },
      { id: "q9", name: "Radio Ga Ga", tempo: 112, valence: 0.5, preview_url: "/songs/queen/Radio_Ga_Ga_hook.mp3" },
      { id: "q10", name: "I Want To Break Free", tempo: 109, valence: 0.7, preview_url: "/songs/queen/I_Want_To_Break_Free_hook.mp3" }
    ]
  },
  {
    artist: { id: "10", name: "Dua Lipa", popularity: 94, color: '#ff1493' },
    tracks: [
      { id: "dl1", name: "Levitating", tempo: 103, valence: 0.9, preview_url: "/songs/dua lipa /Levitating_hook.mp3" },
      { id: "dl2", name: "Don't Start Now", tempo: 124, valence: 0.7, preview_url: "/songs/dua lipa /Dont_Start_Now_hook.mp3" },
      { id: "dl3", name: "Dance The Night", tempo: 110, valence: 0.8, preview_url: "/songs/dua lipa /Dance_The_Night_hook.mp3" },
      { id: "dl4", name: "Cold Heart", tempo: 122, valence: 0.8, preview_url: "/songs/dua lipa /Cold_Heart_hook.mp3" },
      { id: "dl5", name: "One Kiss", tempo: 124, valence: 0.6, preview_url: "/songs/dua lipa /One_Kiss_hook.mp3" },
      { id: "dl6", name: "Houdini", tempo: 117, valence: 0.7, preview_url: "/songs/dua lipa /Houdini_hook.mp3" },
      { id: "dl7", name: "Physical", tempo: 147, valence: 0.7, preview_url: "/songs/dua lipa /Physical_hook.mp3" },
      { id: "dl8", name: "Break My Heart", tempo: 113, valence: 0.7, preview_url: "/songs/dua lipa /Break_My_Heart_hook.mp3" },
      { id: "dl9", name: "New Rules", tempo: 116, valence: 0.6, preview_url: "/songs/dua lipa /New_Rules_hook.mp3" },
      { id: "dl10", name: "IDGAF", tempo: 97, valence: 0.5, preview_url: "fake-url" }
    ]
  }
];

export const useSpotifyData = (accessToken: string | null) => {
  const [data, setData] = useState<SolarSystem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchConfig = {
          headers: { Authorization: `Bearer ${accessToken}` }
        };

        const artistsRes = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', fetchConfig);
        
        let shouldFallbackToDemo = false;

        if (!artistsRes.ok) {
            const errorText = await artistsRes.text();
            if (artistsRes.status === 403) {
               console.warn("Spotify API blocked access (403 Forbidden). Falling back to DEMO mode.");
               shouldFallbackToDemo = true;
            } else {
               throw new Error(`Failed to fetch top artists: ${artistsRes.status} ${errorText}`);
            }
        }

        if (shouldFallbackToDemo) {
            setData(DEMO_SOLAR_SYSTEMS);
            return;
        }

        const artistsData = await artistsRes.json();
        
        const topArtists: Artist[] = artistsData.items.map((a: any, index: number) => ({
          id: a.id,
          name: a.name,
          popularity: a.popularity,
          color: ARTIST_COLORS[index % ARTIST_COLORS.length] // Fallback color mapping for real data
        }));

        if (topArtists.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }

        const solarSystemsUnpopulated: { artist: Artist, tracksInfo: any[] }[] = [];

        for (const artist of topArtists) {
          const tracksRes = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`, fetchConfig);
          if (!tracksRes.ok) {
             const errorText = await tracksRes.text();
             if (tracksRes.status === 403) {
                 console.warn("Spotify API blocked tracks access (403 Forbidden). Falling back to DEMO mode.");
                 setData(DEMO_SOLAR_SYSTEMS);
                 return;
             }
             throw new Error(`Failed to fetch tracks for ${artist.name}: ${tracksRes.status} ${errorText}`);
          }
          const tracksData = await tracksRes.json();
          // Filter to 10 for the new size
          const validTracks = tracksData.tracks.filter((t: any) => t.preview_url !== null).slice(0, 10);
          
          solarSystemsUnpopulated.push({
             artist,
             tracksInfo: validTracks
          });
        }

        const allTrackIds = solarSystemsUnpopulated.flatMap(sys => sys.tracksInfo.map(t => t.id));
        let audioFeaturesMap: Record<string, { tempo: number; valence: number }> = {};
        
        // Spotify ids parameter takes exactly up to 100 max
        if (allTrackIds.length > 0) {
           const idChunks = [];
           for (let i = 0; i < allTrackIds.length; i += 100) {
               idChunks.push(allTrackIds.slice(i, i + 100));
           }

           for (const chunk of idChunks) {
               const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`, fetchConfig);
               if (!featuresRes.ok) throw new Error("Failed to fetch audio features");
               const featuresData = await featuresRes.json();
               
               featuresData.audio_features.forEach((feature: any) => {
                  if (feature) {
                     audioFeaturesMap[feature.id] = {
                       tempo: feature.tempo,
                       valence: feature.valence
                     };
                  }
               });
           }
        }

        const finalData: SolarSystem[] = solarSystemsUnpopulated.map(sys => {
           const enrichedTracks: Track[] = sys.tracksInfo.map((t: any) => {
                const features = audioFeaturesMap[t.id];
                return {
                   id: t.id,
                   name: t.name,
                   preview_url: t.preview_url,
                   tempo: features ? features.tempo : 120,
                   valence: features ? features.valence : 0.5 
                };
             });
             
           return {
             artist: sys.artist,
             tracks: enrichedTracks
           };
        });

        setData(finalData);

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  return { data, loading, error };
};
