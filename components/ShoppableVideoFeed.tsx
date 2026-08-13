"use client";

import { useRef, useState } from "react";

function VideoTile({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative aspect-[9/16] w-64 shrink-0 snap-center overflow-hidden rounded-lg border border-[var(--border-strong)] bg-black sm:w-72">
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        autoPlay
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

// Horizontal scroll-snap rail of short vertical clips reposted from
// Instagram — pure social-content showcase, not tied to the Product model
// at all. No shop card, no price, no add-to-bag: nothing here is meant to
// be bought, just watched. Renders nothing if there are no clips yet,
// rather than a "coming soon" placeholder.
export default function ShoppableVideoFeed({ videos }: { videos: string[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="bg-white px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-serif text-3xl text-[var(--ink)]">As Seen on Instagram</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {videos.map((src) => (
            <VideoTile key={src} src={src} />
          ))}
        </div>
      </div>
    </section>
  );
}
