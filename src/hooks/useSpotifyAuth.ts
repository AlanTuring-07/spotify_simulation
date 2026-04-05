import { useState, useEffect } from 'react';

const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const clientId = 'beed892e2d3c46188e5661a08a540c5d';
const redirectUri = 'http://127.0.0.1:5173/';
const scope = 'user-top-read';
const authUrl = new URL("https://accounts.spotify.com/authorize");
const tokenUrl = "https://accounts.spotify.com/api/token";

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async () => {
    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('spotify_code_verifier', codeVerifier);
    
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('spotify_refresh_token');
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
        const payload = {
            method: 'POST',
            headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
             grant_type: 'refresh_token',
             refresh_token: refreshToken,
             client_id: clientId
            }),
        }
        
        const body = await fetch(tokenUrl, payload);
        const response = await body.json();
        
        if (response.access_token) {
            setAccessToken(response.access_token);
            setIsAuthenticated(true);
            if(response.refresh_token) {
               localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
        } else {
           localStorage.removeItem('spotify_refresh_token');
           setIsAuthenticated(false);
        }
    } catch(err) {
        console.error("Refresh token error", err)
    }
  };

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');

    if (code) {
      const codeVerifier = localStorage.getItem('spotify_code_verifier');
      if (!codeVerifier) return;
      
      try {
        const payload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        };

        const body = await fetch(tokenUrl, payload);
        const response = await body.json();

        if (response.access_token) {
          setAccessToken(response.access_token);
          if(response.refresh_token) {
            localStorage.setItem('spotify_refresh_token', response.refresh_token);
          }
          setIsAuthenticated(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
           console.error("Failed to retrieve token", response);
        }
      } catch (error) {
        console.error("Error during token exchange", error);
      }
    } else {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if(refreshToken) {
            refreshAccessToken(refreshToken);
        }
    }
  };

  useEffect(() => {
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAuthenticated, login, logout, accessToken };
};
