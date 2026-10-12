"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function videoPoster(src: string) {
  return src
    .replace("/video/upload/", "/video/upload/so_0,w_480,q_auto/")
    .replace(/\.(mp4|webm)(\?.*)?$/i, ".jpg");
}

function VideoTile({
  src,
  active,
  onVisibilityChange,
}: {
  src: string;
  active: boolean;
  onVisibilityChange: (src: string, ratio: number) => void;
}) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasEnteredViewport(true);
        onVisibilityChange(src, entry.isIntersecting ? entry.intersectionRatio : 0);
      },
      { threshold: [0, 0.2, 0.4, 0.5, 0.75, 1] }
    );
    observer.observe(tile);

    return () => observer.disconnect();
  }, [onVisibilityChange, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      video.pause();
      return;
    }

    if (video.getAttribute("src") !== src) video.src = src;

    void video.play().catch(() => {});
  }, [active, src]);

  return (
    <div
      ref={tileRef}
      className="relative aspect-[9/16] w-64 shrink-0 snap-center overflow-hidden rounded-lg border border-[var(--border-strong)] bg-black sm:w-72"
    >
      <video
        ref={videoRef}
        poster={hasEnteredViewport ? videoPoster(src) : undefined}
        muted={muted}
        preload="none"
        loop
        playsInline
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        title={muted ? "Unmute" : "Mute"}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path d="M4 9v6h4l5 5V4L8 9H4z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 9l4 6M21 9l-4 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path d="M4 9v6h4l5 5V4L8 9H4z" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function ShoppableVideoFeed({ videos }: { videos: string[] }) {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const visibilityBySrc = useRef(new Map<string, number>());

  const updateVisibility = useCallback((src: string, ratio: number) => {
    if (ratio > 0) visibilityBySrc.current.set(src, ratio);
    else visibilityBySrc.current.delete(src);

    let mostVisibleSrc: string | null = null;
    let highestRatio = 0.5;
    for (const [candidate, candidateRatio] of visibilityBySrc.current) {
      if (candidateRatio > highestRatio) {
        mostVisibleSrc = candidate;
        highestRatio = candidateRatio;
      }
    }

    setActiveSrc((current) => (current === mostVisibleSrc ? current : mostVisibleSrc));
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="bg-white px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-serif text-3xl text-[var(--ink)]">As Seen on Instagram</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {videos.map((src) => (
            <VideoTile
              key={src}
              src={src}
              active={activeSrc === src}
              onVisibilityChange={updateVisibility}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
