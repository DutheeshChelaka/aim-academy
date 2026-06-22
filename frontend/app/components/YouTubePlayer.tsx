'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

// What the parent can call on this player
export interface YouTubePlayerHandle {
  seekTo: (seconds: number) => void;
}

interface YouTubePlayerProps {
  // The embed URL from your DB, e.g. https://www.youtube.com/embed/G4ugMm8YhjE
  videoUrl: string;
}

// Pull the 11-char video id out of an embed/watch/short URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Load the YT IFrame API script once, shared across all players
let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => resolve();
  });
  return apiPromise;
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoUrl }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const videoId = extractVideoId(videoUrl);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(seconds, true);
          playerRef.current.playVideo?.();
        }
      },
    }));

    useEffect(() => {
      if (!videoId || !containerRef.current) return;
      let cancelled = false;

      loadYouTubeApi().then(() => {
        if (cancelled || !containerRef.current) return;
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
          },
        });
      });

      return () => {
        cancelled = true;
        playerRef.current?.destroy?.();
        playerRef.current = null;
      };
    }, [videoId]);

    if (!videoId) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white/70 text-sm">
          Can&apos;t load this video.
        </div>
      );
    }

    // YT.Player replaces this div with the iframe
    return <div ref={containerRef} className="w-full h-full" />;
  },
);

YouTubePlayer.displayName = 'YouTubePlayer';
export default YouTubePlayer;